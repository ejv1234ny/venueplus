"""Venue draft-listing creation (the live path for the Venues agent's
`draft_venue_listing` tool).

A "draft" is an inactive Venue created from a public candidate (OSM/Google),
owned by a placeholder ``@venueplus.lead`` account. It is NOT bookable and does
not show in search until a real owner claims it and completes the listing
(capacity, price, address). Mirrors services/provider_leads for symmetry.
"""
from __future__ import annotations

import os

from models import User, UserRole, Venue
from auth import get_password_hash

LEAD_DOMAIN = "venueplus.lead"


def slug(s: str) -> str:
    return "".join(c.lower() if c.isalnum() else "-" for c in (s or "")).strip("-")


def create_venue_lead(db, city: str | None, candidate: dict) -> Venue | None:
    """Create ONE inactive draft Venue from a candidate ``{name, type, lat,
    lon, address, source, ...}``. Idempotent by title+city. Returns the Venue
    or None if there's no name or it already exists."""
    name = (candidate.get("name") or "").strip()
    if not name:
        return None
    city = city or candidate.get("city") or ""
    existing = (db.query(Venue)
                .filter(Venue.title == name, Venue.city == city).first())
    if existing:
        return None

    email = f"lead-venue-{slug(name)}.{slug(city)}@{LEAD_DOMAIN}"
    owner = db.query(User).filter(User.email == email).first()
    if not owner:
        owner = User(email=email,
                     hashed_password=get_password_hash(os.urandom(8).hex()),
                     first_name="Lead", last_name=name[:60],
                     role=UserRole.VENUE_OWNER, is_active=False,
                     is_verified=False)
        db.add(owner); db.flush()

    tags = candidate.get("tags", {}) or {}
    venue = Venue(
        owner_id=owner.id,
        title=name,
        description=(f"Draft listing generated from public data "
                    f"({candidate.get('source', 'osm')}); pending owner review. "
                    "Claim it to set capacity, pricing and availability."),
        venue_type=(candidate.get("type") or tags.get("amenity") or "venue"),
        address=candidate.get("address") or "(address pending)",
        city=city, state=candidate.get("state", "") or "",
        zip_code=candidate.get("zip_code", "") or "00000",
        latitude=candidate.get("lat"), longitude=candidate.get("lon"),
        capacity=0, price_per_hour=0.0, minimum_hours=1,
        images=[], amenities=[],
        rules=None, is_active=False,   # NOT bookable until claimed + completed
    )
    db.add(venue); db.flush()
    return venue
