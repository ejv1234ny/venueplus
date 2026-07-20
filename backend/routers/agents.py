"""Agent control-plane endpoints — admin only, prefix ``/api/agents``.

The dashboard's agent surfaces (run a goal, the run audit trace, the approval
queue, the kill switch) all drive this router. Nothing here auto-approves a
gated action: approval is an explicit admin POST.
"""
import os

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth import require_admin
from database import get_db
from models import User, AuditLog
from models_agents import AgentRun, AgentEscalation, EscalationStatus
from agents import orchestrator, readiness
from agents.orchestrator import FleetDisabledError

router = APIRouter()


# --------------------------------------------------------------------------- #
# Schemas                                                                     #
# --------------------------------------------------------------------------- #
class GoalRequest(BaseModel):
    goal: str
    city: str | None = None


class SeedRequest(BaseModel):
    city: str


class CreatorLeadIn(BaseModel):
    name: str
    handle: str | None = None
    platform: str | None = None
    niche: str | None = None
    followers: int | None = 0
    email: str | None = None
    phone: str | None = None


class CreatorLeadsImport(BaseModel):
    city: str
    leads: list[CreatorLeadIn]


class KillRequest(BaseModel):
    enabled: bool


def _audit(db: Session, actor_id: int, action: str, entity_id: int | None,
           meta: dict | None = None):
    db.add(AuditLog(actor_id=actor_id, action=action, entity_type="agent",
                    entity_id=entity_id, meta=meta or {}))


def _action_dict(a) -> dict:
    return {"tool": a.tool, "risk": a.risk.value, "decision": a.decision.value,
            "executed": a.executed, "reason": a.reason}


# --------------------------------------------------------------------------- #
# Runs                                                                        #
# --------------------------------------------------------------------------- #
@router.post("/goals")
def run_goal(body: GoalRequest, admin: User = Depends(require_admin),
             db: Session = Depends(get_db)):
    """Plan + execute a goal across the fleet.

    Returns ``{run_id, summary, escalations_open}``.
    """
    if not body.goal or not body.goal.strip():
        raise HTTPException(400, "goal is required")
    try:
        run = orchestrator.run_goal(db, body.goal.strip(), body.city)
    except FleetDisabledError as e:
        raise HTTPException(409, str(e))
    _audit(db, admin.id, "agent_run_goal", run.id,
           {"goal": body.goal, "city": body.city})
    db.commit()
    return {"run_id": run.id, "summary": run.summary,
            "escalations_open": run.summary.get("needs_approval", 0)}


@router.post("/seed")
def seed_market(body: SeedRequest, admin: User = Depends(require_admin),
                db: Session = Depends(get_db)):
    """Run the fleet's real operating loop against a market: scout live public
    sources, dedupe, and create inactive draft venues + provider leads (real
    writes only when AGENTS_LIVE). Outreach escalates for approval by default.

    Returns ``{run_id, summary, escalations_open}``.
    """
    if not body.city or not body.city.strip():
        raise HTTPException(400, "city is required")
    try:
        run = orchestrator.run_seed(db, body.city.strip())
    except FleetDisabledError as e:
        raise HTTPException(409, str(e))
    _audit(db, admin.id, "agent_run_seed", run.id, {"city": body.city})
    db.commit()
    return {"run_id": run.id, "summary": run.summary,
            "escalations_open": run.summary.get("needs_approval", 0)}


@router.get("/readiness")
def market_readiness(city: str, admin: User = Depends(require_admin),
                     db: Session = Depends(get_db)):
    """Is ``city`` seeded enough to open to the public? Returns active supply,
    coverage gaps, lead backlog, and a recommendation (the COO hand-off gate).
    """
    if not city.strip():
        raise HTTPException(400, "city is required")
    return readiness.market_readiness(db, city.strip())


@router.post("/seed/cron")
def seed_cron(request: Request, city: str | None = None,
              db: Session = Depends(get_db)):
    """Scheduled continuous seeding. CRON_SECRET-gated (like the payout/cleanup
    crons); no admin session. Runs the seed fleet for ``?city=`` or the
    ``SEED_CITY`` env, and returns the run summary + current readiness.
    """
    expected = os.getenv("CRON_SECRET")
    if expected and request.headers.get("authorization", "") != f"Bearer {expected}":
        raise HTTPException(401, "Invalid cron secret")
    target = (city or os.getenv("SEED_CITY") or "").strip()
    if not target:
        raise HTTPException(400, "no city (pass ?city= or set SEED_CITY)")
    try:
        run = orchestrator.run_seed(db, target)
    except FleetDisabledError as e:
        raise HTTPException(409, str(e))
    db.commit()
    return {"ok": True, "run_id": run.id, "city": target,
            "summary": run.summary,
            "readiness": readiness.market_readiness(db, target)}


