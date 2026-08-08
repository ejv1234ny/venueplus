"""Telegram bridge — coordinate the COO agent by text.

A logged-out, phone-friendly control surface for the agent fleet. You message a
Telegram bot; it drives the same COO orchestrator the admin dashboard uses
(``agents.orchestrator``) and texts back the result. No app, no login screen.

Natural language:
  You can just talk to it — "how's it going?", "grow supply in Austin",
  "what's waiting on me?", "approve the social post", "pause everything".
  When ``ANTHROPIC_API_KEY`` is set, an LLM maps your message to one of the
  commands below and runs it immediately, replying in plain sentences. Slash
  commands still work exactly as before (and are the deterministic fallback
  when no key is configured).

Security model (defence in depth):
  * ``TELEGRAM_BOT_TOKEN``        — the bot's API token (from @BotFather).
  * ``TELEGRAM_ALLOWED_CHAT_IDS`` — comma-separated chat ids allowed to operate
    the fleet. Anyone else is ignored. THIS IS THE AUTH — keep it tight.
  * ``TELEGRAM_WEBHOOK_SECRET``   — optional; if set, Telegram must send it in
    the ``X-Telegram-Bot-Api-Secret-Token`` header (set via setWebhook).

Commands::
  /goal <text>            run a goal across the fleet (optionally "... | <city>")
  /status                 fleet on/off + open-escalation count
  /runs                   last 5 runs
  /run <id>               one run's trace summary
  /escalations            open approval queue (ids + tool + risk)
  /approve <id>           approve a gated action
  /reject <id>            reject a gated action
  /kill on|off            disable / enable the fleet (kill switch)
  /autonomy ...           auto-outreach engine: status | on | off | pause |
                          resume | stage 0-3 (see agents/autonomy.py)
  /help                   this help

The bot only ever *coordinates* the COO; the guardrails (money_movement + legal
hard gates, caps, dry-run) still apply exactly as in the dashboard.
"""
from __future__ import annotations

import json
import os
import re
import urllib.parse
import urllib.request

from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User, UserRole
from models_agents import AgentRun, AgentEscalation, EscalationStatus
from agents import orchestrator
from agents.orchestrator import FleetDisabledError
from agents.llm import LLMProvider

router = APIRouter()

_COMMANDS = {"goal", "status", "runs", "run", "escalations",
             "approve", "reject", "kill", "help", "start", "autonomy"}


def _allowed_chat_ids() -> set[str]:
    raw = os.getenv("TELEGRAM_ALLOWED_CHAT_IDS", "")
    return {c.strip() for c in raw.split(",") if c.strip()}


def notify_operator(text: str) -> None:
    """Push a message to every allowlisted operator chat. Used by the autonomy
    engine (tick digests, circuit-breaker alerts) — best-effort, never raises."""
    for chat_id in _allowed_chat_ids():
        send_message(chat_id, text)


def send_message(chat_id: str | int, text: str) -> None:
    """Best-effort Telegram reply. No-op (logged) if no token configured."""
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        print(f"[telegram] (no token) -> {chat_id}: {text}")
        return
    try:
        data = urllib.parse.urlencode({
            "chat_id": str(chat_id), "text": text[:4096],
            "disable_web_page_preview": "true",
        }).encode()
        req = urllib.request.Request(
            f"https://api.telegram.org/bot{token}/sendMessage", data=data)
        urllib.request.urlopen(req, timeout=15)
    except Exception as e:
        print(f"[telegram] send failed: {type(e).__name__}: {e}")


# --------------------------------------------------------------------------- #
# Command parsing                                                             #
# --------------------------------------------------------------------------- #
def parse_command(text: str) -> tuple[str, str]:
    """('goal', 'grow Austin') from '/goal grow Austin'. Plain text (no slash)
    is treated as a goal. Returns (command, argument).

    NOTE: kept for the slash path and for backward-compat / unit tests. The
    webhook routes non-slash text through ``interpret_nl`` instead so casual
    messages don't all become goals.
    """
    text = (text or "").strip()
    if not text:
        return ("", "")
    if not text.startswith("/"):
        return ("goal", text)
    head, _, rest = text.partition(" ")
    cmd = head[1:].split("@", 1)[0].lower()   # strip /, strip @botname suffix
    return (cmd, rest.strip())


