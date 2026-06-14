"""Telegram bridge — coordinate the COO agent by text.

A logged-out, phone-friendly control surface for the agent fleet. You message a
Telegram bot; it drives the same COO orchestrator the admin dashboard uses
(``agents.orchestrator``) and texts back the result. No app, no login screen.

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
  /help                   this help

The bot only ever *coordinates* the COO; the guardrails (money_movement + legal
hard gates, caps, dry-run) still apply exactly as in the dashboard.
"""
from __future__ import annotations

import json
import os
import urllib.parse
import urllib.request

from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User, UserRole
from models_agents import AgentRun, AgentEscalation, EscalationStatus
from agents import orchestrator
from agents.orchestrator import FleetDisabledError

router = APIRouter()


def _allowed_chat_ids() -> set[str]:
    raw = os.getenv("TELEGRAM_ALLOWED_CHAT_IDS", "")
    return {c.strip() for c in raw.split(",") if c.strip()}


def send_message(chat_id: str | int, text: str) -> None:
    """Best-effort Telegram reply. No-op (logged) if no token configured."""
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        print(f"[telegram] (no token) -> {chat_id}: {text}")
        return
    try:
        data = urllib.parse.urlencode({
            "chat_id": str(chat_id), "text": text[:4096],
            "parse_mode": "Markdown", "disable_web_page_preview": "true",
        }).encode()
        req = urllib.request.Request(
            f"https://api.telegram.org/bot{token}/sendMessage", data=data)
        urllib.request.urlopen(req, timeout=15)
    except Exception as e:
        print(f"[telegram] send failed: {type(e).__name__}: {e}")


# --------------------------------------------------------------------------- #
# Command parsing (pure, unit-testable)                                       #
# --------------------------------------------------------------------------- #
def parse_command(text: str) -> tuple[str, str]:
    """('goal', 'grow Austin') from '/goal grow Austin'. Plain text (no slash)
    is treated as a goal. Returns (command, argument)."""
    text = (text or "").strip()
    if not text:
        return ("", "")
    if not text.startswith("/"):
        return ("goal", text)
    head, _, rest = text.partition(" ")
    cmd = head[1:].split("@", 1)[0].lower()   # strip /, strip @botname suffix
    return (cmd, rest.strip())


HELP = (
    "*VenuePlus COO*\n"
    "/goal <text> — run a goal (add `| City` to target a market)\n"
    "/status — fleet state + open approvals\n"
    "/runs — recent runs\n"
    "/run <id> — run trace\n"
    "/escalations — approval queue\n"
    "/approve <id> · /reject <id>\n"
    "/kill on|off — kill switch\n"
)


def _operator_admin_id(db: Session) -> int:
    admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
    return admin.id if admin else 0


def _fmt_run(db: Session, run: AgentRun) -> str:
    s = run.summary or {}
    lines = [f"*Run #{run.id}* — {run.status.value}",
             f"goal: {run.goal[:200]}"]
    if s:
        lines.append(f"jobs {s.get('jobs_planned',0)} · actions "
                     f"{s.get('actions_executed',0)}/{s.get('actions_total',0)} "
                     f"· awaiting approval {s.get('needs_approval',0)}")
    open_escs = db.query(AgentEscalation).filter(
        AgentEscalation.run_id == run.id,
        AgentEscalation.status == EscalationStatus.OPEN).all()
    for e in open_escs:
        lines.append(f"  ⏳ #{e.id} {e.agent}/{e.tool} ({e.risk.value}) — "
                     f"/approve {e.id} · /reject {e.id}")
    return "\n".join(lines)


def process_message(db: Session, text: str) -> str:
    """Turn an inbound message into a reply string. The single place commands
    are interpreted; the webhook just does transport + auth."""
    cmd, arg = parse_command(text)

    if cmd in ("start", "help", ""):
        return HELP

    if cmd == "goal":
        if not arg:
            return "Usage: /goal <what you want done> (optional `| City`)"
        goal, _, city = arg.partition("|")
        try:
            run = orchestrator.run_goal(db, goal.strip(), (city.strip() or None))
        except FleetDisabledError:
            return "🛑 Fleet is OFF (kill switch). Turn it on: /kill off"
        return "✅ COO dispatched the fleet.\n" + _fmt_run(db, run)

    if cmd == "status":
        enabled = orchestrator.get_fleet_state(db).enabled
        n = db.query(AgentEscalation).filter(
            AgentEscalation.status == EscalationStatus.OPEN).count()
        return (f"Fleet: {'🟢 ON' if enabled else '🔴 OFF'}\n"
                f"Open approvals: {n}")

    if cmd == "runs":
        rows = db.query(AgentRun).order_by(
            AgentRun.created_at.desc(), AgentRun.id.desc()).limit(5).all()
        if not rows:
            return "No runs yet. Start one: /goal grow supply in Austin"
        return "\n".join(
            f"#{r.id} [{r.status.value}] {r.goal[:60]}" for r in rows)

    if cmd == "run":
        if not arg.isdigit():
            return "Usage: /run <id>"
        run = db.query(AgentRun).filter(AgentRun.id == int(arg)).first()
        return _fmt_run(db, run) if run else f"Run #{arg} not found"

    if cmd == "escalations":
        rows = db.query(AgentEscalation).filter(
            AgentEscalation.status == EscalationStatus.OPEN).order_by(
            AgentEscalation.created_at.desc()).all()
        if not rows:
            return "No open approvals. 🎉"
        return "\n".join(
            f"#{e.id} {e.agent}/{e.tool} ({e.risk.value}) "
            f"run #{e.run_id} — /approve {e.id} · /reject {e.id}" for e in rows)

    if cmd in ("approve", "reject"):
        if not arg.isdigit():
            return f"Usage: /{cmd} <escalation id>"
        e = db.query(AgentEscalation).filter(
            AgentEscalation.id == int(arg)).first()
        if not e:
            return f"Escalation #{arg} not found"
        if e.status != EscalationStatus.OPEN:
            return f"Escalation #{arg} already {e.status.value}"
        orchestrator.resolve_escalation(
            db, e, approve=(cmd == "approve"), admin_id=_operator_admin_id(db))
        return f"{'✅ Approved' if cmd == 'approve' else '🚫 Rejected'} #{arg} ({e.tool})"

    if cmd == "kill":
        a = arg.strip().lower()
        if a not in ("on", "off"):
            return "Usage: /kill on  (disable fleet)  |  /kill off  (enable)"
        # /kill on  -> disable the fleet (enabled=False)
        state = orchestrator.set_fleet_enabled(db, enabled=(a == "off"))
        return f"Fleet now {'🟢 ON' if state.enabled else '🔴 OFF'}"

    return f"Unknown command /{cmd}. Try /help"


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
