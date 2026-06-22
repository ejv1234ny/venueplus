"""Google Places photo suggestions.

Resolves an address/name to a place_id, pulls candidate photos, downloads each
into the configured storage backend (so the URLs persist), and returns them.
Requires GOOGLE_MAPS_API_KEY (Places API enabled). The API key never leaves the
server — clients only ever receive stored image URLs.
"""
import io
import os

import httpx

from services import storage

PLACES_BASE = "https://maps.googleapis.com/maps/api/place"
MAX_PHOTOS = 8
MAX_WIDTH = 1200
ATTRIBUTION = "Photo via Google"


def is_configured() -> bool:
    return bool(os.getenv("GOOGLE_MAPS_API_KEY"))


def fetch_suggestions(query: str) -> list[dict]:
    """Return ``[{"url", "attribution"}]`` of photos for the place matching ``query``.

    Photos are downloaded into storage so the returned URLs are durable; the raw
    Google Photo endpoint requires the server key and is not safe to hand to the
    client. Individual photos that fail to fetch or store are skipped.
    """
    key = os.environ["GOOGLE_MAPS_API_KEY"]
    out: list[dict] = []

    with httpx.Client(timeout=15, follow_redirects=True) as client:
        # 1) Text Search -> place_id
        r = client.get(f"{PLACES_BASE}/textsearch/json",
                       params={"query": query, "key": key})
        r.raise_for_status()
        results = r.json().get("results") or []
        if not results:
            return out
        place_id = results[0].get("place_id")
        if not place_id:
            return out

        # 2) Place Details -> photo references
        r = client.get(f"{PLACES_BASE}/details/json",
                       params={"place_id": place_id, "fields": "photo", "key": key})
        r.raise_for_status()
        photos = ((r.json().get("result") or {}).get("photos")) or []
        refs = [p["photo_reference"] for p in photos[:MAX_PHOTOS]
                if p.get("photo_reference")]

        # 3) Download each photo into the configured storage backend
        for ref in refs:
            try:
                pr = client.get(f"{PLACES_BASE}/photo",
                                params={"photo_reference": ref,
                                        "maxwidth": MAX_WIDTH, "key": key})
                pr.raise_for_status()
                content_type = pr.headers.get("content-type", "image/jpeg")
                content_type = content_type.split(";")[0].strip()
                url, _size, _backend = storage.save(
                    io.BytesIO(pr.content), "google-photo.jpg", content_type)
                out.append({"url": url, "attribution": ATTRIBUTION})
            except Exception:
                continue  # skip photos that fail to fetch/store

    return out
