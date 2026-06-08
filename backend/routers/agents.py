"""Agent control plane — admin-only.

  POST /api/agents/goals              run the COO on a goal; persist the run
  GET  /api/agents/runs               list runs
  GET  /api/agents/runs/{id}          run detail (jobs, actions, escalations)
  GET  /api/agents/escalations        open approval queue
  POST /api/agents/escalations/{id}/approve
  POST /api/agents/escalations/{id}/reject
  POST /api/agents/kill               toggle the fleet kill switch
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import require_admin
from database import get_db
from models import User
from models_agents import (AgentRun, AgentRunStatus, AgentJob, AgentJobStatus,
                           AgentAction, AgentDecision, Escalation, EscalationStatus)
from schemas_agents import GoalInput, AutonomyOverride
from agents.orchestrator import build_system
from agents.types import AutonomyConfig

router = APIRouter()

# Process-local kill switch (persist to a settings table in prod)
_FLEET = {"enabled": True}


def _persist_run(db: Session, report: dict, user_id: int) -> AgentRun:
    run = AgentRun(goal=report["goal"], status=AgentRunStatus.COMPLETED,
                   summary={k: report[k] for k in
                            ("jobs_planned", "statuses", "actions_total",
                             "actions_executed", "needs_approval", "blocked")},
                   created_by=user_id, completed_at=datetime.now(timezone.utc))
    db.add(run); db.flush()
    for r in report["results"]:
        job = AgentJob(run_id=run.id, agent=r.agent, objective=f"{r.agent} job",
                       status=AgentJobStatus(r.status.value), blockers=r.blockers)
        db.add(job); db.flush()
        for a in r.actions:
            db.add(AgentAction(
                job_id=job.id, agent=a.agent, tool=a.tool, risk=a.risk.value,
                args=a.args, decision=AgentDecision(a.decision.value),
                reason=a.reason, executed=a.executed,
                result=a.result if isinstance(a.result, (dict, list)) else None))
        for e in r.escalations:
            db.add(Escalation(
                run_id=run.id, job_id=job.id, agent=e.agent, tool=e.action.tool,
                risk=e.action.risk.value, args=e.action.args, reason=e.action.reason,
                status=EscalationStatus.OPEN))
    db.commit(); db.refresh(run)
    return run


@router.post("/goals")
def run_goal(data: GoalInput, current_user: User = Depends(require_admin),
             db: Session = Depends(get_db)):
    config = AutonomyConfig()
    config.enabled = _FLEET["enabled"]
    coo = build_system(config)
    report = coo.run_goal(data.goal, data.city)
    run = _persist_run(db, report, current_user.id)
    return {"run_id": run.id, "summary": run.summary,
            "escalations_open": report["needs_approval"]}


@router.get("/runs")
def list_runs(current_user: User = Depends(require_admin),
              db: Session = Depends(get_db)):
    return [{"id": r.id, "goal": r.goal, "status": r.status.value,
             "summary": r.summary, "created_at": r.created_at}
            for r in db.query(AgentRun).order_by(AgentRun.created_at.desc()).all()]


@router.get("/runs/{run_id}")
def run_detail(run_id: int, current_user: User = Depends(require_admin),
               db: Session = Depends(get_db)):
    run = db.query(AgentRun).filter(AgentRun.id == run_id).first()
    if not run:
        raise HTTPException(404, "Run not found")
    jobs = db.query(AgentJob).filter(AgentJob.run_id == run.id).all()
    return {
        "id": run.id, "goal": run.goal, "summary": run.summary,
        "jobs": [{
            "agent": j.agent, "status": j.status.value, "blockers": j.blockers,
            "actions": [{"tool": a.tool, "risk": a.risk, "decision": a.decision.value,
                         "executed": a.executed, "reason": a.reason}
                        for a in db.query(AgentAction).filter(AgentAction.job_id == j.id).all()],
        } for j in jobs],
    }


@router.get("/escalations")
def open_escalations(current_user: User = Depends(require_admin),
                     db: Session = Depends(get_db)):
    rows = db.query(Escalation).filter(Escalation.status == EscalationStatus.OPEN).all()
    return [{"id": e.id, "agent": e.agent, "tool": e.tool, "risk": e.risk,
             "args": e.args, "reason": e.reason, "run_id": e.run_id} for e in rows]


@router.post("/escalations/{esc_id}/approve")
def approve(esc_id: int, current_user: User = Depends(require_admin),
            db: Session = Depends(get_db)):
    e = db.query(Escalation).filter(Escalation.id == esc_id).first()
    if not e:
        raise HTTPException(404, "Escalation not found")
    if e.status != EscalationStatus.OPEN:
        raise HTTPException(400, f"Already {e.status.value}")
    # NOTE: execution of the approved action is wired per-tool in a follow-up;
    # this records the human decision and unblocks the workflow.
    e.status = EscalationStatus.APPROVED
    e.decided_by = current_user.id
    e.decided_at = datetime.now(timezone.utc)
    db.commit()
    return {"ok": True, "status": e.status.value}


@router.post("/escalations/{esc_id}/reject")
def reject(esc_id: int, current_user: User = Depends(require_admin),
           db: Session = Depends(get_db)):
    e = db.query(Escalation).filter(Escalation.id == esc_id).first()
    if not e:
        raise HTTPException(404, "Escalation not found")
    e.status = EscalationStatus.REJECTED
    e.decided_by = current_user.id
    e.decided_at = datetime.now(timezone.utc)
    db.commit()
    return {"ok": True, "status": e.status.value}


@router.post("/kill")
def kill_switch(data: AutonomyOverride, current_user: User = Depends(require_admin)):
    if data.enabled is not None:
        _FLEET["enabled"] = data.enabled
    return {"fleet_enabled": _FLEET["enabled"]}
