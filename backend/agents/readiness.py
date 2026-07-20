"""Market readiness — is a city seeded enough to open to real humans?

The COO's hand-off gate. Agents create supply as INACTIVE leads (draft venues,
provider leads) that only become bookable when a real owner/provider claims
them, so "ready for the public" is measured on ACTIVE, bookable supply — not on
lead volume. This reports the gap so ops knows when to stop seeding and open a
market (and what still blocks it).
"""
from __future__ import annotations

from models import Venue, ServiceProvider

# The categories a market needs live so a bundled booking can always be fully
# serviced. Security + cleaning gate mandatory-service venues, so they matter most.
REQUIRED_CATEGORIES = ["catering", "photography", "dj", "bartending",
                       "security", "cleaning", "decoration"]
MIN_ACTIVE_VENUES = 5


def _serves(provider, city: str) -> bool:
    areas = provider.service_area_cities or []
    return not city or any(str(city).lower() in str(a).lower() for a in areas)


def _active_provider_coverage(db, city: str) -> dict[str, int]:
    covered: dict[str, int] = {}
    for p in (db.query(ServiceProvider)
              .filter(ServiceProvider.is_active.is_(True)).all()):
        if not _serves(p, city):
            continue
        cat = getattr(p.service_category, "value", str(p.service_category))
        covered[cat] = covered.get(cat, 0) + 1
    return covered


def market_readiness(db, city: str,
                     min_active_venues: int = MIN_ACTIVE_VENUES) -> dict:
    """Assess whether ``city`` is ready to open to the public, with the gaps."""
    active_venues = (db.query(Venue)
                     .filter(Venue.is_active.is_(True),
                             Venue.city.ilike(f"%{city}%")).count())
    lead_venues = (db.query(Venue)
                   .filter(Venue.is_active.is_(False),
                           Venue.city.ilike(f"%{city}%")).count())

    coverage = _active_provider_coverage(db, city)
    missing = [c for c in REQUIRED_CATEGORIES if coverage.get(c, 0) == 0]

    lead_providers = sum(1 for p in db.query(ServiceProvider)
                         .filter(ServiceProvider.is_active.is_(False)).all()
                         if _serves(p, city))

    try:
        from models_creator import CreatorLead
        creator_leads = db.query(CreatorLead).filter(
            CreatorLead.city == city).count()
    except Exception:
        creator_leads = 0

    venues_ok = active_venues >= min_active_venues
    coverage_ok = not missing
    ready = venues_ok and coverage_ok

    gaps: list[str] = []
    if not venues_ok:
        gaps.append(f"need {min_active_venues - active_venues} more active venue(s) "
                    f"(have {active_venues}, {lead_venues} lead(s) awaiting claim)")
    if missing:
        gaps.append(f"no active providers in: {', '.join(missing)} "
                    f"({lead_providers} provider lead(s) awaiting onboarding)")

    return {
        "city": city,
        "ready_for_public": ready,
        "active_venues": active_venues,
        "lead_venues": lead_venues,
        "provider_coverage": coverage,
        "missing_categories": missing,
        "lead_providers": lead_providers,
        "creator_leads": creator_leads,
        "gaps": gaps,
        "recommendation": (
            "Ready — open this market to the public."
            if ready else
            "Keep seeding and convert leads to active (claimed) supply before "
            "opening: " + "; ".join(gaps)),
    }
