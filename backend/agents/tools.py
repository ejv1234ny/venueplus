"""Tool abstraction + registry.

Agents never touch the database directly — they act through Tools, which wrap
existing VenuePlus endpoints/services and carry a RiskLevel that the guardrail
engine reads. Handlers here are thin; in production they call the real API
(e.g. POST /api/venues). For the scaffold/tests they return structured stubs.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Optional

from .types import RiskLevel


@dataclass
class Tool:
    name: str
    description: str
    risk: RiskLevel
    handler: Callable[..., dict]
    # which agents may use this tool ("*" = any)
    agents: tuple = ("*",)

    def usable_by(self, agent: str) -> bool:
        return "*" in self.agents or agent in self.agents

    def run(self, **kwargs) -> dict:
        return self.handler(**kwargs)


class ToolRegistry:
    def __init__(self):
        self._tools: dict[str, Tool] = {}

    def register(self, tool: Tool):
        self._tools[tool.name] = tool

    def get(self, name: str) -> Optional[Tool]:
        return self._tools.get(name)

    def for_agent(self, agent: str) -> list[Tool]:
        return [t for t in self._tools.values() if t.usable_by(agent)]

    def all(self) -> list[Tool]:
        return list(self._tools.values())


# --------------------------------------------------------------------------
# Default tool set (stub handlers). Replace handlers with real API calls.
# --------------------------------------------------------------------------
def _stub(**kwargs) -> dict:
    return {"ok": True, "stub": True, "args": kwargs}


def default_registry() -> ToolRegistry:
    r = ToolRegistry()
    # READ
    r.register(Tool("search_market", "Search public sources / comps for leads or pricing",
                    RiskLevel.READ, _stub))
    r.register(Tool("read_metrics", "Read marketplace KPIs / liquidity", RiskLevel.READ, _stub))
    r.register(Tool("read_bookings", "Read bookings + service coverage", RiskLevel.READ, _stub))
    # INTERNAL_WRITE
    r.register(Tool("draft_venue_listing", "Draft a venue listing (owner confirms before live)",
                    RiskLevel.INTERNAL_WRITE, _stub, agents=("venues",)))
    r.register(Tool("draft_provider_profile", "Draft a provider profile",
                    RiskLevel.INTERNAL_WRITE, _stub, agents=("providers",)))
    r.register(Tool("set_availability", "Set venue/provider availability windows",
                    RiskLevel.INTERNAL_WRITE, _stub, agents=("venues", "providers")))
    r.register(Tool("create_campaign", "Create a marketing campaign draft",
                    RiskLevel.INTERNAL_WRITE, _stub, agents=("marketing",)))
    # OUTBOUND
    r.register(Tool("send_outreach", "Send an outreach message to a prospect",
                    RiskLevel.OUTBOUND, _stub))
    # FINANCIAL
    r.register(Tool("set_price", "Adjust a listing price within the owner-approved band",
                    RiskLevel.FINANCIAL, _stub, agents=("venues",)))
    r.register(Tool("spend_ad_budget", "Spend marketing budget on a channel",
                    RiskLevel.FINANCIAL, _stub, agents=("marketing",)))
    # MONEY_MOVEMENT (hard-gated)
    r.register(Tool("issue_payout", "Issue a payout/refund", RiskLevel.MONEY_MOVEMENT, _stub))
    # LEGAL (hard-gated)
    r.register(Tool("sign_agreement", "Commit to a contract / change terms",
                    RiskLevel.LEGAL, _stub))
    return r