_INTERPRETER_SYSTEM = (
    "You translate a marketplace operator's casual message into ONE structured "
    "command for the VenuePlus COO agent bridge. Reply with ONLY a JSON object "
    "like {\"command\":\"status\",\"argument\":\"\"} and nothing else.\n\n"
    "Commands and their argument:\n"
    "- status (arg \"\"): how things are going, are we live, any updates.\n"
    "- runs (arg \"\"): recent activity / history / what have you done lately.\n"
    "- run (arg = a run id number, or \"latest\" for the most recent): show a "
    "specific run's detail.\n"
    "- escalations (arg \"\"): what needs my approval / anything waiting on me.\n"
    "- approve (arg = an escalation id number, or a short descriptor of which "
    "one e.g. \"social\"): approve a pending action. Phrases like \"yes do it\", "
    "\"go ahead\", \"approve it\" with no specifics -> argument \"\".\n"
    "- reject (arg = an escalation id number or descriptor): decline a pending "
    "action. \"no\", \"skip it\", \"don't post that\".\n"
    "- kill (arg = \"on\" to STOP/pause the fleet, \"off\" to resume it): "
    "\"stop everything\"/\"pause\" -> on; \"resume\"/\"turn it back on\" -> off.\n"
    "- goal (arg = the objective; if a city/market is named, append \" | City ST\"): "
    "any instruction to get work done, e.g. grow supply, recruit providers, "
    "find venues.\n"
    "- help (arg \"\"): what can you do / commands.\n"
    "- unknown (arg \"\"): only if the message is unintelligible or unrelated.\n\n"
    "Examples:\n"
    "\"how are things looking?\" -> {\"command\":\"status\",\"argument\":\"\"}\n"
    "\"grow supply in austin tx\" -> {\"command\":\"goal\",\"argument\":\"grow supply | Austin TX\"}\n"
    "\"recruit more caterers in miami\" -> {\"command\":\"goal\",\"argument\":\"recruit caterers | Miami FL\"}\n"
    "\"what's waiting on me?\" -> {\"command\":\"escalations\",\"argument\":\"\"}\n"
    "\"approve the social post\" -> {\"command\":\"approve\",\"argument\":\"social\"}\n"
    "\"no, skip that\" -> {\"command\":\"reject\",\"argument\":\"\"}\n"
    "\"show me the last run\" -> {\"command\":\"run\",\"argument\":\"latest\"}\n"
    "\"pause everything\" -> {\"command\":\"kill\",\"argument\":\"on\"}\n"
    "- autonomy (arg = \"status\", \"on\", \"off\", \"pause\", \"resume\", "
    "or \"stage N\"): anything about the automatic outreach engine, autosend, "
    "auto-approval, the drip, sending limits/stages.\n"
    "Respond with JSON only."
)


def interpret_nl(text: str) -> tuple[str, str]:
    """Map a free-text message to (command, argument) using the LLM. Falls back
    to deterministic heuristics when no ANTHROPIC_API_KEY is configured."""
    provider = LLMProvider()
    if not provider.is_real:
        return _heuristic(text)
    try:
        turn = provider.complete(
            system=_INTERPRETER_SYSTEM,
            messages=[{"role": "user", "content": text}],
        )
        raw = (turn.get("text") or "").strip()
        m = re.search(r"\{.*\}", raw, re.S)
        if m:
            data = json.loads(m.group(0))
            cmd = str(data.get("command", "")).lower().strip()
            arg = str(data.get("argument", "")).strip()
            if cmd in _COMMANDS or cmd == "unknown":
                return (cmd, arg)
    except Exception as e:
        print(f"[telegram] NL interpret failed: {type(e).__name__}: {e}")
    return _heuristic(text)


