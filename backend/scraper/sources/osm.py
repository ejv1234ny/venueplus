"""OpenStreetMap Overpass API source.

Free, no API key required. Coverage varies by category — best for shops
and offices, weaker for niche services.
"""
import json
import time
import urllib.parse
import urllib.request
from typing import List

from scraper.types import RawProvider

OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.osm.ch/api/interpreter",
]
THROTTLE_SECONDS = 3  # be a polite citizen

# Map our canonical categories to OSM tag filters.
# Each entry is a list of (key, value) tag pairs to OR together.
CATEGORY_QUERIES = {
    "cleaning": [
        ("shop", "dry_cleaning"),
        ("shop", "laundry"),
        ("office", "cleaning"),
        ("craft", "cleaning"),
    ],
    "security": [
        ("office", "security"),
        ("office", "guard"),
    ],
    "catering": [
        ("craft", "caterer"),
        ("shop", "catering"),
        ("amenity", "catering"),
    ],
    "bartending": [
        ("amenity", "bar"),
        ("amenity", "pub"),
    ],
    "dj": [
        ("shop", "music"),
        ("amenity", "nightclub"),
    ],
    "photography": [
        ("shop", "photo"),
        ("craft", "photographer"),
    ],
    "decoration": [
        ("shop", "florist"),
        ("shop", "party"),
    ],
    "equipment": [
        ("shop", "rental"),
        ("amenity", "rental"),
    ],
    "staff": [
        ("office", "employment_agency"),
    ],
}


def _build_query(city: str, category: str) -> str:
    pairs = CATEGORY_QUERIES.get(category, [])
    if not pairs:
        return ""
    filters = "\n".join(
        f'  nwr["{k}"="{v}"](area.searchArea);' for k, v in pairs
    )
    return f"""
[out:json][timeout:60];
area["name"="{city}"]["boundary"="administrative"]->.searchArea;
(
{filters}
);
out center tags 200;
""".strip()


def _post(query: str) -> dict:
    data = urllib.parse.urlencode({"data": query}).encode("utf-8")
    last_err = None
    for endpoint in OVERPASS_ENDPOINTS:
        for attempt in range(3):
            try:
                req = urllib.request.Request(
                    endpoint, data=data,
                    headers={"User-Agent": "VenuePlus-Scraper/0.1 (contact@venueplus.local)"},
                )
                with urllib.request.urlopen(req, timeout=120) as r:
                    return json.loads(r.read().decode("utf-8"))
            except urllib.error.HTTPError as e:
                last_err = e
                if e.code in (429, 504, 502, 503):
                    time.sleep(5 * (attempt + 1))
                    continue
                raise
            except Exception as e:
                last_err = e
                time.sleep(3)
    raise last_err if last_err else RuntimeError("overpass failed")


def fetch(city: str, state: str, category: str) -> List[RawProvider]:
    query = _build_query(city, category)
    if not query:
        return []
    time.sleep(THROTTLE_SECONDS)
    try:
        payload = _post(query)
    except Exception as e:
        print(f"  [osm] {category}: error {e}")
        return []

    out: List[RawProvider] = []
    for el in payload.get("elements", []):
        tags = el.get("tags", {}) or {}
        name = tags.get("name")
        if not name:
            continue
        # location
        if el.get("type") == "node":
            lat, lon = el.get("lat"), el.get("lon")
        else:
            c = el.get("center") or {}
            lat, lon = c.get("lat"), c.get("lon")

        addr_parts = [
            tags.get("addr:housenumber"),
            tags.get("addr:street"),
            tags.get("addr:city"),
        ]
        address = " ".join(p for p in addr_parts if p) or None

        out.append(RawProvider(
            source="osm",
            source_id=f"{el.get('type')}/{el.get('id')}",
            name=name,
            category=category,
            city=city,
            state=state,
            address=address,
            phone=tags.get("phone") or tags.get("contact:phone"),
            website=tags.get("website") or tags.get("contact:website"),
            latitude=lat,
            longitude=lon,
            tags=[f"{k}={v}" for k, v in tags.items() if k in ("shop", "amenity", "office", "craft")],
        ))
    return out
