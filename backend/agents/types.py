"""Shared agent types.

The persisted enums (``RiskLevel``, ``Decision``, ``JobStatus`` ...) live in
``models_agents`` because SQLAlchemy columns bind to them; we re-export them
here so agent code can import everything agent-shaped from one place. This
module also holds the *in-memory* planning structures the orchestrator builds
before anything is written to the DB, plus ``AutonomyConfig``.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any

# Re-export the canonical enums (single source of truth = models_agents).
from models_agents import (  # noqa: F401
    RiskLevel, Decision, RunStatus, JobStatus, EscalationStatus,
)

# The three worker agents the COO orchestrator dispatches to.
AGENTS = ("venues", "providers", "marketing")

# Human-readable roles, surfaced in the dashboard. "COO" is the orchestrator
# itself (it plans and supervises rather than holding its own job row).
AGENT_ROLES = {
    "coo": "Chief Operating Officer (orchestrator)",
    "venues": "Venue Supply Agent",
    "providers": "Service Provider Supply Agent",
    "marketing": "Growth & Marketing Agent",
}


@dataclass
class PlannedAction:
    """A tool call an agent intends to make, before guardrail evaluation."""
    tool: str
    risk: RiskLevel
    args: dict[str, Any] = field(default_factory=dict)
    reason: str = ""


@dataclass
class PlannedJob:
    """One agent's planned unit of work for a run."""
    agent: str
    actions: list[PlannedAction] = field(default_factory=list)


class AutonomyConfig:
    """Per-risk autonomy policy.

    Maps each :class:`RiskLevel` to the :class:`Decision` the fleet may take
    without a human. ``money_movement`` and ``legal`` are HARD-GATED: they can
    never be configured to ``auto`` — an attempt to do so is silently clamped
    back to ``require_approval``. This mirrors the guardrail invariant and is
    the one rule callers cannot weaken.
    """

    HARD_GATED = frozenset({RiskLevel.MONEY_MOVEMENT, RiskLevel.LEGAL})

    DEFAULT_POLICY: dict[RiskLevel, Decision] = {
        RiskLevel.READ: Decision.AUTO,
        RiskLevel.INTERNAL_WRITE: Decision.AUTO,
        RiskLevel.OUTBOUND: Decision.REQUIRE_APPROVAL,
        RiskLevel.FINANCIAL: Decision.REQUIRE_APPROVAL,
        RiskLevel.MONEY_MOVEMENT: Decision.REQUIRE_APPROVAL,
        RiskLevel.LEGAL: Decision.REQUIRE_APPROVAL,
    }

    def __init__(self, policy: dict[RiskLevel, Decision] | None = None):
        merged = dict(self.DEFAULT_POLICY)
        if policy:
            merged.update(policy)
        # Enforce the hard gates regardless of what was passed in.
        for risk in self.HARD_GATED:
            if merged.get(risk) == Decision.AUTO:
                merged[risk] = Decision.REQUIRE_APPROVAL
        self.policy = merged

    def decision_for(self, risk: RiskLevel) -> Decision:
        return self.policy.get(risk, Decision.REQUIRE_APPROVAL)
