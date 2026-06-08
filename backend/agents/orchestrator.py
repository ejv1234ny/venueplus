"""COO orchestrator.

Turns a free-text *goal* into a plan of Jobs across the worker agents, runs
each planned Action through the guardrail, and persists the whole trace
(:class:`AgentRun` -> :class:`AgentJob` -> :class:`AgentAction`) plus an
:class:`AgentEscalation` for every action the guardrail gates to a human.

The plan is deterministic (no LLM, no randomness) and parameterised by the
goal text + city, so the dashboard and tests get stable, meaningful traces.
Auto-approved actions are marked executed immediately (the actual tool side
effects are out of scope here); gated actions wait in the approval queue.
"""
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from models_agents import (AgentRun, AgentJob, AgentAction, AgentEscalation,
                           AgentFleetState, RiskLevel, Decision, RunStatus,
                           JobStatus, EscalationStatus)
from agents import guardrails
from agents.types import AutonomyConfig, PlannedJob, PlannedAction


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
# Planning                                                                    #
# --------------------------------------------------------------------------- #
def _plan(goal: str, city: str | None) -> list[PlannedJob]:
    """Deterministically derive the per-agent action plan for a goal."""
    g = (goal or "").lower()
    where = city or "all markets"

    venues = PlannedJob("venues", [
        PlannedAction("search_osm_venues", RiskLevel.READ,
                      {"city": city}, f"Scout candidate venues in {where}"),
        PlannedAction("draft_venue_listing", RiskLevel.INTERNAL_WRITE,
                      {"city": city}, "Draft listing pages for top candidates"),
        PlannedAction("send_venue_outreach_email", RiskLevel.OUTBOUND,
                      {"city": city}, "Email venue owners inviting them to list"),
    ])

    providers = PlannedJob("providers", [
        PlannedAction("search_providers", RiskLevel.READ,
                      {"city": city}, f"Find service providers serving {where}"),
        PlannedAction("create_provider_invite", RiskLevel.INTERNAL_WRITE,
                      {"city": city}, "Generate invite records for high-fit providers"),
        PlannedAction("send_provider_sms", RiskLevel.OUTBOUND,
                      {"city": city}, "Text providers to finish onboarding"),
    ])

    marketing_actions = [
        PlannedAction("generate_seo_content", RiskLevel.INTERNAL_WRITE,
                      {"city": city}, f"Draft SEO landing copy for {where}"),
        PlannedAction("publish_social_post", RiskLevel.OUTBOUND,
                      {"city": city}, "Publish a launch announcement to social"),
    ]
    if any(k in g for k in ("ad", "paid", "campaign", "spend", "grow", "launch")):
        marketing_actions.append(PlannedAction(
            "launch_paid_ad_campaign", RiskLevel.FINANCIAL,
            {"city": city, "budget_usd": 500}, "Start a paid acquisition campaign"))
    if any(k in g for k in ("referral", "payout", "incentive", "bonus")):
        marketing_actions.append(PlannedAction(
            "issue_referral_payout", RiskLevel.MONEY_MOVEMENT,
            {"amount_usd": 50}, "Pay a referral incentive to an existing host"))
    if any(k in g for k in ("partner", "contract", "agreement", "legal")):
        marketing_actions.append(PlannedAction(
            "sign_partnership_agreement", RiskLevel.LEGAL,
            {"partner": "local chamber of commerce"},
            "Sign a co-marketing partnership agreement"))

    return [venues, providers, PlannedJob("marketing", marketing_actions)]


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
    """Plan and execute a goal. Raises ``FleetDisabledError`` if killed."""
    if not get_fleet_state(db).enabled:
        raise FleetDisabledError("Fleet is disabled (kill switch active)")

    config = config or AutonomyConfig()
    run = AgentRun(goal=goal, city=city, status=RunStatus.RUNNING)
    db.add(run)
    db.flush()  # assign run.id

    for planned in _plan(goal, city):
        job = AgentJob(run_id=run.id, agent=planned.agent,
                       status=JobStatus.RUNNING, blockers=[])
        db.add(job)
        db.flush()

        for pa in planned.actions:
            decision = guardrails.evaluate(pa.risk, config)
            action = AgentAction(
                job_id=job.id, tool=pa.tool, risk=pa.risk, decision=decision,
                executed=(decision == Decision.AUTO), reason=pa.reason,
                args=pa.args,
            )
            db.add(action)
            db.flush()
            if decision == Decision.REQUIRE_APPROVAL:
                db.add(AgentEscalation(
                    run_id=run.id, job_id=job.id, action_id=action.id,
                    agent=planned.agent, tool=pa.tool, risk=pa.risk,
                    args=pa.args, reason=pa.reason,
                    status=EscalationStatus.OPEN,
                ))
        db.flush()

    # Reload so relationships (jobs/actions/escalations) are populated.
    db.commit()
    db.refresh(run)
    return recompute(db, run)


def resolve_escalation(db: Session, escalation: AgentEscalation, *,
                       approve: bool, admin_id: int) -> AgentRun:
    """Approve or reject an escalation, then recompute its run.

    Approving executes the gated action; rejecting leaves it un-executed and
    blocks its job. Approval is the human gate — there is no auto path here.
    """
    escalation.status = (EscalationStatus.APPROVED if approve
                         else EscalationStatus.REJECTED)
    escalation.resolved_by = admin_id
    escalation.resolved_at = func.now()
    if approve and escalation.action_id:
        action = db.query(AgentAction).filter(
            AgentAction.id == escalation.action_id).first()
        if action:
            action.executed = True
    db.flush()
    run = db.query(AgentRun).filter(AgentRun.id == escalation.run_id).first()
    return recompute(db, run)


class FleetDisabledError(RuntimeError):
    """Raised by run_goal when the kill switch is active."""