def _heuristic(text: str) -> tuple[str, str]:
    """Tiny keyword router for the no-LLM / failure path."""
    t = (text or "").strip().lower()
    if not t:
        return ("help", "")
    if "autonomy" in t or "autosend" in t or "auto-send" in t:
        arg = re.sub(r".*?(autonomy|autosend|auto-send)\s*", "", t, count=1)
        return ("autonomy", arg)
    if any(w in t for w in ("status", "how are", "how's it", "how is it",
                            "what's up", "whats up", "are we live", "update")):
        return ("status", "")
    if "waiting on me" in t or "need my approval" in t or "pending" in t \
            or "escalation" in t:
        return ("escalations", "")
    if t.startswith("approve") or t == "yes" or "go ahead" in t:
        return ("approve", re.sub(r"^approve\s*", "", t))
    if t.startswith("reject") or t in ("no", "skip", "skip it"):
        return ("reject", re.sub(r"^reject\s*", "", t))
    if any(w in t for w in ("pause", "stop everything", "kill")):
        return ("kill", "on")
    if any(w in t for w in ("resume", "turn it back on", "unpause")):
        return ("kill", "off")
    if "recent run" in t or t in ("runs", "history"):
        return ("runs", "")
    # Default: treat as a goal (legacy behaviour).
    return ("goal", text.strip())


# --------------------------------------------------------------------------- #
# Helpers                                                                      #
# --------------------------------------------------------------------------- #
def _operator_admin_id(db: Session):
    """Admin user id to stamp on a resolution, or None when there's no admin
    user yet. The Telegram bridge is logged-out and ``resolved_by`` is a
    nullable FK, so NULL is valid — but a bogus id like 0 violates the FK."""
    admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
    return admin.id if admin else None


def _open_escalations(db: Session, run_id: int | None = None):
    q = db.query(AgentEscalation).filter(
        AgentEscalation.status == EscalationStatus.OPEN)
    if run_id is not None:
        q = q.filter(AgentEscalation.run_id == run_id)
    return q.order_by(AgentEscalation.created_at.desc()).all()


def _resolve_escalation(db: Session, arg: str):
    """Find the escalation a user means. Returns an AgentEscalation, None
    (not found / none open), or the string 'AMBIGUOUS'."""
    arg = (arg or "").strip()
    digits = re.search(r"\d+", arg)
    if digits:
        return db.query(AgentEscalation).filter(
            AgentEscalation.id == int(digits.group(0))).first()
    opens = _open_escalations(db)
    if not opens:
        return None
    low = arg.lower()
    if low:
        for e in opens:
            if low in e.tool.lower() or low in e.agent.lower():
                return e
    if len(opens) == 1:
        return opens[0]
    return "AMBIGUOUS"


def _say_run(db: Session, run: AgentRun, *, dispatched: bool = False) -> str:
    s = run.summary or {}
    jobs = s.get("jobs_planned", 0)
    done = s.get("actions_executed", 0)
    total = s.get("actions_total", 0)
    opens = _open_escalations(db, run.id)

    bits = []
    if dispatched:
        bits.append(f'Done — I put the fleet on "{run.goal[:120]}".')
    else:
        bits.append(f"Run #{run.id} ({run.status.value}) — goal: "
                    f"{run.goal[:120]}.")
    if total:
        bits.append(f"It planned {jobs} job{'' if jobs == 1 else 's'} and "
                    f"completed {done} of {total} "
                    f"action{'' if total == 1 else 's'}.")
    if opens:
        if len(opens) == 1:
            e = opens[0]
            bits.append(f"One thing needs your OK: {e.agent}'s {e.tool} "
                        f"(#{e.id}). Say \"approve it\" or \"reject it\".")
        else:
            lst = ", ".join(f"{e.tool} (#{e.id})" for e in opens)
            bits.append(f"{len(opens)} actions need your approval: {lst}. "
                        f"Say e.g. \"approve #{opens[0].id}\".")
    elif (run.status.value or "").lower() in ("completed", "done", "success"):
        bits.append("Everything ran clean — nothing waiting on you.")
    return " ".join(bits)


def _latest_run(db: Session) -> AgentRun | None:
    return db.query(AgentRun).order_by(
        AgentRun.created_at.desc(), AgentRun.id.desc()).first()


HELP = (
    "I'm your VenuePlus COO — just talk to me. You can say things like:\n"
    "• \"how's it going?\" — current status\n"
    "• \"grow supply in Austin TX\" — kick off a goal\n"
    "• \"what's waiting on me?\" — see what needs approval\n"
    "• \"approve the social post\" / \"reject it\" — decide on a pending action\n"
    "• \"show me the last run\" — details on a run\n"
    "• \"pause everything\" / \"resume\" — kill switch\n"
    "• \"/autonomy status\" — the auto-outreach engine (on/off, stage, pause)\n"
    "Slash commands (/goal, /status, /runs, /run, /escalations, /approve, "
    "/reject, /kill, /autonomy) work too."
)


