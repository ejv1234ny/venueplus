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
from agents.tools import ToolContext
from agents import tools as tool_registry


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
        "search_osm_venues",       # read   -- public candidate venues
        "list_existing_venues",    # read   -- what we already list (dedupe)
        "list_venue_leads",        # read   -- prospect pipeline
        "create_venue_prospect",   # write  -- venue lead (sidecar + draft)
        "send_venue_lead_outreach",  # outbound -- invite a prospect (uses pitch)
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

    def operate(self, db: Any, city: str | None, live: bool = True,
                limit: int | None = 12) -> list[PlannedAction]:
        """Scout real venues (live OSM when ``live``; sim samples otherwise),
        drop ones we already carry, and emit a ``draft_venue_listing`` action
        per genuinely-new candidate — each carrying the real candidate dict, so
        the auto-approved write actually creates an inactive draft venue."""
        rctx = ToolContext(db=db, live=live)
        have = {(v.get("title") or "").strip().lower()
                for v in tool_registry.list_existing_venues(
                    {"city": city}, rctx).get("venues", [])}
        found = tool_registry.search_osm_venues(
            {"city": city}, rctx).get("candidates", [])

        actions: list[PlannedAction] = []

        # 1) Discovery: turn new public candidates into venue leads (sidecar +
        #    inactive draft), deduped against what we already carry.
        seen: set[str] = set()
        discovered = 0
        for cand in found:
            name = (cand.get("name") or "").strip()
            key = name.lower()
            if not name or key in have or key in seen:
                continue
            seen.add(key)
            actions.append(PlannedAction(
                "create_venue_prospect", RiskLevel.INTERNAL_WRITE,
                {"candidate": cand, "city": city},
                f"Add venue lead '{name}' (draft for owner review)"))
            discovered += 1
            if limit and discovered >= limit:
                break

        # 2) Outreach: work the existing prospect list — email leads that have a
        #    contact and haven't been reached (gated for human approval).
        from models import VenueLead, VenueLeadStatus
        q = db.query(VenueLead).filter(
            VenueLead.status == VenueLeadStatus.NEW,
            VenueLead.outreach_sent.is_(False),
            VenueLead.email.isnot(None))
        if city:
            q = q.filter(VenueLead.city == city)
        for lead in q.limit(limit or 25).all():
            actions.append(PlannedAction(
                "send_venue_lead_outreach", RiskLevel.OUTBOUND,
                {"lead_id": lead.id, "city": city},
                f"Invite venue prospect '{lead.name}' to list"))
        return actions

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

    def operate(self, db: Any, city: str | None, live: bool = True,
                limit: int | None = 15) -> list[PlannedAction]:
        """Gather real provider candidates (OSM + Google Places when keyed),
        prioritise the categories our coverage is missing, and emit a
        ``create_provider_invite`` per new business (carrying the real
        candidate) plus a gated ``send_provider_sms`` when a phone was found.
        The invite auto-executes into a real inactive lead; the SMS escalates
        for human approval under the default posture. When ``live`` is false
        (dev/CI) it reads sim candidates so runs stay offline."""
        from services import provider_leads as pl

        rctx = ToolContext(db=db, live=live)
        missing = set(tool_registry.list_existing_providers(
            {"city": city}, rctx).get("missing_categories", []))

        if live:
            candidates, _errors = pl.gather_candidates(city or "", ["osm", "google"])
        else:
            candidates = tool_registry.search_providers(
                {"city": city}, rctx).get("candidates", [])

        def cat_of(c: dict) -> str | None:
            cat = pl._category_of(c)
            return cat.value if cat else None

        # Classifiable only; missing-coverage categories first.
        candidates = [c for c in candidates if cat_of(c)]
        candidates.sort(key=lambda c: 0 if cat_of(c) in missing else 1)

        actions: list[PlannedAction] = []
        seen: set[str] = set()
        invites = 0
        for cand in candidates:
            name = (cand.get("name") or "").strip()
            key = name.lower()
            if not name or key in seen:
                continue
            seen.add(key)
            cv = cat_of(cand)
            actions.append(PlannedAction(
                "create_provider_invite", RiskLevel.INTERNAL_WRITE,
                {"candidate": cand, "city": city},
                f"Recruit {cv} lead '{name}'"))
            invites += 1
            phone = (cand.get("tags") or {}).get("phone")
            if phone:
                actions.append(PlannedAction(
                    "send_provider_sms", RiskLevel.OUTBOUND,
                    {"phone": phone, "name": name, "city": city,
                     "message": (f"VenuePlus (free beta): list {name} so event "
                                 "hosts near you can book. Reply STOP to opt out.")},
                    f"Text {name} to finish onboarding"))
            if limit and invites >= limit:
                break
        return actions

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
# 4. Creator / Influencer -- managed-pipeline demand agent                     #
# --------------------------------------------------------------------------- #
class CreatorAgent(BaseAgent):
    """Finds (from imported lists) and manages micro-creators/influencers,
    recruiting them into the Creator Events ticketing product.

    Social-platform discovery isn't automatable without paid APIs, so the
    pipeline is managed: leads are imported, then this agent drafts personalized
    outreach for new leads and, once a lead commits, auto-prepares a draft
    Creator Event under a placeholder account the real creator can claim. The
    outreach email is human-gated; drafting is autonomous.
    """

    name = "creator"
    role = "Creator & Influencer Agent"
    tool_names = (
        "list_creator_leads",          # read
        "draft_creator_outreach",      # write    -- personalized copy
        "send_creator_outreach_email",  # outbound -- recruit
        "draft_creator_event",         # write    -- ready-to-publish draft
    )
    system_prompt = (
        "You are the Creator & Influencer Agent for VenuePlus. Your job is to "
        "recruit micro-creators (roughly 1k-50k local followers) into hosting "
        "ticketed Creator Events, which brings their audience as demand.\n\n"
        "Operating rules:\n"
        "- Work the imported lead pipeline; you do not scrape social platforms.\n"
        "- For a new lead: draft one specific, personal invitation referencing "
        "their niche and city. Never bulk spam.\n"
        "- Once a lead commits, prepare a draft event so they can go live fast.\n"
        "- A human approves any outbound message. Keep each action's `reason` to "
        "one concrete line."
    )

    def operate(self, db: Any, city: str | None, live: bool = True,
                limit: int | None = 25) -> list[PlannedAction]:
        """Manage the creator pipeline for a market: draft (and gate-send)
        outreach for new leads, and draft events for committed ones. Emits
        nothing when no leads are imported yet."""
        from services import creator_leads as cl
        from models_creator import CreatorLeadStatus

        actions: list[PlannedAction] = []
        for lead in cl.list_leads(db, city):
            if len(actions) >= (limit or 10**9):
                break
            if lead.status == CreatorLeadStatus.NEW and not lead.outreach_sent:
                actions.append(PlannedAction(
                    "draft_creator_outreach", RiskLevel.INTERNAL_WRITE,
                    {"lead_id": lead.id, "city": city},
                    f"Draft outreach for {lead.name} ({lead.niche or 'creator'})"))
                if lead.email:
                    actions.append(PlannedAction(
                        "send_creator_outreach_email", RiskLevel.OUTBOUND,
                        {"lead_id": lead.id, "city": city},
                        f"Invite {lead.name} to host a ticketed event"))
            elif lead.status == CreatorLeadStatus.COMMITTED and not lead.event_drafted:
                actions.append(PlannedAction(
                    "draft_creator_event", RiskLevel.INTERNAL_WRITE,
                    {"lead_id": lead.id, "city": city},
                    f"Prepare a draft event for {lead.name}"))
        return actions

    def fallback_plan(self, goal: str, city: str | None,
                      context: dict[str, Any]) -> list[PlannedAction]:
        return [
            PlannedAction("list_creator_leads", RiskLevel.READ, {"city": city},
                          f"Review the creator pipeline for {city or 'all markets'}"),
        ]


# --------------------------------------------------------------------------- #
# Registry the COO dispatches through. Order encodes supply-before-demand.
SPECIALISTS: dict[str, type[BaseAgent]] = {
    "venues": VenuesAgent,
    "providers": ProvidersAgent,
    "marketing": MarketingAgent,
    "creator": CreatorAgent,
}


def build_agent(name: str, llm=None) -> BaseAgent:
    return SPECIALISTS[name](llm=llm)
