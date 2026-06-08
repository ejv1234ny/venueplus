"""Guardrail policy engine.

Given a proposed tool call, decides AUTO / REQUIRE_APPROVAL / DENY based on the
tool's risk level and live usage (spend + outbound caps). This is the layer
that makes 'mostly autonomous' safe: money-movement and legal are always
gated, spend/outbound are auto only within caps. Policy is config, not prompt,
so an agent cannot talk its way past it.
"""
from __future__ import annotations

from collections import defaultdict

from .tools import Tool
from .types import AutonomyConfig, Decision, RiskLevel


class UsageTracker:
    """In-memory per-agent daily counters (swap for a DB-backed store in prod)."""
    def __init__(self):
        self.outbound: dict[str, int] = defaultdict(int)
        self.spend_cents: dict[str, int] = defaultdict(int)

    def record(self, agent: str, risk: RiskLevel, args: dict):
        if risk == RiskLevel.OUTBOUND:
            self.outbound[agent] += int(args.get("count", 1))
        elif risk in (RiskLevel.FINANCIAL, RiskLevel.MONEY_MOVEMENT):
            self.spend_cents[agent] += int(args.get("amount_cents", 0))


class GuardrailEngine:
    def __init__(self, config: AutonomyConfig | None = None,
                 usage: UsageTracker | None = None):
        self.config = config or AutonomyConfig()
        self.usage = usage or UsageTracker()

    def evaluate(self, agent: str, tool: Tool, args: dict) -> tuple[Decision, str]:
        # Kill switch
        if not self.config.enabled:
            return Decision.DENY, "agent fleet disabled (kill switch)"

        # Tool/agent authorization
        if not tool.usable_by(agent):
            return Decision.DENY, f"{agent} is not authorized to use {tool.name}"

        base = self.config.decision_for(tool.risk)
        if base == Decision.DENY:
            return Decision.DENY, f"{tool.risk.value} denied by policy"

        # Cap checks can upgrade an AUTO to REQUIRE_APPROVAL
        if tool.risk == RiskLevel.OUTBOUND:
            projected = self.usage.outbound[agent] + int(args.get("count", 1))
            if projected > self.config.outbound_daily_cap:
                return (Decision.REQUIRE_APPROVAL,
                        f"outbound cap exceeded ({projected}>{self.config.outbound_daily_cap})")

        if tool.risk in (RiskLevel.FINANCIAL, RiskLevel.MONEY_MOVEMENT):
            amount = int(args.get("amount_cents", 0))
            projected = self.usage.spend_cents[agent] + amount
            if projected > self.config.spend_daily_cap_cents:
                return (Decision.REQUIRE_APPROVAL,
                        f"spend cap exceeded (${projected/100:.0f}>"
                        f"${self.config.spend_daily_cap_cents/100:.0f})")
            # out-of-band single spend also gets gated
            if amount > self.config.spend_daily_cap_cents:
                return (Decision.REQUIRE_APPROVAL,
                        f"single spend ${amount/100:.0f} over daily cap")

        return base, "within policy"

    def commit_usage(self, agent: str, tool: Tool, args: dict):
        """Call after an AUTO action actually executes, to advance counters."""
        self.usage.record(agent, tool.risk, args)
