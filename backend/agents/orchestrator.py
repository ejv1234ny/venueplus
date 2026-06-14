"""COO orchestrator.

Turns a free-text *goal* into a plan of Jobs across the worker agents, runs
each planned Action through the guardrail, executes the auto-approved ones
through their tool handler (dry-run for write/outbound unless AGENTS_LIVE), and
persists the whole trace (:class:`AgentRun` -> :class:`AgentJob` ->
:class:`AgentAction`) plus an :class:`AgentEscalation` for every action the
guardrail gates to a human.

How the COO coordinates the fleet
---------------------------------
The COO dispatches one job per worker agent, in **supply-before-demand** order
(`venues` -> `providers` -> `marketing`). Each agent plans its own actions
(real Claude loop when ``ANTHROPIC_API_KEY`` is set; deterministic fallback
otherwise).

Execution mode
--------------
``AGENTS_LIVE`` (env) controls whether tool side effects are real. Default OFF:
agents plan + log what they *would* do (dry-run). Set ``AGENTS_LIVE=true`` to
let auto-approved write/outbound tools actually run. Money is independently
gated by guardrails (money_movement + legal always need a human) and by
FREE_MODE.
"""
import logging
import os

from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from models_agents import (AgentRun, AgentJob, AgentAction, AgentEscalation,
                           AgentFleetState, RiskLevel, Decision, RunStatus,
                           JobStatus, EscalationStatus)
from agents import guardrails, tools
from agents.llm import LLMProvider
from agents.specialists import build_agent
from agents.tools import ToolContext
from agents.types import AutonomyConfig

logger = logging.getLogger("agents.orchestrator")

# The COO's dispatch order: supply first, demand last.
FLEET_ORDER = ("venues", "providers", "marketing")


def _agents_live() -> bool:
    """When AGENTS_LIVE is truthy, auto-approved tools perform real side effects.
    Default off — agents plan + log but don't send/spend. Read live from env so
    go-live is a flag flip, not a redeploy."""
    return os.getenv("AGENTS_LIVE", "false").strip().lower() in ("1", "true", "yes", "on")


# --------------------------------------------------------------------------- #
# Fleet kill-switch                                                           #
# --------------------------------------------------------------------------- #
def get_fleet_state(db: Session) -> AgentFleetState:
    """Return the singleton fleet-state row, creating it (enabled) if absent."""
    state = db.query(AgentFleetState).filter(AgentFleetState.id == 1).first()
    if state is None:
        state = AgentFleetState(id=1, enabled=True)
        db.add(state)
        db.commit()
        db.refresh(state)
    return state


def set_fleet_enabled(db: Session, enabled: bool) -> AgentFleetState:
    state = get_fleet_state(db)
    state.enabled = enabled
    db.commit()
    db.refresh(state)
    return state


# --------------------------------------------------------------------------- #
# Status + summary computation (used after a run and after each approval)      #
# --------------------------------------------------------------------------- #
def _job_escalations(db: Session, job_id: int) -> list[AgentEscalation]:
    return db.query(AgentEscalation).filter(
        AgentEscalation.job_id == job_id).all()


def _compute_job(db: Session, job: AgentJob) -> None:
    """Recompute a job's status + blockers from its actions/escalations."""
    escs = _job_escalations(db, job.id)
    blockers: list[str] = []
    has_open = False
    has_rejected = False

    for e in escs:
        if e.status == EscalationStatus.OPEN:
            has_open = True
            blockers.append(f"{e.tool}: awaiting approval ({e.risk.value})")
        elif e.status == EscalationStatus.REJECTED:
            has_rejected = True
            blockers.append(f"{e.tool}: rejected by admin")

    for a in job.actions:
        if a.decision == Decision.DENY:
            blockers.append(f"{a.tool}: denied by guardrail ({a.risk.value})")

    has_denied = any(a.decision == Decision.DENY for a in job.actions)

    if has_open:
        job.status = JobStatus.NEEDS_APPROVAL
    elif has_rejected or has_denied:
        job.status = JobStatus.BLOCKED
    else:
        job.status = JobStatus.DONE
    job.blockers = blockers


def build_summary(db: Session, run: AgentRun) -> dict:
    """Produce the documented ``summary`` shape for a run.

    Shape::

        {jobs_planned, statuses:[[agent,status]], actions_total,
         actions_executed, needs_approval, blocked:[...]}
    """
    actions_total = 0
    actions_executed = 0
    blocked: list[str] = []
    statuses: list[list[str]] = []
    for job in run.jobs:
        statuses.append([job.agent, job.status.value])
        for a in job.actions:
            actions_total += 1
            if a.executed:
                actions_executed += 1
        blocked.extend(job.blockers or [])
    needs_approval = db.query(AgentEscalation).filter(
        AgentEscalation.run_id == run.id,
        AgentEscalation.status == EscalationStatus.OPEN).count()
    return {
        "jobs_planned": len(run.jobs),
        "statuses": statuses,
        "actions_total": actions_total,
        "actions_executed": actions_executed,
        "needs_approval": needs_approval,
        "blocked": blocked,
    }


