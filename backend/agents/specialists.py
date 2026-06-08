"""The three specialist agents (supply: venues, supply: providers, demand:
marketing). Each shares BaseAgent + the Job/JobResult contract, so they are
independently buildable.

The sim `propose_actions` here are deterministic, representative plans so the
COO + guardrail pipeline can be tested end-to-end without an LLM. In production
these methods would call self.llm.complete(...) with the agent's tools and let
Claude plan; the surrounding pipeline (guardrails, escalation, reporting) is
unchanged.
"""
from __future__ import annotations

from .base import BaseAgent
from .types import Job


class VenuesAgent(BaseAgent):
    name = "venues"
    role = "Grow venue supply: attract, list, schedule, coordinate property owners."
    system_prompt = ("You are the Venues agent for VenuePlus. You find owners of "
                     "underused spaces, draft listings, price by comps, and manage "
                     "availability. Owners confirm before a listing goes live.")
    tool_names = ("search_market", "draft_venue_listing", "set_availability",
                  "send_outreach", "set_price")

    def propose_actions(self, job: Job, state: dict) -> list[dict]:
        city = job.city or "target city"
        return [
            {"tool": "search_market", "args": {"query": f"underused venues in {city}"}},
            {"tool": "draft_venue_listing", "args": {"city": city, "type": "rooftop"}},
            {"tool": "set_price", "args": {"amount_cents": 0, "basis": "comps"}},
            {"tool": "send_outreach", "args": {"count": 10, "audience": "venue_owners"}},
        ]


class ProvidersAgent(BaseAgent):
    name = "providers"
    role = "Grow service supply: recruit, profile, schedule, coordinate providers."
    system_prompt = ("You are the Providers agent for VenuePlus. You recruit gig "
                     "workers (security, cleaning, DJ, catering...), build profiles, "
                     "keep availability current, and ensure bookings are serviceable.")
    tool_names = ("search_market", "draft_provider_profile", "set_availability",
                  "send_outreach", "read_bookings")

    def propose_actions(self, job: Job, state: dict) -> list[dict]:
        city = job.city or "target city"
        return [
            {"tool": "read_bookings", "args": {"city": city}},
            {"tool": "search_market", "args": {"query": f"security & DJ providers in {city}"}},
            {"tool": "draft_provider_profile", "args": {"city": city, "category": "security"}},
            {"tool": "send_outreach", "args": {"count": 15, "audience": "gig_workers"}},
        ]


class MarketingAgent(BaseAgent):
    name = "marketing"
    role = "Grow demand: market to the public and recruit influencers/creators."
    system_prompt = ("You are the Marketing agent for VenuePlus. You run campaigns "
                     "by city and use-case and recruit micro-creators into ticketed "
                     "Creator Events to drive demand and content.")
    tool_names = ("read_metrics", "create_campaign", "send_outreach", "spend_ad_budget")

    def check_blockers(self, job: Job) -> list[str]:
        # Demand work is pointless without supply. If the COO hasn't confirmed
        # coverage for this city, block and let the COO sequence supply first.
        if not job.context.get("coverage_ok"):
            return [f"no confirmed service coverage in {job.city or 'target city'}"]
        return []

    def propose_actions(self, job: Job, state: dict) -> list[dict]:
        city = job.city or "target city"
        return [
            {"tool": "read_metrics", "args": {"city": city}},
            {"tool": "create_campaign", "args": {"city": city, "use_case": "rooftop_picnic"}},
            {"tool": "send_outreach", "args": {"count": 25, "audience": "micro_creators"}},
            # Intentionally above the default $500/day cap -> escalates for approval
            {"tool": "spend_ad_budget", "args": {"amount_cents": 75_000, "channel": "social"}},
        ]


def build_specialists(registry, guardrails, llm=None) -> dict:
    return {
        "venues": VenuesAgent(registry, guardrails, llm),
        "providers": ProvidersAgent(registry, guardrails, llm),
        "marketing": MarketingAgent(registry, guardrails, llm),
    }
