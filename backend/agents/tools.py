"""Tool registry -- the canonical map of every tool an agent can call to its
RiskLevel and its handler.

This is the single place that:
  * pins each tool's risk tier (risk is defined once here, not re-typed in
    planners), and
  * holds the handler that performs the side effect when the orchestrator
    executes an auto-approved (or human-approved) action.

Execution mode is governed by :class:`ToolContext`:

  * ``live`` -- when True (a real model is driving, i.e. ``ANTHROPIC_API_KEY``
    is set), READ tools hit real sources (our DB, public data). When False
    (dev / CI / sim), reads return small simulated samples so tests stay fast,
    offline and deterministic.
  * ``dry_run`` -- when True (the current pilot-prep posture), WRITE / OUTBOUND
    / FINANCIAL tools DO NOT perform their real side effect; they return a
    structured ``{"dry_run": True, ...}`` record describing what they *would*
    do. Flip to False only when you're ready for agents to actually create
    listings, send email/SMS and spend. MONEY_MOVEMENT / LEGAL are hard-gated
    by the guardrail and never reach a handler without explicit human approval.

`risk_for(tool)` lets callers (and tests) confirm a planner and the registry
agree on every tool's risk.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable

from agents.types import RiskLevel


# --------------------------------------------------------------------------- #
# Execution context                                                           #
# --------------------------------------------------------------------------- #
@dataclass
class ToolContext:
    """Carries the DB session and the two execution-mode switches into a
    handler. ``db`` may be None in pure-unit tests; handlers degrade to a
    simulated result when it is."""
    db: Any = None
    live: bool = False      # reads hit real sources when True
    dry_run: bool = True    # writes/outbound are simulated when True


# --------------------------------------------------------------------------- #
# Handlers                                                                     #
# --------------------------------------------------------------------------- #
def _dry(tool: str, args: dict, would: str) -> dict:
    """Standard 'logged, not performed' record for a dry-run side effect."""
    return {"ok": True, "dry_run": True, "tool": tool, "would": would,
            "args": args}


def _noop(args: dict, ctx: "ToolContext") -> dict:
    return {"ok": True, "stub": True, "args": args}


# ---- venue reads (real when live, simulated otherwise) -------------------- #
_SIM_OSM_VENUES = [
    {"name": "The Loft on 5th", "type": "event_space", "source": "osm:sim"},
    {"name": "Riverside Community Hall", "type": "community_centre", "source": "osm:sim"},
    {"name": "Gallery 23", "type": "gallery", "source": "osm:sim"},
]


def search_osm_venues(args: dict, ctx: "ToolContext") -> dict:
    """Scout candidate venues from public data (OpenStreetMap).

    Live: queries the Overpass API for event-suitable features in the city.
    Sim: returns a small fixed sample (no network), so tests are deterministic.
    """
    city = args.get("city")
    if not ctx.live:
        return {"ok": True, "live": False, "city": city,
                "candidates": _SIM_OSM_VENUES}
    try:
        import json
        import urllib.parse
        import urllib.request

        # Event-suitable OSM features within the named city's area.
        q = f'''
        [out:json][timeout:25];
        area["name"="{city}"]["boundary"="administrative"]->.a;
        (
          node["amenity"="events_venue"](area.a);
          node["amenity"="community_centre"](area.a);
          node["amenity"="conference_centre"](area.a);
          way["amenity"="events_venue"](area.a);
          node["tourism"="gallery"](area.a);
        );
        out center 60;
        '''
        data = urllib.parse.urlencode({"data": q}).encode()
        req = urllib.request.Request(
            "https://overpass-api.de/api/interpreter", data=data,
            headers={"User-Agent": "VenuePlus-VenuesAgent/1.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            payload = json.loads(resp.read().decode())
        candidates = []
        for el in payload.get("elements", []):
            tags = el.get("tags", {})
            name = tags.get("name")
            if not name:
                continue
            candidates.append({
                "name": name,
                "type": tags.get("amenity") or tags.get("tourism") or "venue",
                "lat": el.get("lat") or (el.get("center") or {}).get("lat"),
                "lon": el.get("lon") or (el.get("center") or {}).get("lon"),
                "source": "osm:overpass",
            })
        return {"ok": True, "live": True, "city": city,
                "candidates": candidates}
    except Exception as e:  # network/parse failure -> safe, empty result
        return {"ok": False, "live": True, "city": city, "candidates": [],
                "error": f"{type(e).__name__}: {e}"}


def list_existing_venues(args: dict, ctx: "ToolContext") -> dict:
    """What we already list in the market -- so the agent doesn't re-draft a
    venue we already carry. Live: queries our DB. Sim/no-DB: empty."""
    city = args.get("city")
    if ctx.db is None:
        return {"ok": True, "live": False, "city": city, "venues": []}
    try:
        from models import Venue
        rows = (ctx.db.query(Venue)
                .filter(Venue.is_active.is_(True)))
        if city:
            rows = rows.filter(Venue.city.ilike(f"%{city}%"))
        rows = rows.limit(200).all()
        return {"ok": True, "live": True, "city": city,
                "count": len(rows),
                "venues": [{"id": v.id, "title": v.title,
                            "venue_type": v.venue_type, "city": v.city}
                           for v in rows]}
    except Exception as e:
        return {"ok": False, "city": city, "venues": [],
                "error": f"{type(e).__name__}: {e}"}


# ---- writes / outbound (dry-run today) ------------------------------------ #
def draft_venue_listing(args: dict, ctx: "ToolContext") -> dict:
    if ctx.dry_run:
        return _dry("draft_venue_listing", args,
                    "create an internal draft Venue listing for owner review")
    # live write path -- intentionally not enabled yet (pilot is dry-run).
    return {"ok": False, "not_implemented": "live draft write disabled until "
            "go-live; running dry_run only"}


def send_venue_outreach_email(args: dict, ctx: "ToolContext") -> dict:
    if ctx.dry_run:
        return _dry("send_venue_outreach_email", args,
                    "email a venue owner inviting them to list")
    return {"ok": False, "not_implemented": "live outbound email disabled "
            "until go-live; running dry_run only"}


@dataclass
class Tool:
    name: str
    risk: RiskLevel
    description: str
    handler: Callable[[dict, "ToolContext"], dict] = field(default=_noop)

    def run(self, args: dict, ctx: "ToolContext | None" = None) -> dict:
        return self.handler(args or {}, ctx or ToolContext())


# The tools the COO plan emits, each pinned to a risk tier. Venue tools have
# real/dry-run handlers; the rest remain safe no-ops pending their agent's
# promotion (providers, then marketing).
REGISTRY: dict[str, Tool] = {t.name: t for t in [
    # venues (first real agent)
    Tool("search_osm_venues", RiskLevel.READ,
         "Scout candidate venues from public sources", search_osm_venues),
    Tool("list_existing_venues", RiskLevel.READ,
         "List venues we already carry in a market (dedupe)", list_existing_venues),
    Tool("draft_venue_listing", RiskLevel.INTERNAL_WRITE,
         "Draft a venue listing for owner review", draft_venue_listing),
    Tool("send_venue_outreach_email", RiskLevel.OUTBOUND,
         "Email a venue owner to invite a listing", send_venue_outreach_email),
    # providers (stub agent)
    Tool("search_providers", RiskLevel.READ, "Find service providers serving a market"),
    Tool("create_provider_invite", RiskLevel.INTERNAL_WRITE, "Create an invite record for a provider"),
    Tool("send_provider_sms", RiskLevel.OUTBOUND, "Text a provider to finish onboarding"),
    # marketing (stub agent)
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


def execute(name: str, args: dict, ctx: "ToolContext | None" = None) -> dict:
    """Run a tool's handler. Unknown tool -> structured error (never raises)."""
    tool = REGISTRY.get(name)
    if tool is None:
        return {"ok": False, "error": f"unknown tool: {name}"}
    return tool.run(args, ctx or ToolContext())
