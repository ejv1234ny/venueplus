"""Autonomy engine — the policy brain that drains the approval queue.

Today every OUTBOUND action escalates to a human (``agent_escalations``,
status OPEN) and the only resolvers are the admin dashboard/API and Telegram
``/approve``. This module adds the *automated* caller: a cron-driven tick
that approves queued outreach under a strict, observable policy envelope, so
the fleet can send real outreach with no human in the loop — inside limits a
human set once.

Policy envelope (ALL must pass before anything is auto-approved):
  * master switch   — AutonomySettings.enabled, not paused, stage >= 1
  * fleet switch    — AgentFleetState.enabled (the existing kill switch)
  * AGENTS_LIVE     — must be truthy, else the tick refuses to run at all
                      (approving during dry-run would silently no-op the queue)
  * tool allowlist  — only known outreach tools are ever auto-approved
  * recipient       — must exist, must not be suppressed, must not be a repeat
  * send window     — 9:00–17:00 America/Chicago by default
  * daily cap       — stage ladder: 0=off, 1=10/day, 2=25/day, 3=50/day
  * circuit breaker — any complaint, or bounce rate >= 5% over the trailing
                      window, pauses everything and alerts the operator

Decisions per escalation:
  * envelope failure (window/cap/switches)  -> HOLD: left OPEN for later
  * recipient failure (missing/suppressed/duplicate) -> cleared: escalation
    REJECTED with the reason logged to ``outreach_log`` (keeps the queue clean;
    enrichment can re-queue the lead on a later seed run)
  * everything green -> approved through ``orchestrator.resolve_escalation``
    (the same human path), and the send is logged to ``outreach_log``.

Controls: Telegram ``/autonomy status|on|off|pause|resume|stage N``; HTTP
``POST /api/agents/autonomy/tick`` (CRON_SECRET) and the cron script
``scripts/drain_escalations_cron.py``.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from models_agents import (AgentEscalation, EscalationStatus, AutonomySettings,
                           OutreachLog, OutreachSuppression)
from agents import orchestrator

# Only these tools may ever be auto-approved. Everything else (social, ads,
# money, legal) stays on the human approval path no matter what the settings
# say.
TOOL_ALLOWLIST = ("send_venue_lead_outreach", "send_provider_lead_email")

# Staged ramp: cap per *local* day. Promotion between stages is a human
# Telegram command, never automatic.
STAGE_CAPS = {0: 0, 1: 10, 2: 25, 3: 50}

BREAKER_WINDOW = 50        # trailing sends the breaker looks at
BREAKER_MIN_SAMPLE = 20    # don't trip on tiny volumes
BREAKER_BOUNCE_PCT = 5.0   # trailing bounce rate that pauses sending

# Statuses that mean "an email actually went out" (and later lifecycle states).
_SENTLIKE = ("sent", "delivered", "replied", "bounced", "complained")


# --------------------------------------------------------------------------- #
# Settings                                                                    #
# --------------------------------------------------------------------------- #
def get_settings(db: Session) -> AutonomySettings:
    """Return the singleton settings row, creating it (disabled) if absent."""
    row = db.query(AutonomySettings).filter(AutonomySettings.id == 1).first()
    if row is None:
        row = AutonomySettings(id=1)   # defaults: disabled, stage 1, unpaused
        db.add(row)
        db.flush()
    return row


def _tz(name: str | None):
    try:
        from zoneinfo import ZoneInfo
        return ZoneInfo(name or "America/Chicago")
    except Exception:                       # tz database missing in the image
        return timezone(timedelta(hours=-5))  # CT fallback


def _now_local(settings: AutonomySettings) -> datetime:
    return datetime.now(_tz(settings.timezone))


def sent_today(db: Session, settings: AutonomySettings) -> int:
    """Emails that consumed today's cap (local day)."""
    day_start = _now_local(settings).replace(hour=0, minute=0, second=0,
                                             microsecond=0)
    return (db.query(OutreachLog)
            .filter(OutreachLog.status.in_(_SENTLIKE),
                    OutreachLog.created_at >= day_start).count())


# --------------------------------------------------------------------------- #
# Per-escalation checks                                                       #
# --------------------------------------------------------------------------- #
def _suppressed(db: Session, email: str | None) -> bool:
    if not email:
        return False
    return db.query(OutreachSuppression).filter(
        OutreachSuppression.email == email.strip().lower()).first() is not None


