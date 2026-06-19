"""Provider lead ingestion from public/web data (OpenStreetMap + Google Places).

Shared core used by BOTH:
  * the ``scripts/ingest_providers.py`` CLI (bulk-populate a city), and
  * the Providers agent's live ``create_provider_invite`` tool (persist one
    candidate the agent decided to recruit).

There are tons of SMBs that provide event services. We pull the real ones and
store them as **provisional leads**: ``ServiceProvider`` rows created INACTIVE
(``is_active=False``) under a placeholder lead user on the ``@venueplus.lead``
domain, with the public source recorded. A lead is not bookable and does not
count as live supply; it only becomes a real provider after the business
claims/onboards. This keeps us honest -- we never list a business as opted-in
when it hasn't.

Two sources, same lead shape:
  * **OpenStreetMap** (Overpass) -- free, no key. Good for caterers,
    photographers, florists/decor, party/AV rental; sparse for DJs, bartending,
    cleaning. Category is derived from OSM tags (:func:`classify`).
  * **Google Places** (Places API New, ``searchText``) -- needs
    ``GOOGLE_PLACES_API_KEY``. Broad SMB coverage including the categories OSM
    misses. We query per category, so the category is known directly (carried
    on the candidate's ``category`` field, no tag classification needed).

GOOGLE PLACES ToS NOTE: Google's terms restrict caching most Place fields; the
``place_id`` may be stored indefinitely but other fields should be refreshed
and not retained long-term. Google-sourced leads therefore store ``place_id``
+ minimal fields and are tagged ``source="google_places"`` so they can be
re-fetched/expired. Treat them as a refreshable outreach queue, not a permanent
record. (OSM data is ODbL and freely storable with attribution.)
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

# Google Places text query per category. We search "<query> in <city>".
GOOGLE_QUERIES: dict[ServiceCategory, str] = {
    ServiceCategory.CATERING: "event catering service",
    ServiceCategory.PHOTOGRAPHY: "event photographer",
    ServiceCategory.DJ: "event DJ service",
    ServiceCategory.BARTENDING: "mobile bartending service",
    ServiceCategory.SECURITY: "event security service",
    ServiceCategory.CLEANING: "event cleaning service",
    ServiceCategory.DECORATION: "event decorator and florist",
    ServiceCategory.EQUIPMENT: "party and AV equipment rental",
}

TARGET_CATEGORIES = ["catering", "photography", "dj", "bartending",
                     "security", "cleaning", "decoration"]


def slug(s: str) -> str:
    return "".join(c.lower() if c.isalnum() else "-" for c in s).strip("-")


def classify(tags: dict) -> ServiceCategory | None:
    """OSM tag -> category."""
    for key, val, cat in OSM_TAG_TO_CATEGORY:
        if tags.get(key) == val:
            return cat
    return None


def _category_of(candidate: dict) -> ServiceCategory | None:
    """Resolve a candidate's category: an explicit ``category`` (Google path)
    wins; otherwise fall back to OSM tag classification."""
    c = candidate.get("category")
    if c is not None:
        if isinstance(c, ServiceCategory):
            return c
        try:
            return ServiceCategory(c)
        except ValueError:
            return None
    return classify(candidate.get("tags", {}) or {})


# --------------------------------------------------------------------------- #
# Source A: OpenStreetMap Overpass                                            #
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
            "name": name.strip(), "tags": tags, "source": "osm",
            "lat": el.get("lat") or (el.get("center") or {}).get("lat"),
            "lon": el.get("lon") or (el.get("center") or {}).get("lon"),
        })
    return out


def fetch_osm_candidates(city: str, timeout: int = 60) -> list[dict]:
    """Live Overpass fetch -> [{name, tags, source:'osm', ...}]. Raises on failure."""
    data = urllib.parse.urlencode({"data": build_overpass_query(city)}).encode()
    req = urllib.request.Request(
        "https://overpass-api.de/api/interpreter", data=data,
        headers={"User-Agent": "VenuePlus-ProviderIngest/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        payload = json.loads(resp.read().decode())
    return normalize_elements(payload.get("elements", []))


# Back-compat alias (older callers used fetch_candidates for OSM).
fetch_candidates = fetch_osm_candidates


# --------------------------------------------------------------------------- #
# Source B: Google Places (Places API New, searchText)                        #
# --------------------------------------------------------------------------- #
GOOGLE_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"
GOOGLE_FIELD_MASK = ("places.id,places.displayName,places.formattedAddress,"
                     "places.types,places.nationalPhoneNumber,places.websiteUri")


def normalize_google_places(places: list[dict],
                            category: ServiceCategory) -> list[dict]:
    """Google ``places`` array -> candidate dicts with an explicit category."""
    out = []
    for p in places or []:
        name = ((p.get("displayName") or {}).get("text") or "").strip()
        if not name:
            continue
        out.append({
            "name": name,
            "category": category,          # known from the per-category query
            "source": "google_places",
            "place_id": p.get("id"),       # the one field Google lets us retain
            "tags": {                      # minimal, refreshable fields
                "phone": p.get("nationalPhoneNumber"),
                "website": p.get("websiteUri"),
                "addr": p.get("formattedAddress"),
            },
        })
    return out


def fetch_google_candidates(city: str, api_key: str | None = None,
                            categories: list[ServiceCategory] | None = None,
                            per_query: int = 20, timeout: int = 30) -> list[dict]:
    """Live Google Places text search, one query per category. Returns merged
    candidates. Raises if no API key is configured."""
    api_key = api_key or os.getenv("GOOGLE_PLACES_API_KEY")
    if not api_key:
        raise RuntimeError("GOOGLE_PLACES_API_KEY not set")
    cats = categories or list(GOOGLE_QUERIES)
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": GOOGLE_FIELD_MASK,
    }
    results: list[dict] = []
    for cat in cats:
        query = GOOGLE_QUERIES.get(cat)
        if not query:
            continue
        body = json.dumps({"textQuery": f"{query} in {city}",
                           "maxResultCount": per_query}).encode()
        req = urllib.request.Request(GOOGLE_SEARCH_URL, data=body,
                                     headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            payload = json.loads(resp.read().decode())
        results.extend(normalize_google_places(payload.get("places", []), cat))
    return results


# --------------------------------------------------------------------------- #
# Multi-source gather (dedupe by name happens later, at write time)           #
# --------------------------------------------------------------------------- #
def gather_candidates(city: str, sources: list[str],
                      google_key: str | None = None) -> tuple[list[dict], dict]:
    """Pull candidates from the requested sources ("osm" / "google"). Returns
    (candidates, errors_by_source). A source that fails is skipped, not fatal,
    so one bad source can't sink the run."""
    candidates: list[dict] = []
    errors: dict[str, str] = {}
    for src in sources:
        try:
            if src == "osm":
                candidates += fetch_osm_candidates(city)
            elif src == "google":
                candidates += fetch_google_candidates(city, api_key=google_key)
            else:
                errors[src] = "unknown source"
        except Exception as e:
            errors[src] = f"{type(e).__name__}: {e}"
    return candidates, errors


