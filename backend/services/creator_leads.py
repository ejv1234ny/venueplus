"""Creator-lead pipeline — the live path for the Creator agent's tools.

Discovery of new creators on Instagram/TikTok can't be automated without paid
social APIs, so the pipeline is *managed*: ops import a list of prospects, and
the Creator agent then drafts outreach and — once a lead commits — drafts a
ready-to-publish Creator Event under a placeholder creator account the real
person can later claim (mirrors venue_leads / provider_leads).

Everything is idempotent and never touches non-lead rows.
"""
from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone

from auth import get_password_hash
from models import User, UserRole
from models_creator import (CreatorLead, CreatorLeadStatus, CreatorEvent,
                            CreatorEventStatus, EventVisibility, FundingModel,
                            TicketTier)
from services import creator_events as ce

LEAD_DOMAIN = "venueplus.lead"


def _slug(s: str) -> str:
    return "".join(c.lower() if c.isalnum() else "-" for c in (s or "")).strip("-")


def _key(candidate: dict) -> str:
    """Dedup key: prefer handle, else name."""
    return (candidate.get("handle") or candidate.get("name") or "").strip().lower()


# --------------------------------------------------------------------------- #
# Import / create                                                             #
# --------------------------------------------------------------------------- #
def create_creator_lead(db, city: str, candidate: dict) -> CreatorLead | None:
    """Create ONE creator lead from ``{name, handle, platform, niche,
    followers, email, phone}``. Idempotent by (handle|name)+city."""
    name = (candidate.get("name") or candidate.get("handle") or "").strip()
    if not name:
        return None
    key = _key(candidate)
    existing = [ld for ld in db.query(CreatorLead)
                .filter(CreatorLead.city == city).all()
                if _key({"handle": ld.handle, "name": ld.name}) == key]
    if existing:
        return None

    lead = CreatorLead(
        name=name,
        handle=(candidate.get("handle") or "").strip() or None,
        platform=(candidate.get("platform") or "").strip() or None,
        niche=(candidate.get("niche") or "").strip() or None,
        followers=int(candidate.get("followers") or 0),
        email=(candidate.get("email") or "").strip() or None,
        phone=(candidate.get("phone") or "").strip() or None,
        city=city,
        status=CreatorLeadStatus.NEW,
        source=candidate.get("source", "import"),
    )
    db.add(lead)
    db.flush()
    return lead


def import_leads(db, city: str, rows: list[dict]) -> dict:
    """Bulk-import creator prospects for a city. Idempotent."""
    stats = {"considered": 0, "created": 0, "skipped": 0}
    for row in rows or []:
        stats["considered"] += 1
        if create_creator_lead(db, city, row) is not None:
            stats["created"] += 1
        else:
            stats["skipped"] += 1
    return stats


def list_leads(db, city: str | None = None,
               status: CreatorLeadStatus | None = None) -> list[CreatorLead]:
    q = db.query(CreatorLead)
    if city:
        q = q.filter(CreatorLead.city == city)
    if status:
        q = q.filter(CreatorLead.status == status)
    return q.order_by(CreatorLead.followers.desc()).all()


# --------------------------------------------------------------------------- #
# Outreach copy                                                               #
# --------------------------------------------------------------------------- #
def draft_outreach_copy(lead: CreatorLead, city: str) -> dict:
    """Personalized recruitment copy for a creator lead (no send)."""
    who = f"@{lead.handle}" if lead.handle else lead.name
    niche = lead.niche or "your community"
    subject = f"Host a {niche} event in {city} with VenuePlus (free beta)"
    body = (
        f"Hi {who},\n\n"
        f"You've built a real {niche} audience in {city} — VenuePlus lets you "
        "turn that into a live, ticketed event without fronting cost or handling "
        "logistics. Pick a venue, we line up the services (photographer, catering, "
        "DJ), you sell tickets and keep the upside. We're in free beta, so there's "
        "no platform fee right now, and we'll build your event page for you.\n\n"
        "Want to host your first gathering this month? Just reply and we'll set it up.\n\n"
        "— The VenuePlus team"
    )
    return {"subject": subject, "body": body}


# --------------------------------------------------------------------------- #
# Draft a Creator Event for a committed lead                                  #
# --------------------------------------------------------------------------- #
def _placeholder_creator(db, lead: CreatorLead) -> User:
    """Get/create the inactive placeholder creator account for a lead, so a
    DRAFT CreatorEvent can be attached before the real person signs up."""
    email = f"lead-creator-{_slug(lead.handle or lead.name)}.{_slug(lead.city or '')}@{LEAD_DOMAIN}"
    user = db.query(User).filter(User.email == email).first()
    if user:
        return user
    user = User(email=email,
                hashed_password=get_password_hash(os.urandom(8).hex()),
                first_name="Creator", last_name=lead.name[:60],
                role=UserRole.CREATOR, is_active=False, is_verified=False,
                bio=(f"{lead.niche or 'Creator'} · {lead.followers or 0} followers"
                     f"{' · @' + lead.handle if lead.handle else ''}"))
    db.add(user)
    db.flush()
    return user


def draft_event_for_lead(db, lead: CreatorLead) -> CreatorEvent | None:
    """Create a DRAFT Creator Event (with two default tiers) for a committed
    lead, under a placeholder creator account. Idempotent per lead."""
    if lead.event_drafted and lead.draft_event_id:
        return db.query(CreatorEvent).filter(
            CreatorEvent.id == lead.draft_event_id).first()

    creator = _placeholder_creator(db, lead)
    start = datetime.now(timezone.utc) + timedelta(days=21)
    end = start + timedelta(hours=3)
    niche = lead.niche or "community"
    title = f"{lead.name}'s {niche.title()} Meetup ({lead.city})"

    ev = CreatorEvent(
        creator_id=creator.id, booking_id=None,
        slug=ce.slugify(title), title=title,
        description=(f"Draft event auto-prepared for {lead.name}. A VenuePlus "
                     "teammate will attach a venue + services and the creator "
                     "publishes once they're ready."),
        start_datetime=start, end_datetime=end, capacity=40,
        funding_model=FundingModel.REVENUE_FUNDED,
        status=CreatorEventStatus.DRAFT,
        visibility=EventVisibility.PUBLIC,
    )
    db.add(ev)
    db.flush()
    for name, price_cents, qty in (("General", 1500, 35), ("VIP", 3000, 5)):
        db.add(TicketTier(creator_event_id=ev.id, name=name,
                          price_cents=price_cents, quantity=qty, max_per_buyer=4))
    lead.event_drafted = True
    lead.draft_event_id = ev.id
    db.flush()
    return ev


# --------------------------------------------------------------------------- #
# Summary                                                                     #
# --------------------------------------------------------------------------- #
def summarize(db, city: str) -> dict:
    leads = db.query(CreatorLead).filter(CreatorLead.city == city).all()
    by_status: dict[str, int] = {}
    for ld in leads:
        by_status[ld.status.value] = by_status.get(ld.status.value, 0) + 1
    return {"total": len(leads), "by_status": by_status,
            "events_drafted": sum(1 for ld in leads if ld.event_drafted)}
