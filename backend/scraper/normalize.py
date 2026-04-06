"""Normalize raw scraped providers into User + ServiceProvider rows."""
import re
import secrets
from typing import Iterable, Tuple

from sqlalchemy.orm import Session

from models import User, UserRole, ServiceProvider, ServiceCategory
from auth import get_password_hash
from scraper.types import RawProvider

# Default hourly rate by category (used when source has no pricing).
DEFAULT_RATES = {
    "cleaning": 60.0, "security": 65.0, "catering": 100.0,
    "bartending": 75.0, "dj": 125.0, "photography": 175.0,
    "decoration": 80.0, "equipment": 50.0, "staff": 40.0, "other": 50.0,
}


def _slug(s: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s or "provider"


def _split_name(name: str) -> Tuple[str, str]:
    parts = name.split(" ", 1)
    return (parts[0], parts[1] if len(parts) > 1 else "Co")


def _email_for(rp: RawProvider) -> str:
    # Synthetic deterministic email so we can dedupe and so the row is valid.
    return f"{_slug(rp.name)}-{rp.source}-{_slug(rp.source_id)}@providers.venueplus.local"


def upsert(db: Session, rps: Iterable[RawProvider]) -> dict:
    inserted = 0
    skipped = 0
    seen_emails = set()
    placeholder_pw = get_password_hash(secrets.token_urlsafe(16))

    for rp in rps:
        if not rp.name or not rp.category:
            skipped += 1
            continue
        try:
            cat = ServiceCategory(rp.category)
        except ValueError:
            cat = ServiceCategory.OTHER

        email = _email_for(rp)
        if email in seen_emails:
            skipped += 1
            continue
        seen_emails.add(email)

        # Skip if user already exists in DB
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            skipped += 1
            continue

        first, last = _split_name(rp.name)
        user = User(
            email=email,
            hashed_password=placeholder_pw,
            first_name=first[:50],
            last_name=last[:50],
            phone=rp.phone,
            role=UserRole.SERVICE_PROVIDER,
            is_verified=False,
            is_active=True,
            bio=f"Imported from {rp.source}. {rp.address or ''}".strip(),
        )
        db.add(user)
        db.flush()  # need user.id

        sp = ServiceProvider(
            user_id=user.id,
            service_category=cat,
            service_name=rp.name[:120],
            description=(
                f"{rp.name} — {rp.category} services"
                + (f" in {rp.city}" if rp.city else "")
                + (f". Website: {rp.website}" if rp.website else "")
            ),
            hourly_rate=DEFAULT_RATES.get(rp.category, 50.0),
            minimum_hours=2,
            service_area_cities=[rp.city] if rp.city else [],
            availability={"mon_fri": "09:00-22:00", "sat_sun": "09:00-23:00"},
            images=[],
            rating=rp.rating or 0.0,
            total_reviews=rp.review_count or 0,
            is_active=True,
        )
        db.add(sp)
        inserted += 1

    db.commit()
    return {"inserted": inserted, "skipped": skipped}
