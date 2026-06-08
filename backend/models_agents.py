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