def _already_sent(db: Session, dedupe_key: str) -> bool:
    return db.query(OutreachLog).filter(
        OutreachLog.dedupe_key == dedupe_key,
        OutreachLog.status.in_(_SENTLIKE)).first() is not None


def _recipient_for(db: Session, esc: AgentEscalation):
    """Resolve the escalation to a sendable address.

    Returns ``(email, lead_type, skip_reason)`` — ``email is None`` means the
    escalation can't be sent and ``skip_reason`` says why.
    """
    args = esc.args or {}
    lead_id = args.get("lead_id")
    if lead_id is None:
        return None, "?", "no lead_id on escalation args"

    if esc.tool == "send_venue_lead_outreach":
        from models import VenueLead
        lead = db.query(VenueLead).filter(VenueLead.id == lead_id).first()
        if not lead:
            return None, "venue_lead", "venue lead not found"
        if getattr(lead, "outreach_sent", False):
            return None, "venue_lead", "already contacted (outreach_sent)"
        if not lead.email:
            return None, "venue_lead", "no email on venue lead"
        return lead.email, "venue_lead", None

    if esc.tool == "send_provider_lead_email":
        from models import ServiceProvider, ProviderOutreach
        prov = db.query(ServiceProvider).filter(
            ServiceProvider.id == lead_id).first()
        if not prov:
            return None, "provider_lead", "provider lead not found"
        if db.query(ProviderOutreach).filter(
                ProviderOutreach.provider_id == prov.id).first():
            return None, "provider_lead", "already contacted (provider_outreach)"
        if not prov.contact_email:
            return None, "provider_lead", "no contact email on provider lead"
        return prov.contact_email, "provider_lead", None

    return None, "?", f"tool not autonomy-eligible: {esc.tool}"


# --------------------------------------------------------------------------- #
# Circuit breaker                                                             #
# --------------------------------------------------------------------------- #
def breaker_status(db: Session) -> dict:
    """Trailing bounce/complaint stats the circuit breaker trips on."""
    rows = (db.query(OutreachLog)
            .filter(OutreachLog.status.in_(_SENTLIKE))
            .order_by(OutreachLog.id.desc()).limit(BREAKER_WINDOW).all())
    total = len(rows)
    bounced = sum(1 for r in rows if r.status == "bounced")
    complained = sum(1 for r in rows if r.status == "complained")
    rate = (bounced / total * 100.0) if total else 0.0
    tripped = (complained >= 1) or (total >= BREAKER_MIN_SAMPLE
                                    and rate >= BREAKER_BOUNCE_PCT)
    return {"window": total, "bounced": bounced, "complained": complained,
            "bounce_rate_pct": round(rate, 2), "tripped": tripped}


def trip_breaker_if_needed(db: Session) -> str | None:
    """Pause autonomy when the breaker is tripped. Returns the pause reason
    when it newly paused, else None. Used by the tick and the Resend webhook."""
    brk = breaker_status(db)
    if not brk["tripped"]:
        return None
    settings = get_settings(db)
    if settings.paused:
        return None
    settings.paused = True
    settings.pause_reason = (f"circuit breaker: {brk['bounced']} bounced / "
                             f"{brk['complained']} complained in last "
                             f"{brk['window']} sends")
    db.flush()
    _notify(f"\U0001f534 Autonomy paused — {settings.pause_reason}. "
            "Say /autonomy resume after investigating.")
    return settings.pause_reason


