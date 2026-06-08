"""Shared types for the VenuePlus agent system.

Kept dependency-free (stdlib only) so the framework is unit-testable without
the web app or a database.
"""
from __future__ import annotations

import enum
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Callable, Optional


# --------------------------------------------------------------------------
# Risk + decisions
# --------------------------------------------------------------------------
class RiskLevel(str, enum.Enum):
    """How dangerous a tool call is. Drives the guardrail decision."""
    READ = "read"                       # query data, no side effects
    INTERNAL_WRITE = "internal_write"   # create/update our own records
    OUTBOUND = "outbound"               # contact a human (email/DM/SMS)
    FINANCIAL = "financial"             # spend budget / change price
    MONEY_MOVEMENT = "money_movement"   # payout / refund / move funds
    LEGAL = "legal"                     # contracts / terms commitments


class Decision(str, enum.Enum):
    AUTO = "auto"                       # execute now
    REQUIRE_APPROVAL = "require_approval"
    DENY = "deny"


class JobStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    BLOCKED = "blocked"
    NEEDS_APPROVAL = "needs_approval"
    FAILED = "failed"


# --------------------------------------------------------------------------
# Work items
# --------------------------------------------------------------------------
@dataclass
class Job:
    """A unit of work the COO hands to a specialist agent."""
    agent: str                          # "venues" | "providers" | "marketing"
    objective: str
    metric: Optional[str] = None
    target: Optional[float] = None
    city: Optional[str] = None
    budget_cents: int = 0
    deadline: Optional[str] = None
    constraints: list[str] = field(default_factory=list)
    context: dict = field(default_factory=dict)
    id: str = field(default_factory=lambda: f"job_{uuid.uuid4().hex[:8]}")


@dataclass
class ActionRecord:
    """One tool call an agent proposed, plus how the guardrail handled it."""
    agent: str
    tool: str
    risk: RiskLevel
    args: dict
    decision: Decision
    reason: str = ""
    executed: bool = False
    result: Any = None
    id: str = field(default_factory=lambda: f"act_{uuid.uuid4().hex[:8]}")
    ts: float = field(default_factory=time.time)


@dataclass
class Escalation:
    """A gated action waiting on human approval."""
    agent: str
    job_id: str
    action: ActionRecord
    status: str = "open"                # open | approved | rejected
    id: str = field(default_factory=lambda: f"esc_{uuid.uuid4().hex[:8]}")


@dataclass
class JobResult:
    job_id: str
    agent: str
    status: JobStatus
    progress_current: float = 0.0
    progress_target: float = 0.0
    actions: list[ActionRecord] = field(default_factory=list)
    escalations: list[Escalation] = field(default_factory=list)
    blockers: list[str] = field(default_factory=list)
    notes: str = ""


# --------------------------------------------------------------------------
# Autonomy configuration
# --------------------------------------------------------------------------
@dataclass
class AutonomyConfig:
    """Maps each risk level to a default decision, plus caps. Defaults encode
    the 'mostly autonomous' posture: act freely except move-money / legal,
    and stay inside spend + outbound-volume caps."""
    policy: dict = field(default_factory=lambda: {
        RiskLevel.READ: Decision.AUTO,
        RiskLevel.INTERNAL_WRITE: Decision.AUTO,
        RiskLevel.OUTBOUND: Decision.AUTO,            # within daily cap
        RiskLevel.FINANCIAL: Decision.AUTO,           # within spend cap/band
        RiskLevel.MONEY_MOVEMENT: Decision.REQUIRE_APPROVAL,  # hard gate
        RiskLevel.LEGAL: Decision.REQUIRE_APPROVAL,           # hard gate
    })
    outbound_daily_cap: int = 200        # messages/agent/day
    spend_daily_cap_cents: int = 50_000  # $500/agent/day
    enabled: bool = True                 # kill switch

    def decision_for(self, risk: RiskLevel) -> Decision:
        return self.policy.get(risk, Decision.REQUIRE_APPROVAL)
