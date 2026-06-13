"""Worker-agent specialists.

The COO orchestrator dispatches each job to one of these. They share the
:class:`agents.base.BaseAgent` planning contract (real Claude loop when a key
is set; deterministic fallback otherwise).

Build order is deliberate -- one real agent at a time, supply before demand:

  1. **Venues** (this file, real) -- grows venue supply. Built first because a
     market has nothing to sell without venues.
  2. **Providers** (real) -- grows service-provider supply into coverage gaps.
     Promoted to a real Claude loop (this file).
  3. **Marketing** (real) -- drives demand into markets that already have
     supply. Promoted last (this file), so it can read supply before spending.

All three specialists are real and share the same ``fallback_plan`` contract,
so the orchestrator treats them uniformly -- each was upgraded in place without
touching the COO.
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
# 2. Providers -- the second real, Claude-driven specialist                   #
# --------------------------------------------------------------------------- #
class ProvidersAgent(BaseAgent):
    """Grows on-site service-provider supply (photographers, caterers, DJs,
    bartenders, security, cleaning, decoration) in a market.

    Real backend: a Claude loop grounded in (a) the providers we already have
    and our coverage gaps by category and (b) public candidate businesses, so
    it recruits into genuine gaps rather than piling onto covered categories.
    Deterministic fallback: the canonical search -> invite -> outreach plan.
    """

    name = "providers"
    role = "Service Provider Supply Agent"
    tool_names = (
        "search_providers",          # read   -- public candidate businesses
        "list_existing_providers",   # read   -- what we have + coverage gaps
        "create_provider_invite",    # write  -- internal invite record
        "send_provider_sms",         # outbound -- nudge to finish onboarding
    )
    system_prompt = (
        "You are the Service Provider Supply Agent for VenuePlus, a marketplace "
        "for booking event venues and the on-site services an event needs. Your "
        "single job is to grow the supply of high-quality, bookable service "
        "providers in your assigned market.\n\n"
        "Operating rules:\n"
        "- Read before you write: check our existing providers and which "
        "categories are under-covered before recruiting. Prioritise the "
        "categories that are missing or thin (catering, photography, DJ, "
        "bartending, security, cleaning, decoration).\n"
        "- Recruit candidates that plausibly serve paid events; don't duplicate "
        "providers we already have.\n"
        "- Outreach is one specific, useful invitation per provider -- never "
        "bulk spam. Each SMS needs the provider and category it targets.\n"
        "- You propose; a human guardrail approves anything that contacts the "
        "outside world. Prefer a few strong recruits in real gaps over many "
        "weak ones.\n"
        "- Keep every action's `reason` to one concrete line."
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
# 3. Marketing -- the third real, Claude-driven specialist                    #
# --------------------------------------------------------------------------- #
class MarketingAgent(BaseAgent):
    """Drives demand (public hosts and creators) into markets that already
    have supply.

    Real backend: a Claude loop that first reads the market's supply/demand
    state (so it doesn't pour spend into a market with nothing to book), then
    proposes SEO content, social posts and -- within budget -- paid campaigns.
    Referral payouts (money movement) and partnership agreements (legal) are
    always human-gated. Deterministic fallback: SEO + social, plus a paid
    campaign / referral / partnership when the goal calls for them.
    """

    name = "marketing"
    role = "Growth & Marketing Agent"
    tool_names = (
        "read_market_metrics",       # read     -- supply/demand before spending
        "generate_seo_content",      # write    -- SEO landing copy
        "publish_social_post",       # outbound -- announcement
        "launch_paid_ad_campaign",   # financial-- paid acquisition (within budget)
        "issue_referral_payout",     # money_movement -- HARD GATE
        "sign_partnership_agreement",  # legal  -- HARD GATE
    )
    system_prompt = (
        "You are the Growth & Marketing Agent for VenuePlus, a marketplace for "
        "booking event venues and on-site services. Your job is to drive demand "
        "(hosts and creators) into your assigned market.\n\n"
        "Operating rules:\n"
        "- Read before you spend: check the market's supply (venues, providers) "
        "and current demand first. Do NOT drive paid demand into a market that "
        "has little supply -- you'd burn budget on bookings that can't be "
        "fulfilled. Lead with organic (SEO, social) when supply is still thin.\n"
        "- Keep paid spend within the stated budget; the guardrail enforces a "
        "daily cap and will send anything over it for approval.\n"
        "- Referral payouts and partnership agreements always require a human -- "
        "propose them with a clear rationale; never assume they will auto-run.\n"
        "- You propose; a human guardrail approves anything that contacts the "
        "outside world or spends money.\n"
        "- Keep every action's `reason` to one concrete line."
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


# --------------------------------------------------------------------------- #
# Registry the COO dispatches through. Order encodes supply-before-demand.
SPECIALISTS: dict[str, type[BaseAgent]] = {
    "venues": VenuesAgent,
    "providers": ProvidersAgent,
    "marketing": MarketingAgent,
}


def build_agent(name: str, llm=None) -> BaseAgent:
    return SPECIALISTS[name](llm=llm)
