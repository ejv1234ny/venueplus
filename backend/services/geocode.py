"""Geocoding service.

Backends:
  - nominatim (default): free OpenStreetMap geocoder, no key. Be polite — 1 req/sec.
  - mapbox: set MAPBOX_TOKEN for higher quality + rate limit.
"""
import json
import os
import time
import urllib.parse
import urllib.request
from typing import Optional, Tuple

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
_LAST_CALL = 0.0


def _throttle():
    global _LAST_CALL
    delta = time.time() - _LAST_CALL
    if delta < 1.1:
        time.sleep(1.1 - delta)
    _LAST_CALL = time.time()


def _geocode_nominatim(address: str) -> Optional[Tuple[float, float]]:
    _throttle()
    params = urllib.parse.urlencode({"q": address, "format": "json", "limit": 1})
    req = urllib.request.Request(
        f"{NOMINATIM_URL}?{params}",
        headers={"User-Agent": "VenuePlus/1.0 (contact@venueplus.local)"},
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.loads(r.read().decode("utf-8"))
        if not data:
            return None
        return float(data[0]["lat"]), float(data[0]["lon"])
    except Exception as e:
        print(f"[geocode:nominatim] error: {e}")
        return None


def _geocode_mapbox(address: str) -> Optional[Tuple[float, float]]:
    token = os.getenv("MAPBOX_TOKEN")
    q = urllib.parse.quote(address)
    url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{q}.json?limit=1&access_token={token}"
    try:
        with urllib.request.urlopen(url, timeout=15) as r:
            data = json.loads(r.read().decode("utf-8"))
        feats = data.get("features", [])
        if not feats:
            return None
        lon, lat = feats[0]["center"]
        return float(lat), float(lon)
    except Exception as e:
        print(f"[geocode:mapbox] error: {e}")
        return None


def geocode(address: str) -> Optional[Tuple[float, float]]:
    if os.getenv("MAPBOX_TOKEN"):
        return _geocode_mapbox(address)
    return _geocode_nominatim(address)