# --------------------------------------------------------------------------- #
# The tick                                                                    #
# --------------------------------------------------------------------------- #
def run_tick(db: Session) -> dict:
    """One drain pass. Called by the cron script / tick endpoint every ~15 min.

    Never raises on policy failures — returns a summary dict explaining what
    it did (or why it did nothing) so cron logs read like a story.
    """
    settings = get_settings(db)
    summary: dict = {"ok": True, "approved": 0, "cleared": 0, "held": 0,
                     "queue": 0, "cap": STAGE_CAPS.get(settings.stage, 0),
                     "reasons": []}

    # ---- envelope checks that stop the whole tick -------------------------
    if not settings.enabled:
        summary.update(ok=False, note="autonomy is off (enable: /autonomy on)")
        return summary
    if settings.paused:
        summary.update(ok=False,
                       note=f"autonomy paused: {settings.pause_reason or 'manual'}")
        return summary
    if not orchestrator.get_fleet_state(db).enabled:
        summary.update(ok=False, note="fleet kill switch is on")
        return summary
    if not orchestrator._agents_live():
        # Approving now would mark actions executed while sending NOTHING.
        summary.update(ok=False, note="AGENTS_LIVE is off — refusing to drain "
                       "(approvals would silently no-op)")
        return summary
    if trip_breaker_if_needed(db):
        summary.update(ok=False, note=settings.pause_reason)
        return summary

    now = _now_local(settings)
    if not (settings.send_window_start <= now.hour < settings.send_window_end):
        summary.update(ok=False, note=(
            f"outside send window ({settings.send_window_start}:00–"
            f"{settings.send_window_end}:00 {settings.timezone}, "
            f"now {now.strftime('%H:%M')})"))
        return summary

    cap = STAGE_CAPS.get(settings.stage, 0)
    done_today = sent_today(db, settings)
    budget = max(0, cap - done_today)
    summary["sent_today"] = done_today
    if budget <= 0:
        summary.update(ok=False, note=f"daily cap reached ({done_today}/{cap})")
        return summary

    # ---- per-escalation decisions -----------------------------------------
    queue = (db.query(AgentEscalation)
             .filter(AgentEscalation.status == EscalationStatus.OPEN,
                     AgentEscalation.tool.in_(TOOL_ALLOWLIST))
             .order_by(AgentEscalation.created_at.asc(),
                       AgentEscalation.id.asc()).all())
    summary["queue"] = len(queue)

    for esc in queue:
        if summary["approved"] >= budget:
            break                                   # cap for today — hold rest

        email, lead_type, skip = _recipient_for(db, esc)
        lead_id = (esc.args or {}).get("lead_id")
        dedupe_key = f"{esc.tool}:{lead_id}"
        if skip is None and _suppressed(db, email):
            skip = "recipient suppressed (unsubscribed/bounced)"
        if skip is None and _already_sent(db, dedupe_key):
            skip = "duplicate (already emailed this lead)"

        if skip:
            # Clear it with a logged reason — keeps the queue honest without
            # a human having to babysit unsendable rows.
            esc.status = EscalationStatus.REJECTED
            esc.resolved_at = func.now()
            db.add(OutreachLog(escalation_id=esc.id, tool=esc.tool,
                               lead_type=lead_type, lead_id=lead_id,
                               to_email=(email or "").lower() or None,
                               dedupe_key=dedupe_key, status="skipped",
                               detail=skip))
            summary["cleared"] += 1
            if len(summary["reasons"]) < 15:
                summary["reasons"].append(f"#{esc.id} skipped: {skip}")
            db.flush()
            continue

        # Green light — approve through the exact same path a human uses.
        out = orchestrator.resolve_escalation(db, esc, approve=True,
                                              admin_id=None)
        result = (out or {}).get("result") or {}
        ok = bool(result.get("ok")) and not result.get("dry_run")
        db.add(OutreachLog(escalation_id=esc.id, tool=esc.tool,
                           lead_type=lead_type, lead_id=lead_id,
                           to_email=(result.get("sent_to") or email or "").lower(),
                           dedupe_key=dedupe_key,
                           status="sent" if ok else "error",
                           detail=None if ok else str(result)[:500]))
        if ok:
            summary["approved"] += 1
        else:
            summary["cleared"] += 1
            if len(summary["reasons"]) < 15:
                summary["reasons"].append(
                    f"#{esc.id} send failed: {str(result)[:120]}")
        db.flush()

    summary["held"] = max(0, summary["queue"] - summary["approved"]
                          - summary["cleared"])

    if summary["approved"] or summary["cleared"]:
        _notify(f"\U0001f4ec Outreach tick: {summary['approved']} sent, "
                f"{summary['cleared']} cleared, {summary['held']} held. "
                f"Today: {done_today + summary['approved']}/{cap}.")
    return summary


def _notify(text: str) -> None:
    """Best-effort operator push via the Telegram bridge."""
    try:
        from routers.telegram import notify_operator
        notify_operator(text)
    except Exception as e:                                    # never fatal
        print(f"[autonomy] notify failed: {type(e).__name__}: {e}")
