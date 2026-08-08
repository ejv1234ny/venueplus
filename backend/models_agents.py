"""Agent control-plane models.

These back the AI ops "fleet": a COO orchestrator plans Jobs across worker
agents (venues / providers / marketing); each Job emits Actions; every Action
is scored by the guardrail policy (see ``agents/guardrails.py``) into a
``Decision``. Actions the policy auto-approves execute immediately; anything
that needs a human becomes an open ``AgentEscalation`` for the admin approval
queue.

All tables are created by ``Base.metadata.create_all`` (no Alembic) and work
on both SQLite (tests/local) and Postgres.

NOTE: a *separate* lead-gen service under ``venueplus-agents/`` also defines a
Postgres ``agent_runs`` table with an unrelated shape. These models live in the
main app's SQLAlchemy ``Base``; on a shared Postgres schema the table names
would collide. See the PR description for the deployment caveat.
"""
from sqlalchemy import (Column, Integer, String, Text, Boolean, DateTime,
                        ForeignKey, Enum, JSON)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class RiskLevel(str, enum.Enum):
    """Guardrail risk tiers, low -> high sensitivity."""
    READ = "read"                     # read-only lookups
    INTERNAL_WRITE = "internal_write" # writes to our own DB (drafts, etc.)
    OUTBOUND = "outbound"             # contacts a third party (email/sms/post)
    FINANCIAL = "financial"           # spends money (ads, credits)
    MONEY_MOVEMENT = "money_movement" # moves funds (payouts, refunds) — HARD GATE
    LEGAL = "legal"                   # signs/commits legally — HARD GATE


class Decision(str, enum.Enum):
    AUTO = "auto"                       # guardrail allows immediate execution
    REQUIRE_APPROVAL = "require_approval"  # needs a human in the loop
    DENY = "deny"                       # forbidden outright


class RunStatus(str, enum.Enum):
    RUNNING = "running"
    COMPLETED = "completed"   # all jobs done, nothing outstanding
    BLOCKED = "blocked"       # at least one job awaiting approval / denied
    FAILED = "failed"


class JobStatus(str, enum.Enum):
    PLANNED = "planned"
    RUNNING = "running"
    DONE = "done"
    BLOCKED = "blocked"               # had a denied action
    NEEDS_APPROVAL = "needs_approval" # has an open escalation
    FAILED = "failed"


class EscalationStatus(str, enum.Enum):
    OPEN = "open"
    APPROVED = "approved"
    REJECTED = "rejected"


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(Integer, primary_key=True, index=True)
    goal = Column(Text, nullable=False)
    city = Column(String)
    status = Column(Enum(RunStatus, native_enum=False), default=RunStatus.RUNNING,
                    nullable=False)
    summary = Column(JSON)  # see orchestrator.build_summary for the shape
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    jobs = relationship("AgentJob", back_populates="run",
                        cascade="all, delete-orphan", order_by="AgentJob.id")
    escalations = relationship("AgentEscalation", back_populates="run",
                               cascade="all, delete-orphan")


class AgentJob(Base):
    __tablename__ = "agent_jobs"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, ForeignKey("agent_runs.id"), nullable=False)
    agent = Column(String, nullable=False)  # "venues" | "providers" | "marketing"
    status = Column(Enum(JobStatus, native_enum=False), default=JobStatus.PLANNED,
                    nullable=False)
    blockers = Column(JSON, default=list)   # list[str]
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    run = relationship("AgentRun", back_populates="jobs")
    actions = relationship("AgentAction", back_populates="job",
                           cascade="all, delete-orphan", order_by="AgentAction.id")


class AgentAction(Base):
    __tablename__ = "agent_actions"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("agent_jobs.id"), nullable=False)
    tool = Column(String, nullable=False)
    risk = Column(Enum(RiskLevel, native_enum=False), nullable=False)
    decision = Column(Enum(Decision, native_enum=False), nullable=False)
    executed = Column(Boolean, default=False, nullable=False)
    reason = Column(Text)
    args = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    job = relationship("AgentJob", back_populates="actions")


class AgentEscalation(Base):
    __tablename__ = "agent_escalations"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, ForeignKey("agent_runs.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("agent_jobs.id"))
    action_id = Column(Integer, ForeignKey("agent_actions.id"))
    agent = Column(String, nullable=False)
    tool = Column(String, nullable=False)
    risk = Column(Enum(RiskLevel, native_enum=False), nullable=False)
    args = Column(JSON)
    reason = Column(Text)
    status = Column(Enum(EscalationStatus, native_enum=False),
                    default=EscalationStatus.OPEN, nullable=False)
    resolved_by = Column(Integer, ForeignKey("users.id"))
    resolved_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    run = relationship("AgentRun", back_populates="escalations")


class AgentFleetState(Base):
    """Singleton (id=1) holding the fleet kill-switch flag."""
    __tablename__ = "agent_fleet_state"

    id = Column(Integer, primary_key=True)
    enabled = Column(Boolean, default=True, nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(),
                        server_default=func.now())


# --------------------------------------------------------------------------- #
# Autonomy engine (see agents/autonomy.py)                                    #
# --------------------------------------------------------------------------- #
class AutonomySettings(Base):
    """Singleton (id=1): the policy envelope for auto-approved outreach.

    ``enabled`` is the master opt-in (default OFF — a human turns autonomy on
    once via Telegram ``/autonomy on``). ``paused`` is the temporary stop used
    by the circuit breaker and ``/autonomy pause``. ``stage`` is the ramp
    ladder (0=off, 1=10/day, 2=25/day, 3=50/day — see autonomy.STAGE_CAPS);
    promotion between stages is always a human command.
    """
    __tablename__ = "autonomy_settings"

    id = Column(Integer, primary_key=True)
    enabled = Column(Boolean, default=False, nullable=False)
    stage = Column(Integer, default=1, nullable=False)
    paused = Column(Boolean, default=False, nullable=False)
    pause_reason = Column(String)
    send_window_start = Column(Integer, default=9, nullable=False)
    send_window_end = Column(Integer, default=17, nullable=False)
    timezone = Column(String, default="America/Chicago", nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(),
                        server_default=func.now())


class OutreachLog(Base):
    """Every autonomy-driven outreach attempt (sent / skipped / failed) and
    its delivery lifecycle — the Resend webhook updates ``status`` in place
    (sent -> delivered / bounced / complained / replied). Also the daily-cap
    and dedupe source of truth."""
    __tablename__ = "outreach_log"

    id = Column(Integer, primary_key=True, index=True)
    escalation_id = Column(Integer, ForeignKey("agent_escalations.id"))
    tool = Column(String, nullable=False)
    lead_type = Column(String)              # "venue_lead" | "provider_lead"
    lead_id = Column(Integer)
    to_email = Column(String, index=True)
    dedupe_key = Column(String, index=True)  # f"{tool}:{lead_id}"
    status = Column(String, default="sent", nullable=False, index=True)
    detail = Column(Text)                   # skip/error reason
    provider_message_id = Column(String, index=True)   # Resend email id
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(),
                        server_default=func.now())


class OutreachSuppression(Base):
    """Do-not-contact list: unsubscribes, bounces, complaints. Checked by the
    autonomy policy *and* by services.email.send_outreach (defence in depth)."""
    __tablename__ = "outreach_suppressions"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True, nullable=False)
    reason = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