# --------------------------------------------------------------------------- #
# Dispatch                                                                     #
# --------------------------------------------------------------------------- #
def _dispatch(db: Session, cmd: str, arg: str) -> str:
    if cmd in ("start", "help", "", "unknown"):
        if cmd == "unknown":
            return ("I'm not sure what you'd like me to do. " + HELP)
        return HELP

    if cmd == "goal":
        if not arg.strip():
            return ('Tell me what you\'d like done — e.g. '
                    '"grow supply in Austin TX".')
        goal, _, city = arg.partition("|")
        try:
            run = orchestrator.run_goal(db, goal.strip(),
                                        (city.strip() or None))
        except FleetDisabledError:
            return ('The fleet is paused 🔴 (kill switch is on). '
                    'Say "resume" to turn it back on, then try again.')
        return _say_run(db, run, dispatched=True)

    if cmd == "status":
        enabled = orchestrator.get_fleet_state(db).enabled
        n = len(_open_escalations(db))
        base = ("The fleet is live 🟢" if enabled
                else "The fleet is paused 🔴 (kill switch on)")
        if n:
            return (f"{base}, and {n} action{'' if n == 1 else 's'} "
                    f"{'is' if n == 1 else 'are'} waiting for your approval. "
                    f'Say "what\'s waiting on me?" to see them.')
        return f"{base}, and there's nothing waiting on you right now."

    if cmd == "runs":
        rows = db.query(AgentRun).order_by(
            AgentRun.created_at.desc(), AgentRun.id.desc()).limit(5).all()
        if not rows:
            return ('No runs yet. Tell me something like '
                    '"grow supply in Austin" to start one.')
        body = "\n".join(
            f"• #{r.id} [{r.status.value}] {r.goal[:60]}" for r in rows)
        return "Here are the most recent runs:\n" + body

    if cmd == "run":
        run = None
        digits = re.search(r"\d+", arg or "")
        if digits:
            run = db.query(AgentRun).filter(
                AgentRun.id == int(digits.group(0))).first()
        else:
            run = _latest_run(db)
        if not run:
            return ("I couldn't find that run. Say \"recent runs\" to see "
                    "what's there.")
        return _say_run(db, run)

    if cmd == "escalations":
        rows = _open_escalations(db)
        if not rows:
            return "Nothing's waiting on you right now. 🎉"
        if len(rows) == 1:
            e = rows[0]
            return (f"One action needs your approval: {e.agent}'s {e.tool} "
                    f"(#{e.id}, {e.risk.value}) from run #{e.run_id}. "
                    f'Say "approve it" or "reject it".')
        body = "\n".join(
            f"• {e.tool} (#{e.id}) — {e.agent}, run #{e.run_id} "
            f"({e.risk.value})" for e in rows)
        return ("These actions need your approval:\n" + body
                + f'\nSay e.g. "approve #{rows[0].id}".')

    if cmd in ("approve", "reject"):
        e = _resolve_escalation(db, arg)
        if e is None:
            return ('I couldn\'t find that approval. Say "what\'s waiting on '
                    'me?" to see the open ones.')
        if e == "AMBIGUOUS":
            rows = _open_escalations(db)
            body = "\n".join(
                f"• {x.tool} (#{x.id}) — {x.agent}" for x in rows)
            return ("There's more than one pending — which did you mean?\n"
                    + body + '\nSay e.g. "approve #" plus the id.')
        if e.status != EscalationStatus.OPEN:
            return f"That one ({e.tool}, #{e.id}) is already {e.status.value}."
        orchestrator.resolve_escalation(
            db, e, approve=(cmd == "approve"),
            admin_id=_operator_admin_id(db))
        if cmd == "approve":
            return (f"Done — I approved {e.tool} (#{e.id}). "
                    "The run will carry on from there.")
        return (f"Okay — I rejected {e.tool} (#{e.id}); it won't run.")

    if cmd == "autonomy":
        from agents import autonomy as auto
        settings = auto.get_settings(db)
        a = (arg or "").strip().lower()
        if a in ("", "status"):
            brk = auto.breaker_status(db)
            cap = auto.STAGE_CAPS.get(settings.stage, 0)
            sent = auto.sent_today(db, settings)
            if settings.paused:
                state = f"paused 🔴 ({settings.pause_reason or 'manual'})"
            elif settings.enabled:
                state = "on 🟢"
            else:
                state = "off ⚪"
            return (f"Autonomy is {state} — stage {settings.stage} "
                    f"(cap {cap}/day), sent today {sent}, window "
                    f"{settings.send_window_start}:00–{settings.send_window_end}:00 "
                    f"{settings.timezone}. Trailing bounce rate: "
                    f"{brk['bounce_rate_pct']}% over {brk['window']} sends.")
        if a in ("on", "enable", "start"):
            settings.enabled = True
            settings.paused = False
            settings.pause_reason = None
            db.commit()
            return (f"Autonomy is ON 🟢 — queued outreach drains automatically "
                    f"at stage {settings.stage} "
                    f"({auto.STAGE_CAPS.get(settings.stage, 0)}/day) inside the "
                    f"send window. Say \"/autonomy pause\" any time to stop it.")
        if a in ("off", "disable", "stop"):
            settings.enabled = False
            db.commit()
            return ("Autonomy is OFF ⚪ — outreach goes back to manual "
                    "approvals only.")
        if a == "pause":
            settings.paused = True
            settings.pause_reason = "paused via Telegram"
            db.commit()
            return ("Autonomy paused 🔴 — nothing auto-sends until you say "
                    "\"/autonomy resume\".")
        if a in ("resume", "unpause"):
            settings.paused = False
            settings.pause_reason = None
            db.commit()
            return "Autonomy resumed 🟢."
        m = re.match(r"^stage\s*(\d)$", a)
        if m:
            n = int(m.group(1))
            if n not in auto.STAGE_CAPS:
                return "Stage must be 0–3 (0=off, 1=10/day, 2=25/day, 3=50/day)."
            settings.stage = n
            db.commit()
            return (f"Stage set to {n} — the daily cap is now "
                    f"{auto.STAGE_CAPS[n]} emails/day.")
        return ("Autonomy commands: /autonomy status · on · off · pause · "
                "resume · stage 0-3")

    if cmd == "kill":
        a = (arg or "").strip().lower()
        if a not in ("on", "off"):
            return ('Did you want to pause or resume the fleet? '
                    'Say "pause everything" or "resume".')
        # "on" => pause the fleet (enabled=False); "off" => resume (enabled=True)
        state = orchestrator.set_fleet_enabled(db, enabled=(a == "off"))
        if state.enabled:
            return "The fleet is live again 🟢 — it'll act on new goals."
        return ('The fleet is paused 🔴 — nothing will run until you say '
                '"resume".')

    return "I'm not sure what you meant. " + HELP


