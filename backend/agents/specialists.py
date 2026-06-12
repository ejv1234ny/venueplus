"""Worker-agent specialists.

The COO orchestrator dispatches each job to one of these. They share the
:class:`agents.base.BaseAgent` planning contract (real Claude loop when a key
is set; deterministic fallback otherwise).

Build order is deliberate -- one real agent at a time, supply before demand:

  1. **Venues** (this file, real) -- grows venue supply. Built first because a
     market has nothing to sell without venues.
  2. **Providers** (deterministic stub) -- grows service-provider supply. Next
     to be promoted to a real Claude loop.
  3. **Marketing** (deterministic stub) -- drives demand. Promoted last, once
     supply exists to point demand at.

The stubs implement the same ``fallback_plan`` contract as the real agent, so
the orchestrator treats all three uniformly and each can be upgraded in place
without touching the COO.
"""
from __future__ import annotations

from typing import Any

from agents.base import BaseAgent
from agents.types import PlannedAction, RiskLevel


# --------------------------------------------------------------------------- #
# 1. Venues -- the first real, Claude-driven specialist                       #
# --------------------------------------------------------------------------- #
class VenuesAgent(BaseAgent):
    """Grows venue supply in a market: scout candidates from public sources,
    draft listings for the best fits, and invite owners to list.

    Real backend: a Claude loop grounded in (a) venues we already list in the
    market and (b) public candidate venues, so it doesn't re-draft venues we
    already have and prioritises genuine gaps. Deterministic fallback: the
    canonical scout -> draft -> outreach plan.
    """

    name = "venues"
    role = "Venue Supply Agent"
    tool_names = (
        "search_osm_venues",      # read   -- public candidate venues
        "list_existing_venues",   # read   -- what we already list (dedupe)
        "draft_venue_listing",    # write  -- internal draft for owner review
        "send_venue_outreach_email",  # outbound -- invite the owner
    )
    system_prompt = (
        "You are the Venue Supply Agent for VenuePlus, a marketplace that lets "
        "people book event venues and on-site services. Your single job is to "
        "grow the number of high-quality, bookable venues in your assigned "
        "market.\n\n"
        "Operating rules:\n"
        "- Read before you write: check what we already list and what public "
        "candidates exist before drafting anything. Never re-draft a venue we "
        "already carry.\n"
        "- Draft listings only for venues that plausibly host paid events "
        "(event spaces, halls, studios, lofts, rooftops, community centres, "
        "galleries, restaurants with private rooms).\n"
        "- Outreach is one polite, specific invitation per owner -- never bulk "
        "spam. Each outbound email needs the owner/venue it targets and why.\n"
        "- You propose; a human guardrail approves anything that contacts the "
        "outside world. Prefer a few strong candidates over many weak ones.\n"
        "- Keep every action's `reason` to one concrete line."
    )

    def fallback_plan(self, goal: str, city: str | None,
                      context: dict[str, Any]) -> list[PlannedAction]:
        where = city or "all markets"
        return [
            PlannedAction("search_osm_venues", RiskLevel.READ,
                          {"city": city},
                          f"Scout candidate venues in {where}"),
            PlannedAction("draft_venue_listing", RiskLevel.INTERNAL_WRITE,
                          {"city": city},
                          "Draft listing pages for top candidates"),
            PlannedAction("send_venue_outreach_email", RiskLevel.OUTBOUND,
                          {"city": city},
                          "Email venue owners inviting them to list"),
        ]


# --------------------------------------------------------------------------- #
# 2. Providers -- deterministic stub (next to be promoted)                    #
# --------------------------------------------------------------------------- #
class ProvidersAgent(BaseAgent):
    name = "providers"
    role = "Service Provider Supply Agent"
    tool_names = ("search_providers", "create_provider_invite",
                  "send_provider_sms")
    system_prompt = (
        "You are the Service Provider Supply Agent for VenuePlus. You grow the "
        "supply of bookable on-site service providers (photographers, caterers, "
        "DJs, decorators, AV techs) in your market. (Deterministic stub for "
        "now; pending promotion to a real Claude loop.)"
    )

    def fallback_plan(self, goal: str, city: str | None,
                      context: dict[str, Any]) -> list[PlannedAction]:
        where = city or "all markets"
        return [
            PlannedAction("search_providers", RiskLevel.READ, {"city": city},
                          f"Find service providers serving {where}"),
            PlannedAction("create_provider_invite", RiskLevel.INTERNAL_WRITE,
                          {"city": city},
                          "Generate invite records for high-fit providers"),
            PlannedAction("send_provider_sms", RiskLevel.OUTBOUND,
                          {"city": city},
                          "Text providers to finish onboarding"),
        ]


# --------------------------------------------------------------------------- #
# 3. Marketing -- deterministic stub (promoted last)                          #
# --------------------------------------------------------------------------- #
class MarketingAgent(BaseAgent):
    name = "marketing"
    role = "Growth & Marketing Agent"
    tool_names = ("generate_seo_content", "publish_social_post",
                  "launch_paid_ad_campaign", "issue_referral_payout",
                  "sign_partnership_agreement")
    system_prompt = (
        "You are the Growth & Marketing Agent for VenuePlus. You drive demand "
        "(public hosts and creators) into markets that already have supply. "
        "(Deterministic stub for now; promoted last, after supply exists.)"
    )

    def fallback_plan(self, goal: str, city: str | None,
                      context: dict[str, Any]) -> list[PlannedAction]:
        g = (goal or "").lower()
        actions = [
            PlannedAction("generate_seo_content", RiskLevel.INTERNAL_WRITE,
                          {"city": city},
                          f"Draft SEO landing copy for {city or 'all markets'}"),
            PlannedAction("publish_social_post", RiskLevel.OUTBOUND,
                          {"city": city},
                          "Publish a launch announcement to social"),
        ]
        if any(k in g for k in ("ad", "paid", "campaign", "spend", "grow", "launch")):
            actions.append(PlannedAction(
                "launch_paid_ad_campaign", RiskLevel.FINANCIAL,
                {"city": city, "budget_usd": 500},
                "Start a paid acquisition campaign"))
        if any(k in g for k in ("referral", "payout", "incentive", "bonus")):
            actions.append(PlannedAction(
                "issue_referral_payout", RiskLevel.MONEY_MOVEMENT,
                {"amount_usd": 50},
                "Pay a referral incentive to an existing host"))
        if any(k in g for k in ("partner", "contract", "agreement", "legal")):
            actions.append(PlannedAction(
                "sign_partnership_agreement", RiskLevel.LEGAL,
                {"partner": "local chamber of commerce"},
                "Sign a co-marketing partnership agreement"))
        return actions


# Registry the COO dispatches through. Order encodes supply-before-demand.
SPECIALISTS: dict[str, type[BaseAgent]] = {
    "venues": VenuesAgent,
    "providers": ProvidersAgent,
    "marketing": MarketingAgent,
}


def build_agent(name: str, llm=None) -> BaseAgent:
    return SPECIALISTS[name](llm=llm)
