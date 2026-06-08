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

Daily caps: when a risk tier is configured ``auto``, the guardrail still
downgrades the action to ``require_approval`` once the fleet's outbound-message
or spend cap for the day would be exceeded. Pass a :class:`UsageTracker` and
the action ``args`` to enable cap checks; omit them (the default) for a pure
risk-tier decision.
"""
from agents.types import RiskLevel, Decision, AutonomyConfig


class UsageTracker:
    """Accumulates per-fleet outbound message count and spend (cents) so the
    guardrail can enforce daily caps across a run. Process-local; swap for a
    DB/redis-backed counter when caps must hold across processes/days."""

    def __init__(self):
        self.outbound = 0
        self.spend_cents = 0

    def record(self, risk: RiskLevel, args: dict | None) -> None:
        args = args or {}
        if risk == RiskLevel.OUTBOUND:
            self.outbound += int(args.get("count", 1))
        elif risk in (RiskLevel.FINANCIAL, RiskLevel.MONEY_MOVEMENT):
            self.spend_cents += spend_cents(args)


def spend_cents(args: dict | None) -> int:
    """Normalise a spend amount from action args. Supports ``amount_cents``,
    ``budget_usd`` and ``amount_usd`` (the shapes the planner emits)."""
    args = args or {}
    if "amount_cents" in args:
        return int(args["amount_cents"])
    dollars = args.get("budget_usd", args.get("amount_usd", 0)) or 0
    return int(round(float(dollars) * 100))


def evaluate(risk: RiskLevel, config: AutonomyConfig | None = None,
             usage: "UsageTracker | None" = None,
             args: dict | None = None) -> Decision:
    """Return the guardrail decision for an action of ``risk``.

    With ``usage`` + ``args`` supplied, an otherwise-``auto`` outbound or
    spend action is downgraded to ``require_approval`` when it would push the
    fleet past its daily cap.
    """
    config = config or AutonomyConfig()
    decision = config.decision_for(risk)
    # Belt-and-suspenders: the hard gates can never auto-execute even if a
    # caller hands us a hand-rolled config that slipped past AutonomyConfig.
    if risk in AutonomyConfig.HARD_GATED and decision == Decision.AUTO:
        return Decision.REQUIRE_APPROVAL

    # Cap enforcement only matters when the tier is otherwise auto.
    if decision == Decision.AUTO and usage is not None:
        if risk == RiskLevel.OUTBOUND:
            projected = usage.outbound + int((args or {}).get("count", 1))
            if projected > config.outbound_daily_cap:
                return Decision.REQUIRE_APPROVAL
        elif risk == RiskLevel.FINANCIAL:
            projected = usage.spend_cents + spend_cents(args)
            if projected > config.spend_daily_cap_cents:
                return Decision.REQUIRE_APPROVAL

    return decision


def requires_human(risk: RiskLevel, config: AutonomyConfig | None = None) -> bool:
    return evaluate(risk, config) == Decision.REQUIRE_APPROVAL
