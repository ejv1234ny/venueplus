"""Provider lead ingestion from public data (OpenStreetMap).

Shared core used by BOTH:
  * the ``scripts/ingest_providers.py`` CLI (bulk-populate a city), and
  * the Providers agent's live ``create_provider_invite`` tool (persist one
    candidate the agent decided to recruit).

There are tons of SMBs that provide event services. We pull the real ones from
OpenStreetMap and store them as **provisional leads**: ``ServiceProvider`` rows
created INACTIVE (``is_active=False``) under a placeholder lead user on the
``@venueplus.lead`` domain, with the public source recorded. A lead is not
bookable and does not count as live supply; it only becomes a real provider
after the business claims/onboards. This keeps us honest -- we never list a
business as opted-in when it hasn't.

OSM coverage is partial: caterers, photographers, florists/decor and party/AV
rental map well; DJs, bartending and cleaning are sparse in OSM (use a keyed
source like Google Places / Yelp for those later).
"""
from __future__ import annotations

import json
import os
import urllib.parse
import urllib.request

from models import User, UserRole, ServiceProvider, ServiceCategory
from auth import get_password_hash

LEAD_DOMAIN = "venueplus.lead"

# OSM tag (key, value) -> ServiceCategory. First match wins.
OSM_TAG_TO_CATEGORY: list[tuple[str, str, ServiceCategory]] = [
    ("shop", "caterer", ServiceCategory.CATERING),
    ("craft", "caterer", ServiceCategory.CATERING),
    ("craft", "photographer", ServiceCategory.PHOTOGRAPHY),
    ("shop", "photo", ServiceCategory.PHOTOGRAPHY),
    ("shop", "photo_studio", ServiceCategory.PHOTOGRAPHY),
    ("shop", "florist", ServiceCategory.DECORATION),
    ("craft", "florist", ServiceCategory.DECORATION),
    ("shop", "interior_decoration", ServiceCategory.DECORATION),
    ("shop", "party", ServiceCategory.EQUIPMENT),
    ("shop", "rental", ServiceCategory.EQUIPMENT),
    ("shop", "trade", ServiceCategory.EQUIPMENT),
    ("shop", "musical_instrument", ServiceCategory.DJ),
    ("office", "security", ServiceCategory.SECURITY),
]

TARGET_CATEGORIES = ["catering", "photography", "dj", "bartending",
                     "security", "cleaning", "decoration"]


def slug(s: str) -> str:
    return "".join(c.lower() if c.isalnum() else "-" for c in s).strip("-")


def classify(tags: dict) -> ServiceCategory | None:
    for key, val, cat in OSM_TAG_TO_CATEGORY:
        if tags.get(key) == val:
            return cat
    return None


# --------------------------------------------------------------------------- #
# Source: OpenStreetMap Overpass                                              #
# --------------------------------------------------------------------------- #
def build_overpass_query(city: str) -> str:
    selectors = "\n".join(
        f'  node["{k}"="{v}"](area.a);\n  way["{k}"="{v}"](area.a);'
        for k, v, _ in OSM_TAG_TO_CATEGORY)
    return (f'[out:json][timeout:30];\n'
            f'area["name"="{city}"]["boundary"="administrative"]->.a;\n'
            f'(\n{selectors}\n);\nout center 200;')


def normalize_elements(elements: list[dict]) -> list[dict]:
    out = []
    for el in elements:
        tags = el.get("tags", {}) or {}
        name = tags.get("name")
        if not name:
            continue
        out.append({
            "name": name.strip(), "tags": tags,
            "lat": el.get("lat") or (el.get("center") or {}).get("lat"),
            "lon": el.get("lon") or (el.get("center") or {}).get("lon"),
        })
    return out


