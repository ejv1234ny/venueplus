"""Yelp Fusion API source.

Requires YELP_API_KEY env var. Free tier: 5,000 calls/day.
Sign up: https://docs.developer.yelp.com/
"""
import json
import os
import urllib.parse
import urllib.request
from typing import List

from scraper.types import RawProvider

YELP_URL = "https://api.yelp.com/v3/businesses/search"

# Yelp business category aliases per VenuePlus category.
CATEGORY_ALIASES = {
    "cleaning":    "homecleaning,officecleaning,janitorialservices",
    "security":    "securityservices",
    "catering":    "catering",
    "bartending":  "bartenders",
    "dj":          "djs",
    "photography": "eventphotography,sessionphotography",
    "decoration":  "florists,partyequipmentrentals",
    "equipment":   "partyequipmentrentals",
    "staff":       "personalassistants",
}


def fetch(city: str, state: str, category: str) -> List[RawProvider]:
    api_key = os.getenv("YELP_API_KEY")
    if not api_key:
        return []
    aliases = CATEGORY_ALIASES.get(category)
    if not aliases:
        return []

    out: List[RawProvider] = []
    for offset in (0, 50):  # up to 100 results
        params = {
            "location": f"{city}, {state}",
            "categories": aliases,
            "limit": 50,
            "offset": offset,
        }
        url = f"{YELP_URL}?{urllib.parse.urlencode(params)}"
        req = urllib.request.Request(url, headers={
            "Authorization": f"Bearer {api_key}",
            "User-Agent": "VenuePlus-Scraper/0.1",
        })
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                payload = json.loads(r.read().decode("utf-8"))
        except Exception as e:
            print(f"  [yelp] {category}: error {e}")
            return out

        for biz in payload.get("businesses", []):
            loc = biz.get("location") or {}
            coords = biz.get("coordinates") or {}
            out.append(RawProvider(
                source="yelp",
                source_id=biz.get("id"),
                name=biz.get("name"),
                category=category,
                city=loc.get("city") or city,
                state=loc.get("state") or state,
                address=", ".join(loc.get("display_address", []) or []) or None,
                phone=biz.get("phone"),
                website=biz.get("url"),
                latitude=coords.get("latitude"),
                longitude=coords.get("longitude"),
                rating=biz.get("rating"),
                review_count=biz.get("review_count"),
                tags=[c.get("alias") for c in biz.get("categories", []) if c.get("alias")],
            ))
        if len(payload.get("businesses", [])) < 50:
            break
    return out
