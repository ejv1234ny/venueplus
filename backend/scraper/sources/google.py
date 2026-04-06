"""Google Places API (New) source.

Requires GOOGLE_PLACES_API_KEY env var.
Docs: https://developers.google.com/maps/documentation/places/web-service/text-search
"""
import json
import os
import urllib.request
from typing import List

from scraper.types import RawProvider

PLACES_URL = "https://places.googleapis.com/v1/places:searchText"

# Free-text query templates per category.
CATEGORY_QUERIES = {
    "cleaning":    "event cleaning service",
    "security":    "event security company",
    "catering":    "event catering",
    "bartending":  "mobile bartending service",
    "dj":          "event DJ",
    "photography": "event photographer",
    "decoration":  "event decorator",
    "equipment":   "party equipment rental",
    "staff":       "event staffing agency",
}

FIELDS = (
    "places.id,places.displayName,places.formattedAddress,places.location,"
    "places.nationalPhoneNumber,places.websiteUri,places.rating,"
    "places.userRatingCount,places.types"
)


def fetch(city: str, state: str, category: str) -> List[RawProvider]:
    api_key = os.getenv("GOOGLE_PLACES_API_KEY")
    if not api_key:
        return []
    query_text = CATEGORY_QUERIES.get(category)
    if not query_text:
        return []

    body = json.dumps({"textQuery": f"{query_text} in {city}, {state}"}).encode("utf-8")
    req = urllib.request.Request(
        PLACES_URL,
        data=body,
        headers={
            "Content-Type": "application/json",
            "X-Goog-Api-Key": api_key,
            "X-Goog-FieldMask": FIELDS,
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            payload = json.loads(r.read().decode("utf-8"))
    except Exception as e:
        print(f"  [google] {category}: error {e}")
        return []

    out: List[RawProvider] = []
    for p in payload.get("places", []):
        loc = p.get("location") or {}
        out.append(RawProvider(
            source="google",
            source_id=p.get("id"),
            name=(p.get("displayName") or {}).get("text"),
            category=category,
            city=city,
            state=state,
            address=p.get("formattedAddress"),
            phone=p.get("nationalPhoneNumber"),
            website=p.get("websiteUri"),
            latitude=loc.get("latitude"),
            longitude=loc.get("longitude"),
            rating=p.get("rating"),
            review_count=p.get("userRatingCount"),
            tags=p.get("types") or [],
        ))
    return out
