"""Prospect ingestion — one write path from any source (hand-gathered
spreadsheets, OSM, Google Places, or a site adapter) into the three lead lists
the agent fleet roots outreach from:

  * venues    -> VenueLead sidecar (contact + pitch) + an inactive draft Venue
  * providers -> inactive ServiceProvider lead (via services.provider_leads)
  * creators  -> CreatorLead (via services.creator_leads)

Every write is idempotent and creates INACTIVE leads only — nothing here becomes
live/bookable supply until a real owner/provider/creator claims it.
"""
from __future__ import annotations

from models import Venue, VenueLead, VenueLeadStatus, ServiceCategory
from services import venue_leads as vl
from services import provider_leads as pl
from services import creator_leads as cl


def _norm(s) -> str | None:
    if s is None:
        return None
    s = str(s).strip()
    return s or None


# --------------------------------------------------------------------------- #
# Venues                                                                      #
# --------------------------------------------------------------------------- #
def create_venue_lead(db, city: str, row: dict) -> VenueLead | None:
    """Create ONE venue prospect: a VenueLead (contact/pitch) plus a linked
    inactive draft Venue. Idempotent by (source, source_id) or (name+city)."""
    name = _norm(row.get("name"))
    if not name:
        return None
    city = _norm(city) or _norm(row.get("city")) or ""
    source = _norm(row.get("source")) or "import"
    source_id = _norm(row.get("source_id")) or f"{name}|{city}".lower()

    dup = db.query(VenueLead).filter(
        VenueLead.source == source, VenueLead.source_id == source_id).first()
    if dup is None:
        dup = db.query(VenueLead).filter(
            VenueLead.name == name, VenueLead.city == city).first()
    if dup:
        return None

    # Draft Venue so it counts as lead supply (carries type/address/geo).
    draft = vl.create_venue_lead(db, city, {
        "name": name, "type": _norm(row.get("venue_type")),
        "address": _norm(row.get("address")) or _norm(row.get("area")),
        "source": source,
        "lat": row.get("lat"), "lon": row.get("lon"),
    })

    lead = VenueLead(
        name=name, venue_type=_norm(row.get("venue_type")), city=city,
        area=_norm(row.get("area")), address=_norm(row.get("address")),
        website=_norm(row.get("website")), email=_norm(row.get("email")),
        phone=_norm(row.get("phone")),
        indicative_pricing=_norm(row.get("indicative_pricing")),
        on_competitor=_norm(row.get("on_competitor")),
        pitch_angle=_norm(row.get("pitch_angle")), notes=_norm(row.get("notes")),
        source=source, source_id=source_id, status=VenueLeadStatus.NEW,
        draft_venue_id=(draft.id if draft else None),
    )
    db.add(lead)
    db.flush()
    return lead


def import_venues(db, city: str, rows: list[dict]) -> dict:
    stats = {"considered": 0, "created": 0, "skipped": 0}
    for row in rows or []:
        stats["considered"] += 1
        if create_venue_lead(db, city, row) is not None:
            stats["created"] += 1
        else:
            stats["skipped"] += 1
    return stats


# --------------------------------------------------------------------------- #
# Providers  (reuse the existing inactive-lead writer)                        #
# --------------------------------------------------------------------------- #
def import_providers(db, city: str, rows: list[dict]) -> dict:
    """Rows: {name, category, phone?, website?, address?}. Category must be a
    valid ServiceCategory value (else the row is skipped as unclassifiable)."""
    stats = {"considered": 0, "created": 0, "skipped": 0}
    for row in rows or []:
        stats["considered"] += 1
        name = _norm(row.get("name"))
        cat = _norm(row.get("category"))
        if cat:
            cat = cat.lower()
        candidate = {
            "name": name, "category": cat, "source": _norm(row.get("source")) or "import",
            "tags": {k: v for k, v in {
                "phone": _norm(row.get("phone")),
                "website": _norm(row.get("website")),
                "addr": _norm(row.get("address")),
            }.items() if v},
        }
        if name and pl.create_lead(db, city, candidate) is not None:
            stats["created"] += 1
        else:
            stats["skipped"] += 1
    return stats


# --------------------------------------------------------------------------- #
# Creators                                                                    #
# --------------------------------------------------------------------------- #
def import_creators(db, city: str, rows: list[dict]) -> dict:
    return cl.import_leads(db, city, rows or [])


# --------------------------------------------------------------------------- #
# One call for a mixed payload                                                #
# --------------------------------------------------------------------------- #
def import_all(db, city: str, venues=None, providers=None, creators=None) -> dict:
    return {
        "venues": import_venues(db, city, venues or []),
        "providers": import_providers(db, city, providers or []),
        "creators": import_creators(db, city, creators or []),
    }
