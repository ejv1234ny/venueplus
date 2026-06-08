"""Guardrail policy.

The single chokepoint every agent action passes through. Given an action's
risk level (and the active :class:`AutonomyConfig`), it returns the guardrail
:class:`Decision`. The dashboard's audit view color-codes exactly this output:
auto=green, require_approval=amber, deny=red.

Invariants (do not weaken):
  * ``money_movement`` and ``legal`` are ALWAYS human-gated — they can never
    resolve to ``auto``.
  * Approval is only ever granted by an explicit human action through the
    ``/escalations/{id}/approve`` endpoint; nothing here auto-approves.
"""
from agents.types import RiskLevel, Decision, AutonomyConfig


def evaluate(risk: RiskLevel, config: AutonomyConfig | None = None) -> Decision:
    """Return the guardrail decision for an action of ``risk``."""
    config = config or AutonomyConfig()
    decision = config.decision_for(risk)
    # Belt-and-suspenders: the hard gates can never auto-execute even if a
    # caller hands us a hand-rolled config that slipped past AutonomyConfig.
    if risk in AutonomyConfig.HARD_GATED and decision == Decision.AUTO:
        return Decision.REQUIRE_APPROVAL
    return decision


def requires_human(risk: RiskLevel, config: AutonomyConfig | None = None) -> bool:
    return evaluate(risk, config) == Decision.REQUIRE_APPROVAL