def fetch_candidates(city: str, timeout: int = 60) -> list[dict]:
    """Live Overpass fetch -> [{name, tags, lat, lon}]. Raises on failure."""
    data = urllib.parse.urlencode({"data": build_overpass_query(city)}).encode()
    req = urllib.request.Request(
        "https://overpass-api.de/api/interpreter", data=data,
        headers={"User-Agent": "VenuePlus-ProviderIngest/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        payload = json.loads(resp.read().decode())
    return normalize_elements(payload.get("elements", []))


# --------------------------------------------------------------------------- #
# Write: one lead, or many                                                     #
# --------------------------------------------------------------------------- #
def _lead_email(name: str, city: str) -> str:
    return f"lead-{slug(name)}.{slug(city)}@{LEAD_DOMAIN}"


def create_lead(db, city: str, candidate: dict,
                password_hash: str | None = None) -> ServiceProvider | None:
    """Create ONE provisional lead provider from a candidate
    ``{name, tags, ...}``. Returns the new ServiceProvider, or None if it was
    unclassifiable or already exists (idempotent by name+city)."""
    name = (candidate.get("name") or "").strip()
    tags = candidate.get("tags", {}) or {}
    if not name:
        return None
    cat = classify(tags)
    if cat is None:
        return None
    email = _lead_email(name, city)
    if db.query(User).filter(User.email == email).first():
        return None

    pw = password_hash or get_password_hash(os.urandom(8).hex())
    user = User(email=email, hashed_password=pw, first_name="Lead",
                last_name=name[:60], role=UserRole.SERVICE_PROVIDER,
                is_active=False, is_verified=False)
    db.add(user)
    db.flush()

    src = {k: tags[k] for k in tags
           if k in ("shop", "craft", "office", "phone", "website",
                    "addr:street", "addr:city")}
    provider = ServiceProvider(
        user_id=user.id, service_category=cat, service_name=name,
        description=("Provisional lead pulled from OpenStreetMap (public data); "
                    f"not yet onboarded. Source tags: {src}"),
        hourly_rate=0.0, minimum_hours=1, service_area_cities=[city],
        availability={}, images=[], rating=0.0, total_reviews=0,
        is_active=False,  # NOT bookable until claimed
    )
    db.add(provider)
    db.flush()
    return provider


def ingest(db, city: str, candidates: list[dict],
           max_per_category: int | None = None) -> dict:
    """Write classified candidates as provisional leads. Idempotent."""
    pw = get_password_hash(os.urandom(8).hex())
    per_cat: dict[str, int] = {}
    stats = {"considered": 0, "classified": 0, "created": 0,
             "skipped_existing": 0, "skipped_unclassified": 0, "by_category": {}}
    for cand in candidates:
        stats["considered"] += 1
        cat = classify(cand.get("tags", {}) or {})
        if cat is None:
            stats["skipped_unclassified"] += 1
            continue
        stats["classified"] += 1
        if max_per_category and per_cat.get(cat.value, 0) >= max_per_category:
            continue
        before = db.query(User).filter(
            User.email == _lead_email(cand.get("name", ""), city)).first()
        if before:
            stats["skipped_existing"] += 1
            continue
        if create_lead(db, city, cand, password_hash=pw) is not None:
            per_cat[cat.value] = per_cat.get(cat.value, 0) + 1
            stats["created"] += 1
    stats["by_category"] = per_cat
    return stats


def purge(db, city: str) -> int:
    leads = (db.query(User)
             .filter(User.email.like(f"lead-%.{slug(city)}@{LEAD_DOMAIN}")).all())
    for u in leads:
        db.delete(u)
    db.flush()
    return len(leads)


def summarize(db, city: str) -> dict:
    leads = [p for p in db.query(ServiceProvider)
             .filter(ServiceProvider.is_active.is_(False)).all()
             if city in (p.service_area_cities or [])]
    active = [p for p in db.query(ServiceProvider)
              .filter(ServiceProvider.is_active.is_(True)).all()
              if city in (p.service_area_cities or [])]
    by_cat: dict[str, int] = {}
    for p in leads:
        by_cat[p.service_category.value] = by_cat.get(p.service_category.value, 0) + 1
    filled = sorted(by_cat)
    return {"lead_providers": len(leads), "active_providers": len(active),
            "leads_by_category": by_cat, "target_categories_filled": filled,
            "target_categories_empty": [c for c in TARGET_CATEGORIES
                                        if c not in filled]}