# --------------------------------------------------------------------------- #
# Write: one lead, or many                                                     #
# --------------------------------------------------------------------------- #
def _lead_email(name: str, city: str) -> str:
    return f"lead-{slug(name)}.{slug(city)}@{LEAD_DOMAIN}"


def create_lead(db, city: str, candidate: dict,
                password_hash: str | None = None) -> ServiceProvider | None:
    """Create ONE provisional lead provider from a candidate. Category comes
    from an explicit ``candidate['category']`` (Google) or OSM tags. Returns the
    new ServiceProvider, or None if unclassifiable or already a lead
    (idempotent by name+city -- so the same business from OSM *and* Google is
    written once)."""
    name = (candidate.get("name") or "").strip()
    if not name:
        return None
    cat = _category_of(candidate)
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

    source = candidate.get("source", "osm")
    tags = candidate.get("tags", {}) or {}
    src = {k: tags[k] for k in tags
           if k in ("shop", "craft", "office", "phone", "website", "addr",
                    "addr:street", "addr:city") and tags.get(k)}
    if candidate.get("place_id"):
        src["google_place_id"] = candidate["place_id"]
    provider = ServiceProvider(
        user_id=user.id, service_category=cat, service_name=name,
        description=(f"Provisional lead pulled from {source} (public/web data); "
                    f"not yet onboarded. Source: {src}"),
        hourly_rate=0.0, minimum_hours=1, service_area_cities=[city],
        availability={}, images=[], rating=0.0, total_reviews=0,
        is_active=False,  # NOT bookable until claimed
    )
    db.add(provider)
    db.flush()
    return provider


def ingest(db, city: str, candidates: list[dict],
           max_per_category: int | None = None) -> dict:
    """Write classified candidates as provisional leads. Idempotent; dedupes a
    business that appears in multiple sources (by name+city)."""
    pw = get_password_hash(os.urandom(8).hex())
    per_cat: dict[str, int] = {}
    stats = {"considered": 0, "classified": 0, "created": 0,
             "skipped_existing": 0, "skipped_unclassified": 0,
             "by_category": {}, "by_source": {}}
    for cand in candidates:
        stats["considered"] += 1
        cat = _category_of(cand)
        if cat is None:
            stats["skipped_unclassified"] += 1
            continue
        stats["classified"] += 1
        if max_per_category and per_cat.get(cat.value, 0) >= max_per_category:
            continue
        if db.query(User).filter(
                User.email == _lead_email(cand.get("name", ""), city)).first():
            stats["skipped_existing"] += 1
            continue
        if create_lead(db, city, cand, password_hash=pw) is not None:
            per_cat[cat.value] = per_cat.get(cat.value, 0) + 1
            src = cand.get("source", "osm")
            stats["by_source"][src] = stats["by_source"].get(src, 0) + 1
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
