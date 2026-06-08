"""Persistence for the agent system (separate module, shares the app's Base).

Mirrors the in-memory dataclasses in agents/types.py so runs, jobs, actions and
escalations are durable + auditable. Auto-creates via Base.metadata.create_all.
"""
import enum

from sqlalchemy import (Column, Integer, String, Boolean, DateTime, Text,
                        ForeignKey, Enum, JSON)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class AgentRunStatus(str, enum.Enum):
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class AgentJobStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    BLOCKED = "blocked"
    NEEDS_APPROVAL = "needs_approval"
    FAILED = "failed"


class AgentDecision(str, enum.Enum):
    AUTO = "auto"
    REQUIRE_APPROVAL = "require_approval"
    DENY = "deny"


class EscalationStatus(str, enum.Enum):
    OPEN = "open"
    APPROVED = "approved"
    REJECTED = "rejected"


class AgentRun(Base):
    """One COO goal execution."""
    __tablename__ = "agent_runs"

    id = Column(Integer, primary_key=True, index=True)
    goal = Column(Text, nullable=False)
    city = Column(String)
    status = Column(Enum(AgentRunStatus, native_enum=False),
                    default=AgentRunStatus.RUNNING, nullable=False)
    summary = Column(JSON)              # report dict (counts, statuses)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))

    jobs = relationship("AgentJob", back_populates="run", cascade="all, delete-orphan")


class AgentJob(Base):
    __tablename__ = "agent_jobs"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, ForeignKey("agent_runs.id"), nullable=False)
    agent = Column(String, nullable=False)          # venues|providers|marketing
    objective = Column(Text, nullable=False)
    city = Column(String)
    metric = Column(String)
    target = Column(Integer)
    budget_cents = Column(Integer, default=0)
    status = Column(Enum(AgentJobStatus, native_enum=False),
                    default=AgentJobStatus.PENDING, nullable=False)
    blockers = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    run = relationship("AgentRun", back_populates="jobs")
    actions = relationship("AgentAction", back_populates="job", cascade="all, delete-orphan")


class AgentAction(Base):
    __tablename__ = "agent_actions"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("agent_jobs.id"), nullable=False)
    agent = Column(String, nullable=False)
    tool = Column(String, nullable=False)
    risk = Column(String, nullable=False)
    args = Column(JSON)
    decision = Column(Enum(AgentDecision, native_enum=False), nullable=False)
    reason = Column(String)
    executed = Column(Boolean, default=False)
    result = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    job = relationship("AgentJob", back_populates="actions")


class Escalation(Base):
    """A gated action awaiting human approval (money_movement, legal,
    over-cap spend, bulk outbound)."""
    __tablename__ = "agent_escalations"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, ForeignKey("agent_runs.id"))
    job_id = Column(Integer, ForeignKey("agent_jobs.id"))
    agent = Column(String, nullable=False)
    tool = Column(String, nullable=False)
    risk = Column(String, nullable=False)
    args = Column(JSON)
    reason = Column(String)
    status = Column(Enum(EscalationStatus, native_enum=False),
                    default=EscalationStatus.OPEN, nullable=False)
    decided_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    decided_at = Column(DateTime(timezone=True))
