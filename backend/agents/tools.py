"""Tool registry — the canonical map of every tool an agent can call to its
RiskLevel and its handler.

Execution mode is governed by :class:`ToolContext`:
  * ``live`` — READ tools hit real sources (our DB, public data) when a real
    model drives the run; otherwise simulated samples (fast/offline).
  * ``dry_run`` — when True, WRITE / OUTBOUND / FINANCIAL tools only log what
    they *would* do. When False (AGENTS_LIVE), they perform real side effects
    through the app's services (DB drafts, email, SMS). MONEY_MOVEMENT / LEGAL
    are hard-gated by the guardrail and only run after explicit human approval.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable

from agents.types import RiskLevel


@dataclass
class ToolContext:
    db: Any = None
    live: bool = False      # reads hit real sources when True
    dry_run: bool = True    # writes/outbound are simulated when True


# --------------------------------------------------------------------------- #
# Handlers                                                                     #
# --------------------------------------------------------------------------- #
def _dry(tool: str, args: dict, would: str) -> dict:
    return {"ok": True, "dry_run": True, "tool": tool, "would": would, "args": args}


def _noop(args: dict, ctx: "ToolContext") -> dict:
    return {"ok": True, "stub": True, "args": args}


def _overpass(query: str) -> list[dict]:
    import json, urllib.parse, urllib.request
    data = urllib.parse.urlencode({"data": query}).encode()
    req = urllib.request.Request(
        "https://overpass-api.de/api/interpreter", data=data,
        headers={"User-Agent": "VenuePlus-Agents/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        payload = json.loads(resp.read().decode())
    out = []
    for el in payload.get("elements", []):
        tags = el.get("tags", {})
        name = tags.get("name")
        if not name:
            continue
        out.append({
            "name": name,
            "tags": {k: tags[k] for k in tags
                     if k in ("amenity", "tourism", "shop", "craft", "cuisine")},
            "lat": el.get("lat") or (el.get("center") or {}).get("lat"),
            "lon": el.get("lon") or (el.get("center") or {}).get("lon"),
            "source": "osm:overpass",
        })
    return out


# ---- venue reads ---------------------------------------------------------- #
_SIM_OSM_VENUES = [
    {"name": "The Loft on 5th", "type": "event_space", "source": "osm:sim"},
    {"name": "Riverside Community Hall", "type": "community_centre", "source": "osm:sim"},
    {"name": "Gallery 23", "type": "gallery", "source": "osm:sim"},
]


def search_osm_venues(args: dict, ctx: "ToolContext") -> dict:
    city = args.get("city")
    if not ctx.live:
        return {"ok": True, "live": False, "city": city, "candidates": _SIM_OSM_VENUES}
    try:
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
        return {"ok": True, "live": True, "city": city, "candidates": _overpass(q)}
    except Exception as e:
        return {"ok": False, "live": True, "city": city, "candidates": [],
                "error": f"{type(e).__name__}: {e}"}


def list_existing_venues(args: dict, ctx: "ToolContext") -> dict:
    city = args.get("city")
    if ctx.db is None:
        return {"ok": True, "live": False, "city": city, "venues": []}
    try:
        from models import Venue
        rows = (ctx.db.query(Venue).filter(Venue.is_active.is_(True)))
        if city:
            rows = rows.filter(Venue.city.ilike(f"%{city}%"))
        rows = rows.limit(200).all()
        return {"ok": True, "live": True, "city": city, "count": len(rows),
                "venues": [{"id": v.id, "title": v.title,
                            "venue_type": v.venue_type, "city": v.city}
                           for v in rows]}
    except Exception as e:
        return {"ok": False, "city": city, "venues": [], "error": f"{type(e).__name__}: {e}"}


# ---- provider reads ------------------------------------------------------- #
_SIM_PROVIDER_CANDIDATES = [
    {"name": "Northside Catering Co.", "tags": {"shop": "caterer"}, "source": "osm:sim"},
    {"name": "Apex Event Photography", "tags": {"craft": "photographer"}, "source": "osm:sim"},
    {"name": "BrightStage AV & Lighting", "tags": {"shop": "trade"}, "source": "osm:sim"},
]
_TARGET_CATEGORIES = ("catering", "photography", "dj", "bartending",
                      "security", "cleaning", "decoration")


def search_providers(args: dict, ctx: "ToolContext") -> dict:
    city = args.get("city")
    if not ctx.live:
        return {"ok": True, "live": False, "city": city, "candidates": _SIM_PROVIDER_CANDIDATES}
    try:
        q = f'''
        [out:json][timeout:25];
        area["name"="{city}"]["boundary"="administrative"]->.a;
        (
          node["shop"="caterer"](area.a);
          node["craft"="photographer"](area.a);
          node["shop"="party"](area.a);
          node["amenity"="events_venue"]["catering"](area.a);
        );
        out center 60;
        '''
        return {"ok": True, "live": True, "city": city, "candidates": _overpass(q)}
    except Exception as e:
        return {"ok": False, "live": True, "city": city, "candidates": [],
                "error": f"{type(e).__name__}: {e}"}


def list_existing_providers(args: dict, ctx: "ToolContext") -> dict:
    city = args.get("city")
    category = args.get("category")
    if ctx.db is None:
        return {"ok": True, "live": False, "city": city, "providers": [],
                "coverage": {}, "missing_categories": list(_TARGET_CATEGORIES)}
    try:
        from models import ServiceProvider
        rows = (ctx.db.query(ServiceProvider)
                .filter(ServiceProvider.is_active.is_(True)).limit(500).all())
        def serves(p):
            if not city:
                return True
            areas = p.service_area_cities or []
            return any(city.lower() in str(a).lower() for a in areas)
        providers = []
        coverage: dict[str, int] = {}
        for p in rows:
            if not serves(p):
                continue
            cat = getattr(p.service_category, "value", str(p.service_category))
            if category and cat != category:
                continue
            coverage[cat] = coverage.get(cat, 0) + 1
            providers.append({"id": p.id, "service_name": p.service_name,
                              "category": cat, "rating": p.rating})
        missing = [c for c in _TARGET_CATEGORIES if coverage.get(c, 0) == 0]
        return {"ok": True, "live": True, "city": city, "count": len(providers),
                "providers": providers, "coverage": coverage, "missing_categories": missing}
    except Exception as e:
        return {"ok": False, "city": city, "providers": [], "coverage": {},
                "missing_categories": list(_TARGET_CATEGORIES),
                "error": f"{type(e).__name__}: {e}"}


# ---- venue writes / outbound ---------------------------------------------- #
def draft_venue_listing(args: dict, ctx: "ToolContext") -> dict:
    """Create an inactive draft Venue from a candidate (live) or log (dry-run)."""
    if ctx.dry_run:
        return _dry("draft_venue_listing", args,
                    "create an internal draft Venue listing for owner review")
    try:
        from services.venue_leads import create_venue_lead
        candidate = args.get("candidate") or args
        v = create_venue_lead(ctx.db, args.get("city"), candidate)
        if v is None:
            return {"ok": False, "skipped": "no candidate name or already drafted",
                    "args": args}
        return {"ok": True, "draft_venue_id": v.id, "active": v.is_active}
    except Exception as e:
        return {"ok": False, "error": f"{type(e).__name__}: {e}"}


def send_venue_outreach_email(args: dict, ctx: "ToolContext") -> dict:
    if ctx.dry_run:
        return _dry("send_venue_outreach_email", args,
                    "email a venue owner inviting them to list")
    to = args.get("email") or args.get("to")
    if not to:
        return {"ok": False, "skipped": "no owner email on candidate; can't send outreach"}
    try:
        from services import email as email_svc
        name = args.get("name") or "there"
        subject = "List your space on VenuePlus (free during beta)"
        html = (f"<p>Hi {name},</p><p>VenuePlus is a marketplace for event venues "
                "and on-site services. Listing is free during our beta and takes a "
                "few minutes.</p><p>Reply and we'll help you get set up.</p>")
        res = email_svc.send(to, subject, html)
        return {"ok": bool(res.get("ok")), "sent_to": to, "backend": res.get("backend")}
    except Exception as e:
        return {"ok": False, "error": f"{type(e).__name__}: {e}"}


def create_venue_prospect(args: dict, ctx: "ToolContext") -> dict:
    """Create a VenueLead sidecar (+ linked inactive draft Venue) from a
    candidate. Unifies scraped/discovered venues into the lead list the agent
    roots outreach from."""
    if ctx.dry_run:
        return _dry("create_venue_prospect", args,
                    "create a venue lead (sidecar + inactive draft) from a candidate")
    try:
        from services import prospects
        candidate = args.get("candidate") or args
        lead = prospects.create_venue_lead(ctx.db, args.get("city"), candidate)
        if lead is None:
            return {"ok": False, "skipped": "no name or already a lead", "args": args}
        return {"ok": True, "venue_lead_id": lead.id, "draft_venue_id": lead.draft_venue_id}
    except Exception as e:
        return {"ok": False, "error": f"{type(e).__name__}: {e}"}


def list_venue_leads(args: dict, ctx: "ToolContext") -> dict:
    city = args.get("city")
    if ctx.db is None:
        return {"ok": True, "live": False, "leads": []}
    try:
        from models import VenueLead
        q = ctx.db.query(VenueLead)
        if city:
            q = q.filter(VenueLead.city == city)
        leads = q.limit(500).all()
        return {"ok": True, "live": True, "city": city, "count": len(leads),
                "leads": [{"id": l.id, "name": l.name, "status": l.status.value,
                           "has_email": bool(l.email), "has_phone": bool(l.phone)}
                          for l in leads]}
    except Exception as e:
        return {"ok": False, "leads": [], "error": f"{type(e).__name__}: {e}"}


def send_venue_lead_outreach(args: dict, ctx: "ToolContext") -> dict:
    """Email a venue-lead owner/agent, personalised with its pitch angle."""
    if ctx.dry_run:
        return _dry("send_venue_lead_outreach", args,
                    "email a venue prospect inviting them to list (uses its pitch angle)")
    try:
        from models import VenueLead, VenueLeadStatus
        from services import email as email_svc
        lead = ctx.db.query(VenueLead).filter(VenueLead.id == args.get("lead_id")).first()
        if not lead:
            return {"ok": False, "skipped": "venue lead not found"}
        if not lead.email:
            return {"ok": False, "skipped": "no email on venue lead"}
        subject = f"Earn on {lead.name} while it’s available — VenuePlus (free beta)"
        pitch = f"<p>{lead.pitch_angle}</p>" if lead.pitch_angle else ""
        html = (f"<p>Hi {lead.name} team,</p>"
                "<p>VenuePlus books short-term events into spaces like yours — at no cost "
                "and no exclusivity. We handle listing, booking, payment and the guest; "
                "you just say yes. We’re in free beta (0% platform fee), so hosting income "
                f"flows to you.</p>{pitch}"
                "<p>Worth a 10-minute call to set up a listing?</p>")
        res = email_svc.send(lead.email, subject, html)
        if res.get("ok"):
            lead.outreach_sent = True
            lead.status = VenueLeadStatus.CONTACTED
            ctx.db.flush()
        return {"ok": bool(res.get("ok")), "sent_to": lead.email, "backend": res.get("backend")}
    except Exception as e:
        return {"ok": False, "error": f"{type(e).__name__}: {e}"}


# ---- provider writes / outbound ------------------------------------------- #
def create_provider_invite(args: dict, ctx: "ToolContext") -> dict:
    """Persist a recruited provider as a provisional lead (inactive until the
    business onboards). Dry-run logs; live writes via services.provider_leads."""
    if ctx.dry_run:
        return _dry("create_provider_invite", args,
                    "create a provisional provider lead (inactive until onboarded)")
    try:
        from services.provider_leads import create_lead
        candidate = args.get("candidate") or args
        prov = create_lead(ctx.db, args.get("city"), candidate)
        if prov is None:
            return {"ok": False, "skipped": "unclassifiable or already a lead", "args": args}
        return {"ok": True, "lead_provider_id": prov.id,
                "category": prov.service_category.value, "active": prov.is_active}
    except Exception as e:
        return {"ok": False, "error": f"{type(e).__name__}: {e}"}


def send_provider_sms(args: dict, ctx: "ToolContext") -> dict:
    if ctx.dry_run:
        return _dry("send_provider_sms", args, "text a provider to finish onboarding")
    to = args.get("phone") or args.get("to")
    if not to:
        return {"ok": False, "skipped": "no phone on candidate; can't text"}
    try:
        from services import sms
        body = args.get("message") or ("VenuePlus: finish your free listing so event "
               "hosts can book you. Reply STOP to opt out.")
        res = sms.send(to, body)
        return {"ok": bool(res.get("ok")), "sent_to": to, "backend": res.get("backend")}
    except Exception as e:
        return {"ok": False, "error": f"{type(e).__name__}: {e}"}


# ---- marketing reads + writes --------------------------------------------- #
def read_market_metrics(args: dict, ctx: "ToolContext") -> dict:
    city = args.get("city")
    if ctx.db is None:
        return {"ok": True, "live": False, "city": city, "venues": 0,
                "providers": 0, "recent_bookings": 0, "has_supply": False}
    try:
        from models import Venue, ServiceProvider, Booking
        vq = ctx.db.query(Venue).filter(Venue.is_active.is_(True))
        if city:
            vq = vq.filter(Venue.city.ilike(f"%{city}%"))
        venues = vq.count()
        providers = 0
        for p in (ctx.db.query(ServiceProvider)
                  .filter(ServiceProvider.is_active.is_(True)).limit(1000).all()):
            areas = p.service_area_cities or []
            if not city or any(str(city).lower() in str(a).lower() for a in areas):
                providers += 1
        if city:
            bookings = (ctx.db.query(Booking).join(Venue, Booking.venue_id == Venue.id)
                        .filter(Venue.city.ilike(f"%{city}%")).count())
        else:
            bookings = ctx.db.query(Booking).count()
        return {"ok": True, "live": True, "city": city, "venues": venues,
                "providers": providers, "recent_bookings": bookings,
                "has_supply": venues > 0 and providers > 0}
    except Exception as e:
        return {"ok": False, "city": city, "venues": 0, "providers": 0,
                "recent_bookings": 0, "has_supply": False,
                "error": f"{type(e).__name__}: {e}"}


def generate_seo_content(args: dict, ctx: "ToolContext") -> dict:
    if ctx.dry_run:
        return _dry("generate_seo_content", args,
                    "draft SEO landing copy for the market (internal)")
    city = args.get("city") or "your city"
    meta_title = f"Event Venues & Services in {city} | VenuePlus"
    body = (f"Planning an event in {city}? VenuePlus helps you book the perfect "
            f"venue and the services to match — catering, photography, DJs, "
            f"bartending, security, cleaning and more — in one place. Compare "
            f"{city} spaces by capacity, price and availability, then add vetted "
            f"local providers at checkout. Free to browse and book during our beta.")
    return {"ok": True, "generated": True, "city": city,
            "meta_title": meta_title, "content": body, "published": False,
            "note": "copy generated; connect a CMS/landing target to publish"}


def publish_social_post(args: dict, ctx: "ToolContext") -> dict:
    if ctx.dry_run:
        return _dry("publish_social_post", args, "publish a launch announcement to social")
    return {"ok": False, "not_configured": "no social publishing integration connected "
            "(add an X/LinkedIn/Buffer token to enable)"}


def launch_paid_ad_campaign(args: dict, ctx: "ToolContext") -> dict:
    if ctx.dry_run:
        return _dry("launch_paid_ad_campaign", args,
                    "start a paid acquisition campaign within budget")
    return {"ok": False, "not_configured": "no ad-platform integration connected "
            "(Google/Meta Ads API + budget approval required)"}


def issue_referral_payout(args: dict, ctx: "ToolContext") -> dict:
    # Hard-gated: only reaches here after explicit human approval. Still dry-run
    # (real payouts go through services/payments + Stripe, gated by FREE_MODE).
    return _dry("issue_referral_payout", args,
                "pay a referral incentive (hard-gated; human-approved)")


def sign_partnership_agreement(args: dict, ctx: "ToolContext") -> dict:
    # Hard-gated: only reaches here after explicit human approval. Still dry-run.
    return _dry("sign_partnership_agreement", args,
                "sign a co-marketing partnership (hard-gated; human-approved)")


# ---- creator / influencer reads + writes ---------------------------------- #
def list_creator_leads(args: dict, ctx: "ToolContext") -> dict:
    city = args.get("city")
    if ctx.db is None:
        return {"ok": True, "live": False, "city": city, "leads": []}
    try:
        from services import creator_leads as cl
        leads = cl.list_leads(ctx.db, city)
        return {"ok": True, "live": True, "city": city, "count": len(leads),
                "leads": [{"id": ld.id, "name": ld.name, "handle": ld.handle,
                           "status": ld.status.value, "has_email": bool(ld.email),
                           "followers": ld.followers} for ld in leads]}
    except Exception as e:
        return {"ok": False, "city": city, "leads": [], "error": f"{type(e).__name__}: {e}"}


def _lead(ctx, lead_id):
    from models_creator import CreatorLead
    return ctx.db.query(CreatorLead).filter(CreatorLead.id == lead_id).first()


def draft_creator_outreach(args: dict, ctx: "ToolContext") -> dict:
    """Draft personalized recruitment copy and store it on the lead."""
    if ctx.dry_run:
        return _dry("draft_creator_outreach", args,
                    "draft personalized outreach copy for a creator lead")
    try:
        from services import creator_leads as cl
        lead = _lead(ctx, args.get("lead_id"))
        if not lead:
            return {"ok": False, "skipped": "creator lead not found"}
        copy = cl.draft_outreach_copy(lead, lead.city or args.get("city") or "")
        lead.notes = copy["body"]
        ctx.db.flush()
        return {"ok": True, "lead_id": lead.id, "subject": copy["subject"]}
    except Exception as e:
        return {"ok": False, "error": f"{type(e).__name__}: {e}"}


def send_creator_outreach_email(args: dict, ctx: "ToolContext") -> dict:
    if ctx.dry_run:
        return _dry("send_creator_outreach_email", args,
                    "email a creator lead inviting them to host a ticketed event")
    try:
        from services import creator_leads as cl, email as email_svc
        from models_creator import CreatorLeadStatus
        lead = _lead(ctx, args.get("lead_id"))
        if not lead:
            return {"ok": False, "skipped": "creator lead not found"}
        if not lead.email:
            return {"ok": False, "skipped": "no email on creator lead"}
        copy = cl.draft_outreach_copy(lead, lead.city or "")
        html = "<p>" + copy["body"].replace("\n\n", "</p><p>").replace("\n", "<br>") + "</p>"
        res = email_svc.send(lead.email, copy["subject"], html)
        if res.get("ok"):
            lead.outreach_sent = True
            lead.status = CreatorLeadStatus.CONTACTED
            ctx.db.flush()
        return {"ok": bool(res.get("ok")), "sent_to": lead.email, "backend": res.get("backend")}
    except Exception as e:
        return {"ok": False, "error": f"{type(e).__name__}: {e}"}


def draft_creator_event(args: dict, ctx: "ToolContext") -> dict:
    """Auto-prepare a DRAFT Creator Event (with default tiers) for a committed
    lead, under a placeholder creator account they can later claim."""
    if ctx.dry_run:
        return _dry("draft_creator_event", args,
                    "draft a ready-to-publish Creator Event for a committed lead")
    try:
        from services import creator_leads as cl
        lead = _lead(ctx, args.get("lead_id"))
        if not lead:
            return {"ok": False, "skipped": "creator lead not found"}
        ev = cl.draft_event_for_lead(ctx.db, lead)
        if ev is None:
            return {"ok": False, "skipped": "could not draft event"}
        return {"ok": True, "lead_id": lead.id, "draft_event_id": ev.id,
                "slug": ev.slug, "active": False}
    except Exception as e:
        return {"ok": False, "error": f"{type(e).__name__}: {e}"}


@dataclass
class Tool:
    name: str
    risk: RiskLevel
    description: str
    handler: Callable[[dict, "ToolContext"], dict] = field(default=_noop)

    def run(self, args: dict, ctx: "ToolContext | None" = None) -> dict:
        return self.handler(args or {}, ctx or ToolContext())


# All three agents have real/dry-run handlers. money_movement + legal stay
# dry-run even post-approval and are guardrail hard-gated. Social/ads return a
# clean "not configured" until an integration is connected.
REGISTRY: dict[str, Tool] = {t.name: t for t in [
    # venues (real agent)
    Tool("search_osm_venues", RiskLevel.READ,
         "Scout candidate venues from public sources", search_osm_venues),
    Tool("list_existing_venues", RiskLevel.READ,
         "List venues we already carry in a market (dedupe)", list_existing_venues),
    Tool("draft_venue_listing", RiskLevel.INTERNAL_WRITE,
         "Create an inactive draft venue listing from a candidate", draft_venue_listing),
    Tool("create_venue_prospect", RiskLevel.INTERNAL_WRITE,
         "Create a venue lead (sidecar + draft) from a candidate", create_venue_prospect),
    Tool("list_venue_leads", RiskLevel.READ,
         "List venue leads + pipeline status", list_venue_leads),
    Tool("send_venue_lead_outreach", RiskLevel.OUTBOUND,
         "Email a venue prospect using its pitch angle", send_venue_lead_outreach),
    Tool("send_venue_outreach_email", RiskLevel.OUTBOUND,
         "Email a venue owner to invite a listing", send_venue_outreach_email),
    # providers (real agent)
    Tool("search_providers", RiskLevel.READ,
         "Find service providers serving a market from public sources", search_providers),
    Tool("list_existing_providers", RiskLevel.READ,
         "List providers we already have + coverage gaps by category", list_existing_providers),
    Tool("create_provider_invite", RiskLevel.INTERNAL_WRITE,
         "Create a provisional provider lead from a candidate", create_provider_invite),
    Tool("send_provider_sms", RiskLevel.OUTBOUND,
         "Text a provider to finish onboarding", send_provider_sms),
    # marketing (real agent)
    Tool("read_market_metrics", RiskLevel.READ,
         "Read a market's supply/demand before spending", read_market_metrics),
    Tool("generate_seo_content", RiskLevel.INTERNAL_WRITE,
         "Draft SEO landing copy", generate_seo_content),
    Tool("publish_social_post", RiskLevel.OUTBOUND,
         "Publish an announcement to social", publish_social_post),
    Tool("launch_paid_ad_campaign", RiskLevel.FINANCIAL,
         "Start a paid acquisition campaign", launch_paid_ad_campaign),
    Tool("issue_referral_payout", RiskLevel.MONEY_MOVEMENT,
         "Pay a referral incentive (hard-gated)", issue_referral_payout),
    Tool("sign_partnership_agreement", RiskLevel.LEGAL,
         "Sign a partnership agreement (hard-gated)", sign_partnership_agreement),
    # creator / influencer (real agent)
    Tool("list_creator_leads", RiskLevel.READ,
         "List creator/influencer leads + pipeline status", list_creator_leads),
    Tool("draft_creator_outreach", RiskLevel.INTERNAL_WRITE,
         "Draft personalized outreach copy for a creator lead", draft_creator_outreach),
    Tool("send_creator_outreach_email", RiskLevel.OUTBOUND,
         "Email a creator lead to recruit them into a ticketed event",
         send_creator_outreach_email),
    Tool("draft_creator_event", RiskLevel.INTERNAL_WRITE,
         "Draft a Creator Event for a committed lead", draft_creator_event),
]}


def get(name: str) -> Tool | None:
    return REGISTRY.get(name)


def risk_for(name: str) -> RiskLevel | None:
    tool = REGISTRY.get(name)
    return tool.risk if tool else None


def execute(name: str, args: dict, ctx: "ToolContext | None" = None) -> dict:
    tool = REGISTRY.get(name)
    if tool is None:
        return {"ok": False, "error": f"unknown tool: {name}"}
    return tool.run(args, ctx or ToolContext())