@router.post("/creator-leads/import")
def import_creator_leads(body: CreatorLeadsImport,
                         admin: User = Depends(require_admin),
                         db: Session = Depends(get_db)):
    """Import a list of creator/influencer prospects for a city into the
    Creator agent's pipeline. Idempotent. Returns import stats + pipeline
    summary. The Creator agent then drafts outreach on the next seed run.
    """
    if not body.city.strip():
        raise HTTPException(400, "city is required")
    from services import creator_leads as cl
    rows = [ld.model_dump() for ld in body.leads]
    stats = cl.import_leads(db, body.city.strip(), rows)
    summary = cl.summarize(db, body.city.strip())
    _audit(db, admin.id, "agent_import_creator_leads", None,
           {"city": body.city, "created": stats["created"]})
    db.commit()
    return {"ok": True, "stats": stats, "pipeline": summary}


@router.get("/creator-leads")
def list_creator_leads(city: str | None = None,
                       admin: User = Depends(require_admin),
                       db: Session = Depends(get_db)):
    """Creator pipeline for review: ``[{id, name, handle, status, ...}]``."""
    from services import creator_leads as cl
    leads = cl.list_leads(db, city)
    return [{"id": ld.id, "name": ld.name, "handle": ld.handle,
             "platform": ld.platform, "niche": ld.niche, "followers": ld.followers,
             "city": ld.city, "status": ld.status.value,
             "outreach_sent": ld.outreach_sent, "event_drafted": ld.event_drafted,
             "draft_event_id": ld.draft_event_id} for ld in leads]


@router.get("/runs")
def list_runs(limit: int = 100, admin: User = Depends(require_admin),
              db: Session = Depends(get_db)):
    """``[{id, goal, status, summary, created_at}]`` newest first."""
    rows = db.query(AgentRun).order_by(AgentRun.created_at.desc(),
                                       AgentRun.id.desc()).limit(limit).all()
    return [{"id": r.id, "goal": r.goal, "status": r.status.value,
             "summary": r.summary, "created_at": r.created_at} for r in rows]


@router.get("/runs/{run_id}")
def get_run(run_id: int, admin: User = Depends(require_admin),
            db: Session = Depends(get_db)):
    """Full audit trace: jobs -> actions with guardrail decisions."""
    run = db.query(AgentRun).filter(AgentRun.id == run_id).first()
    if not run:
        raise HTTPException(404, "Run not found")
    return {
        "id": run.id, "goal": run.goal, "status": run.status.value,
        "summary": run.summary, "created_at": run.created_at,
        "jobs": [{
            "agent": job.agent,
            "status": job.status.value,
            "blockers": job.blockers or [],
            "actions": [_action_dict(a) for a in job.actions],
        } for job in run.jobs],
    }


# --------------------------------------------------------------------------- #
# Escalations / approval queue                                                #
# --------------------------------------------------------------------------- #
@router.get("/escalations")
def list_escalations(admin: User = Depends(require_admin),
                     db: Session = Depends(get_db)):
    """Open escalations: ``[{id, agent, tool, risk, args, reason, run_id}]``."""
    rows = db.query(AgentEscalation).filter(
        AgentEscalation.status == EscalationStatus.OPEN
    ).order_by(AgentEscalation.created_at.desc()).all()
    return [{"id": e.id, "agent": e.agent, "tool": e.tool, "risk": e.risk.value,
             "args": e.args, "reason": e.reason, "run_id": e.run_id}
            for e in rows]


def _resolve(db: Session, admin: User, escalation_id: int, approve: bool):
    e = db.query(AgentEscalation).filter(
        AgentEscalation.id == escalation_id).first()
    if not e:
        raise HTTPException(404, "Escalation not found")
    if e.status != EscalationStatus.OPEN:
        raise HTTPException(409, f"Escalation already {e.status.value}")
    orchestrator.resolve_escalation(db, e, approve=approve, admin_id=admin.id)
    _audit(db, admin.id, "agent_escalation_approve" if approve
           else "agent_escalation_reject", escalation_id,
           {"tool": e.tool, "risk": e.risk.value})
    db.commit()
    return {"ok": True, "status": e.status.value}


@router.post("/escalations/{escalation_id}/approve")
def approve_escalation(escalation_id: int, admin: User = Depends(require_admin),
                       db: Session = Depends(get_db)):
    return _resolve(db, admin, escalation_id, approve=True)


@router.post("/escalations/{escalation_id}/reject")
def reject_escalation(escalation_id: int, admin: User = Depends(require_admin),
                      db: Session = Depends(get_db)):
    return _resolve(db, admin, escalation_id, approve=False)


# --------------------------------------------------------------------------- #
# Kill switch                                                                  #
# --------------------------------------------------------------------------- #
@router.post("/kill")
def set_kill_switch(body: KillRequest, admin: User = Depends(require_admin),
                    db: Session = Depends(get_db)):
    """Toggle the fleet kill switch. Returns ``{fleet_enabled}``."""
    state = orchestrator.set_fleet_enabled(db, body.enabled)
    _audit(db, admin.id, "agent_fleet_kill", None, {"enabled": body.enabled})
    db.commit()
    return {"fleet_enabled": state.enabled}
