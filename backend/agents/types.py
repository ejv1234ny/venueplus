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
    "creator": "Creator & Influencer Agent",
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
    """Per-risk autonomy policy + daily caps.

    Maps each :class:`RiskLevel` to the :class:`Decision` the fleet may take
    without a human. ``money_movement`` and ``legal`` are HARD-GATED: they can
    never be configured to ``auto`` — an attempt to do so is silently clamped
    back to ``require_approval``. This mirrors the guardrail invariant and is
    the one rule callers cannot weaken.

    Two daily caps bound autonomous activity *when* a risk tier is set to
    ``auto`` (they do nothing while the tier requires approval): an outbound
    message-count cap and a spend cap. The guardrail downgrades an otherwise
    ``auto`` action to ``require_approval`` once a cap would be exceeded, so
    even a fully-autonomous fleet cannot blast outreach or burn budget without
    a human stepping in.

    Default posture is conservative — only ``read`` and ``internal_write`` run
    autonomously; outbound and financial require approval. Call
    :meth:`mostly_autonomous` for the looser posture (outbound + financial run
    within caps) once outreach templates and spend bands are trusted.
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

    # Defaults for the daily caps (effective only where a tier is ``auto``).
    DEFAULT_OUTBOUND_DAILY_CAP = 200          # messages / fleet / day
    DEFAULT_SPEND_DAILY_CAP_CENTS = 50_000    # $500 / fleet / day

    def __init__(self, policy: dict[RiskLevel, Decision] | None = None,
                 outbound_daily_cap: int | None = None,
                 spend_daily_cap_cents: int | None = None):
        merged = dict(self.DEFAULT_POLICY)
        if policy:
            merged.update(policy)
        # Enforce the hard gates regardless of what was passed in.
        for risk in self.HARD_GATED:
            if merged.get(risk) == Decision.AUTO:
                merged[risk] = Decision.REQUIRE_APPROVAL
        self.policy = merged
        self.outbound_daily_cap = (self.DEFAULT_OUTBOUND_DAILY_CAP
                                   if outbound_daily_cap is None else outbound_daily_cap)
        self.spend_daily_cap_cents = (self.DEFAULT_SPEND_DAILY_CAP_CENTS
                                      if spend_daily_cap_cents is None else spend_daily_cap_cents)

    def decision_for(self, risk: RiskLevel) -> Decision:
        return self.policy.get(risk, Decision.REQUIRE_APPROVAL)

    @classmethod
    def mostly_autonomous(cls, **caps) -> "AutonomyConfig":
        """The looser posture: outbound + financial run autonomously *within
        caps*; money_movement + legal remain hard-gated. Use once outreach and
        spend are trusted. Caps still apply."""
        return cls(policy={
            RiskLevel.OUTBOUND: Decision.AUTO,
            RiskLevel.FINANCIAL: Decision.AUTO,
        }, **caps)