def _recompute_run_status(db: Session, run: AgentRun) -> None:
    statuses = {job.status for job in run.jobs}
    if JobStatus.NEEDS_APPROVAL in statuses or JobStatus.BLOCKED in statuses:
        run.status = RunStatus.BLOCKED
    elif statuses and statuses <= {JobStatus.DONE}:
        run.status = RunStatus.COMPLETED
    else:
        run.status = RunStatus.COMPLETED


def recompute(db: Session, run: AgentRun) -> AgentRun:
    """Recompute jobs, run status and summary; commit. Call after a run or
    after an escalation is approved/rejected."""
    for job in run.jobs:
        _compute_job(db, job)
    _recompute_run_status(db, run)
    run.summary = build_summary(db, run)
    db.commit()
    db.refresh(run)
    return run


# --------------------------------------------------------------------------- #
# Run a goal                                                                   #
# --------------------------------------------------------------------------- #
def run_goal(db: Session, goal: str, city: str | None = None,
             config: AutonomyConfig | None = None) -> AgentRun:
    """Plan and execute a goal across the fleet. Raises ``FleetDisabledError``
    if the kill switch is active.

    The COO dispatches one job per worker agent in supply-before-demand order.
    Each agent proposes its own actions (real Claude loop when a key is set,
    deterministic fallback otherwise); the orchestrator scores each through the
    guardrail and executes the auto-approved ones via their tool handler.
    """
    if not get_fleet_state(db).enabled:
        raise FleetDisabledError("Fleet is disabled (kill switch active)")

    config = config or AutonomyConfig()
    llm = LLMProvider()
    # Reads hit live sources when a real model drives the run; writes / outbound
    # perform real side effects only when AGENTS_LIVE is set (else dry-run).
    ctx = ToolContext(db=db, live=llm.is_real, dry_run=not _agents_live())
    usage = guardrails.UsageTracker()   # per-run cap accounting

    run = AgentRun(goal=goal, city=city, status=RunStatus.RUNNING)
    db.add(run)
    db.flush()  # assign run.id

    for agent_name in FLEET_ORDER:
        agent = build_agent(agent_name, llm=llm)
        planned = agent.propose_actions(goal, city, context={})

        job = AgentJob(run_id=run.id, agent=agent_name,
                       status=JobStatus.RUNNING, blockers=[])
        db.add(job)
        db.flush()

        for pa in planned:
            decision = guardrails.evaluate(pa.risk, config, usage, pa.args)
            executed = False
            if decision == Decision.AUTO:
                result = tools.execute(pa.tool, pa.args or {}, ctx)
                executed = True
                usage.record(pa.risk, pa.args)  # count autonomous outreach/spend
                logger.info("executed %s/%s -> %s", agent_name, pa.tool, result)

            action = AgentAction(
                job_id=job.id, tool=pa.tool, risk=pa.risk, decision=decision,
                executed=executed, reason=pa.reason, args=pa.args,
            )
            db.add(action)
            db.flush()

            if decision == Decision.REQUIRE_APPROVAL:
                db.add(AgentEscalation(
                    run_id=run.id, job_id=job.id, action_id=action.id,
                    agent=agent_name, tool=pa.tool, risk=pa.risk,
                    args=pa.args, reason=pa.reason,
                    status=EscalationStatus.OPEN,
                ))
        db.flush()

    db.commit()
    db.refresh(run)
    return recompute(db, run)


def resolve_escalation(db: Session, escalation: AgentEscalation, *,
                       approve: bool, admin_id: int) -> AgentRun:
    """Approve or reject an escalation, then recompute its run.

    Approving executes the gated action through its tool handler (dry-run for
    write/outbound unless AGENTS_LIVE) and marks it executed; rejecting leaves
    it un-executed and blocks its job. Approval is the human gate -- there is no
    auto path here.
    """
    escalation.status = (EscalationStatus.APPROVED if approve
                         else EscalationStatus.REJECTED)
    escalation.resolved_by = admin_id
    escalation.resolved_at = func.now()
    if approve and escalation.action_id:
        action = db.query(AgentAction).filter(
            AgentAction.id == escalation.action_id).first()
        if action:
            ctx = ToolContext(db=db, live=False, dry_run=not _agents_live())
            result = tools.execute(action.tool, action.args or {}, ctx)
            logger.info("approved+executed %s -> %s", action.tool, result)
            action.executed = True
    db.flush()
    run = db.query(AgentRun).filter(AgentRun.id == escalation.run_id).first()
    return recompute(db, run)


class FleetDisabledError(RuntimeError):
    """Raised by run_goal when the kill switch is active."""
