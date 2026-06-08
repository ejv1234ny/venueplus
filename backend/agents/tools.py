"""Tool registry — the canonical map of every tool an agent can call to its
RiskLevel and its handler.

Today the orchestrator's plan is deterministic and the handlers are stubs
(actions are marked executed without real side effects). This registry is the
single place that:
  * pins each tool's risk tier (so risk is defined once, not re-typed in the
    planner), and
  * holds the handler that will perform the real side effect once the worker
    agents are wired to the live API (`/api/venues`, `/api/providers`,
    `/api/creator-events`, outbound email/SMS, ad spend, etc.).

`risk_for(tool)` lets callers (and tests) confirm the planner and the registry
agree on every tool's risk.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

from agents.types import RiskLevel


def _stub(**kwargs) -> dict:
    """Placeholder handler. Replace per-tool with a real API call."""
    return {"ok": True, "stub": True, "args": kwargs}


@dataclass
class Tool:
    name: str
    risk: RiskLevel
    description: str
    handler: Callable[..., dict] = _stub

    def run(self, **kwargs) -> dict:
        return self.handler(**kwargs)


# The tools the COO plan emits today, each pinned to a risk tier. Keep this in
# sync with orchestrator._plan — `test` asserts they agree.
REGISTRY: dict[str, Tool] = {t.name: t for t in [
    # venues
    Tool("search_osm_venues", RiskLevel.READ, "Scout candidate venues from public sources"),
    Tool("draft_venue_listing", RiskLevel.INTERNAL_WRITE, "Draft a venue listing for owner review"),
    Tool("send_venue_outreach_email", RiskLevel.OUTBOUND, "Email a venue owner to invite a listing"),
    # providers
    Tool("search_providers", RiskLevel.READ, "Find service providers serving a market"),
    Tool("create_provider_invite", RiskLevel.INTERNAL_WRITE, "Create an invite record for a provider"),
    Tool("send_provider_sms", RiskLevel.OUTBOUND, "Text a provider to finish onboarding"),
    # marketing
    Tool("generate_seo_content", RiskLevel.INTERNAL_WRITE, "Draft SEO landing copy"),
    Tool("publish_social_post", RiskLevel.OUTBOUND, "Publish an announcement to social"),
    Tool("launch_paid_ad_campaign", RiskLevel.FINANCIAL, "Start a paid acquisition campaign"),
    Tool("issue_referral_payout", RiskLevel.MONEY_MOVEMENT, "Pay a referral incentive (hard-gated)"),
    Tool("sign_partnership_agreement", RiskLevel.LEGAL, "Sign a partnership agreement (hard-gated)"),
]}


def get(name: str) -> Tool | None:
    return REGISTRY.get(name)


def risk_for(name: str) -> RiskLevel | None:
    tool = REGISTRY.get(name)
    return tool.risk if tool else None
