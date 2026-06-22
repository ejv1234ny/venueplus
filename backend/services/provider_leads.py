"""Provider-lead service.

Turns ingested (inactive) ServiceProvider rows into first-class ProviderLead
records carrying provenance, contact channels, and lifecycle state.

Two entry points:
  - upsert_lead(...): scrapers call this directly with clean RawProvider data
    (the recommended hook in scraper/normalize.py where the ServiceProvider is
    created). Dedupes on (source, source_id); idempotent.
  - backfill_inactive(db): materializes leads from ServiceProvider rows that
    already exist (e.g. earlier scraper runs), deriving provenance/contact from
    the synthetic email + bio + description. Best-effort; idempotent.
"""
import re
from typing import Optional

from sqlalchemy.orm import Session

from models import ServiceProvider, User
from models_leads import ProviderLead

_SOURCES = ("osm", "google", "yelp")
_SYNTH_EMAIL_SUFFIX = "@providers.venueplus.local"


def upsert_lead(db: Session, *, service_provider_id: int,
                source: Optional[str] = None, source_id: Optional[str] = None,
                website: Optional[str] = None, phone: Optional[str] = None,
                email: Optional[str] = None, rating: Optional[float] = None,
                review_count: Optional[int] = None) -> ProviderLead:
    """Create or update the ProviderLead for a service provider.

    Dedupes on (source, source_id) first, then falls back to service_provider_id,
    so re-ingesting the same business updates rather than duplicates.
    """
    lead = None
    if source and source_id:
        lead = db.query(ProviderLead).filter(
            ProviderLead.source == source,
            ProviderLead.source_id == source_id).first()
    if lead is None:
        lead = db.query(ProviderLead).filter(
            ProviderLead.service_provider_id == service_provider_id).first()
    if lead is None:
        lead = ProviderLead(service_provider_id=service_provider_id)
        db.add(lead)

    if source:
        lead.source = source
    if source_id:
        lead.source_id = source_id
    if website:
        lead.website = website
    if phone:
        lead.contact_phone = phone
    if email:
        lead.contact_email = email
    if rating is not None:
        lead.rating = rating
    if review_count is not None:
        lead.review_count = review_count

    db.commit()
    db.refresh(lead)
    return lead


def _derive_from_provider(sp: ServiceProvider, user: Optional[User]) -> dict:
    """Best-effort provenance/contact from an already-ingested lead row.

    The scraper encodes provenance in the synthetic email
    (`{slug}-{source}-{slug_id}@providers.venueplus.local`) and the user bio
    ("Imported from {source}. ..."), and the website inside the description
    ("... Website: {url}").
    """
    email = (user.email if user else "") or ""
    bio = (user.bio if user and user.bio else "")

    source = None
    m = re.search(r"Imported from (\w+)", bio)
    if m and m.group(1) in _SOURCES:
        source = m.group(1)

    source_id = None
    if email.endswith(_SYNTH_EMAIL_SUFFIX):
        source_id = email[: -len(_SYNTH_EMAIL_SUFFIX)]   # deterministic + unique
        if source is None:
            for s in _SOURCES:
                if f"-{s}-" in source_id:
                    source = s
                    break

    website = None
    mw = re.search(r"Website:\s*(\S+)", sp.description or "")
    if mw:
        website = mw.group(1).rstrip(".")

    return {"source": source, "source_id": source_id,
            "phone": user.phone if user else None, "website": website}


def backfill_inactive(db: Session) -> dict:
    """Materialize ProviderLead rows for inactive ServiceProviders that don't
    have one yet. Idempotent — already-materialized leads are skipped."""
    existing = {row[0] for row in db.query(ProviderLead.service_provider_id).all()}
    created = 0
    for sp in db.query(ServiceProvider).filter(
            ServiceProvider.is_active == False).all():  # noqa: E712
        if sp.id in existing:
            continue
        user = db.query(User).filter(User.id == sp.user_id).first()
        d = _derive_from_provider(sp, user)
        upsert_lead(db, service_provider_id=sp.id, source=d["source"],
                    source_id=d["source_id"], website=d["website"], phone=d["phone"])
        created += 1
    return {"backfilled": created, "skipped_existing": len(existing)}