def process_message(db: Session, text: str) -> str:
    """Turn an inbound message into a reply string. Slash messages use the
    literal command; everything else is interpreted as natural language."""
    text = (text or "").strip()
    if not text:
        return HELP
    if text.startswith("/"):
        cmd, arg = parse_command(text)
    else:
        cmd, arg = interpret_nl(text)
    return _dispatch(db, cmd, arg)


# --------------------------------------------------------------------------- #
# Webhook                                                                      #
# --------------------------------------------------------------------------- #
@router.post("/webhook")
async def telegram_webhook(request: Request, db: Session = Depends(get_db)):
    # Optional shared-secret check (set when registering the webhook).
    secret = os.getenv("TELEGRAM_WEBHOOK_SECRET")
    if secret and request.headers.get(
            "x-telegram-bot-api-secret-token") != secret:
        return {"ok": True}  # silently ignore spoofed calls

    try:
        update = await request.json()
    except Exception:
        return {"ok": True}

    msg = update.get("message") or update.get("edited_message") or {}
    chat = msg.get("chat") or {}
    chat_id = chat.get("id")
    text = msg.get("text") or ""
    if chat_id is None:
        return {"ok": True}

    allowed = _allowed_chat_ids()
    if allowed and str(chat_id) not in allowed:
        send_message(chat_id, "⛔ Not authorized to operate this fleet.")
        return {"ok": True}

    try:
        reply = process_message(db, text)
    except Exception as e:
        reply = f"⚠️ Error: {type(e).__name__}: {e}"
    send_message(chat_id, reply)
    return {"ok": True}


@router.get("/health")
def telegram_health():
    return {"configured": bool(os.getenv("TELEGRAM_BOT_TOKEN")),
            "allowlisted_chats": len(_allowed_chat_ids())}
