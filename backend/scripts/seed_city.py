"""Seed ONE city with supply so a market can be validated end-to-end.

This is the hand-seed step from the go-live/pilot runbook: stand up a single
city with enough venues and provider coverage that a real host (or the Venues/
Providers agents) has something to work with, and a real booking -- or a
creator event -- can actually be fulfilled.

What it creates (all idempotent):
  * venue-owner users + ~10 venues spread across venue types and price points,
  * service-provider users covering every high-demand category (catering,
    photography, DJ, bartending, security, cleaning, decoration) plus a couple
    of extras, each serving the seeded city.

Safety / idempotency:
  * Every seeded user's email is on the ``@venueplus.seed`` domain, which is
    the marker the script keys on. It will NEVER touch a row that isn't on that
    domain, so it can't clobber real users/venues/providers.
  * Re-running is a no-op for anything already present (matched by email).
  * ``--purge`` removes ONLY the seeded rows for the given city (cascades from
    the seeded users), so you can reset a market cleanly.
  * ``--dry-run`` prints the plan and rolls back without writing.

Usage (from the backend/ directory)::

    python -m scripts.seed_city --city "Austin" --state TX
    python -m scripts.seed_city --city "Austin" --state TX --venues 12
    python -m scripts.seed_city --city "Austin" --state TX --dry-run
    python -m scripts.seed_city --city "Austin" --state TX --purge

The target DB is whatever ``DATABASE_URL`` points at (SQLite locally, Railway
Postgres in prod) -- same config the app uses.
"""
from __future__ import annotations

import argparse
import os
import sys

# Make the backend package importable whether run as a module or a file.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, engine, Base  # noqa: E402
import models  # noqa: E402  (ensure all tables are registered)
from models import (User, UserRole, Venue, ServiceProvider,  # noqa: E402
                    ServiceCategory)
from auth import get_password_hash  # noqa: E402

SEED_DOMAIN = "venueplus.seed"
DEFAULT_PASSWORD = "PilotSeed!123"


# --------------------------------------------------------------------------- #
# Seed data templates                                                         #
# --------------------------------------------------------------------------- #
# (venue_type, name suffix, capacity, price_per_hour, min_hours)
VENUE_TEMPLATES = [
    ("rooftop", "Skyline Rooftop", 120, 350.0, 3),
    ("loft", "The Industrial Loft", 80, 220.0, 2),
    ("warehouse", "Eastside Warehouse", 300, 500.0, 4),
    ("garden", "Garden Courtyard", 150, 280.0, 3),
    ("studio", "Maker Studio", 40, 120.0, 2),
    ("gallery", "Contemporary Gallery", 90, 260.0, 2),
    ("ballroom", "Grand Ballroom", 250, 600.0, 4),
    ("barn", "Restored Barn", 180, 300.0, 4),
    ("lounge", "Speakeasy Lounge", 60, 200.0, 2),
    ("hall", "Community Hall", 200, 180.0, 3),
    ("penthouse", "Downtown Penthouse", 70, 400.0, 3),
    ("patio", "Riverside Patio", 110, 240.0, 2),
]

AMENITIES = ["wifi", "parking", "restrooms", "kitchen", "av_system",
             "tables_chairs", "wheelchair_accessible", "outdoor_space"]

# (ServiceCategory, service_name, hourly_rate, description)
PROVIDER_TEMPLATES = [
    (ServiceCategory.CATERING, "Hearth & Table Catering", 85.0,
     "Full-service event catering, plated or buffet."),
    (ServiceCategory.PHOTOGRAPHY, "Frame & Light Photography", 150.0,
     "Event and portrait photography with fast turnaround."),
    (ServiceCategory.DJ, "Pulse DJ Collective", 120.0,
     "DJ + sound for parties, weddings and corporate events."),
    (ServiceCategory.BARTENDING, "Copper Shaker Bartending", 70.0,
     "Licensed, insured mobile bartenders."),
    (ServiceCategory.SECURITY, "Sentinel Event Security", 60.0,
     "Licensed event security and door staff."),
    (ServiceCategory.CLEANING, "FreshStart Event Cleaning", 55.0,
     "Pre- and post-event cleaning crews."),
    (ServiceCategory.DECORATION, "Bloom & Bolt Decor", 90.0,
     "Floral, balloon and themed event styling."),
    (ServiceCategory.EQUIPMENT, "StageWorks AV & Rentals", 110.0,
     "Lighting, sound and staging rental + setup."),
    (ServiceCategory.STAFF, "Onpoint Event Staffing", 50.0,
     "Servers, ushers and general event staff."),
]


def _slug(city: str) -> str:
    return "".join(c.lower() if c.isalnum() else "-" for c in city).strip("-")


# --------------------------------------------------------------------------- #
# Helpers                                                                      #
# --------------------------------------------------------------------------- #
def _get_or_create_user(db, email, first, last, role, password_hash):
    user = db.query(User).filter(User.email == email).first()
    if user:
        return user, False
    user = User(email=email, hashed_password=password_hash, first_name=first,
                last_name=last, role=role, is_active=True, is_verified=True)
    db.add(user)
    db.flush()
    return user, True


def seed(db, city: str, state: str, n_venues: int, password: str) -> dict:
    slug = _slug(city)
    pw = get_password_hash(password)
    created = {"owners": 0, "venues": 0, "provider_users": 0, "providers": 0}

    # --- venues (one owner per venue, deterministic emails) ---------------- #
    templates = (VENUE_TEMPLATES * ((n_venues // len(VENUE_TEMPLATES)) + 1))[:n_venues]
    for i, (vtype, name, cap, price, min_hours) in enumerate(templates, start=1):
        email = f"owner{i}.{slug}@{SEED_DOMAIN}"
        owner, is_new = _get_or_create_user(
            db, email, "Pilot", f"Owner {i}", UserRole.VENUE_OWNER, pw)
        created["owners"] += int(is_new)

        # one venue per seeded owner; skip if this owner already has one
        if owner.owned_venues:
            continue
        venue = Venue(
            owner_id=owner.id,
            title=f"{name} ({city})",
            description=(f"A {vtype} event space in {city}. Seeded pilot "
                        f"listing for marketplace validation."),
            venue_type=vtype,
            address=f"{100 + i} Main St",
            city=city, state=state, zip_code="00000",
            capacity=cap, price_per_hour=price, minimum_hours=min_hours,
            images=[], amenities=AMENITIES[: 4 + (i % 4)],
            rules="No smoking indoors. Music off by midnight.",
            is_active=True,
        )
        db.add(venue)
        created["venues"] += 1

    # --- providers (one per category template, serving the city) ----------- #
    for cat, sname, rate, desc in PROVIDER_TEMPLATES:
        email = f"{cat.value}.{slug}@{SEED_DOMAIN}"
        puser, is_new = _get_or_create_user(
            db, email, "Pilot", f"{cat.value.title()} Pro",
            UserRole.SERVICE_PROVIDER, pw)
        created["provider_users"] += int(is_new)

        if puser.service_profiles:
            continue
        provider = ServiceProvider(
            user_id=puser.id,
            service_category=cat,
            service_name=sname,
            description=desc,
            hourly_rate=rate,
            minimum_hours=2,
            service_area_cities=[city],
            availability={}, images=[],
            rating=0.0, total_reviews=0,
            is_active=True,
        )
        db.add(provider)
        created["providers"] += 1

    db.flush()
    return created


def purge(db, city: str) -> int:
    """Delete only seeded users for this city; venues/providers cascade."""
    slug = _slug(city)
    seeded = (db.query(User)
              .filter(User.email.like(f"%.{slug}@{SEED_DOMAIN}"))
              .all())
    for u in seeded:
        db.delete(u)
    db.flush()
    return len(seeded)


def summarize(db, city: str) -> dict:
    venues = db.query(Venue).filter(Venue.city == city,
                                    Venue.is_active.is_(True)).count()
    provs = [p for p in db.query(ServiceProvider)
             .filter(ServiceProvider.is_active.is_(True)).all()
             if city in (p.service_area_cities or [])]
    covered = sorted({p.service_category.value for p in provs})
    target = ["catering", "photography", "dj", "bartending", "security",
              "cleaning", "decoration"]
    missing = [c for c in target if c not in covered]
    return {"venues": venues, "providers": len(provs),
            "categories_covered": covered, "missing_target_categories": missing}


# --------------------------------------------------------------------------- #
# CLI                                                                          #
# --------------------------------------------------------------------------- #
def main(argv=None):
    ap = argparse.ArgumentParser(description="Seed one city with venues + providers.")
    ap.add_argument("--city", required=True, help='e.g. "Austin"')
    ap.add_argument("--state", required=True, help='e.g. "TX"')
    ap.add_argument("--venues", type=int, default=10, help="number of venues (default 10)")
    ap.add_argument("--password", default=DEFAULT_PASSWORD,
                    help="login password for all seeded accounts")
    ap.add_argument("--dry-run", action="store_true",
                    help="print the plan and roll back (no writes)")
    ap.add_argument("--purge", action="store_true",
                    help="remove seeded rows for this city, then exit")
    args = ap.parse_args(argv)

    # Tables must exist (mirrors the app's startup create_all).
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if args.purge:
            n = purge(db, args.city)
            db.commit()
            print(f"Purged {n} seeded user(s) for {args.city} "
                  f"(venues/providers cascaded).")
            return 0

        before = summarize(db, args.city)
        created = seed(db, args.city, args.state, args.venues, args.password)

        if args.dry_run:
            db.rollback()
            print(f"[DRY RUN] would create: {created}  (rolled back)")
        else:
            db.commit()
            print(f"Seeded {args.city}, {args.state}: created {created}")

        after = summarize(db, args.city)
        print(f"Before: {before}")
        print(f"After:  {after}")
        if after["missing_target_categories"] and not args.dry_run:
            print(f"WARNING: still missing categories: "
                  f"{after['missing_target_categories']}")
        print(f"\nLogin for seeded accounts: password = {args.password!r}, "
              f"emails like owner1.{_slug(args.city)}@{SEED_DOMAIN}")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
