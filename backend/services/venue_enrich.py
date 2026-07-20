"""Venue-lead enrichment.

Fills a VenueLead (and its linked draft Venue) with contact + location:
  * Google Places (searchText) — phone, website, address, geo — when a key is
    configured. The only source of phone/website.
  * Nominatim geocoding (free, no key) — address + lat/lon fallback so drafts at
    least land on the map.

Both sources are polite: Places is a single searchText per venue; Nominatim is
rate-limited to <=1 req/s per its usage policy (the caller sleeps).
"""
from __future__ import annotations

import json
import re
import urllib.parse
import urllib.request

from models import VenueLead, Venue

NOMINATIM = "https://nominatim.openstreetmap.org/search"
PLACES = "https://places.googleapis.com/v1/places:searchText"
_UA = "VenuePlus/1.0 (+https://venueplus.net)"
_ADDR_IN_PARENS = re.compile(r"\(([^)]+)\)")


def geocode(query: str) -> dict | None:
    """Free Nominatim geocode -> {lat, lon, address} or None."""
    if not query:
        return None
    params = urllib.parse.urlencode({"q": query, "format": "json", "limit": 1})
    req = urllib.request.Request(f"{NOMINATIM}?{params}", headers={"User-Agent": _UA})
    with urllib.request.urlopen(req, timeout=20) as r:
        data = json.loads(r.read().decode())
    if not data:
        return None
    d = data[0]
    return {"lat": float(d["lat"]), "lon": float(d["lon"]),
            "address": d.get("display_name")}


def places_lookup(name: str, city: str, key: str) -> dict | None:
    """Google Places searchText -> {phone, website, address, lat, lon} or None."""
    body = json.dumps({"textQuery": f"{name} {city}".strip(),
                       "maxResultCount": 1}).encode()
    req = urllib.request.Request(PLACES, data=body, method="POST", headers={
        "Content-Type": "application/json", "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": ("places.displayName,places.nationalPhoneNumber,"
                             "places.websiteUri,places.formattedAddress,places.location"),
    })
    with urllib.request.urlopen(req, timeout=20) as r:
        data = json.loads(r.read().decode())
    places = data.get("places", [])
    if not places:
        return None
    p = places[0]
    loc = p.get("location", {}) or {}
    return {"phone": p.get("nationalPhoneNumber"), "website": p.get("websiteUri"),
            "address": p.get("formattedAddress"),
            "lat": loc.get("latitude"), "lon": loc.get("longitude")}


def _geo_query(lead: VenueLead) -> str:
    """Best free-geocode query: the street address baked into `area` (in parens)
    if present, else name + city."""
    area = lead.area or ""
    m = _ADDR_IN_PARENS.search(area)
    if m:
        return f"{m.group(1)}, {lead.city or ''}".strip(", ")
    if lead.address and lead.address != "(address pending)":
        return f"{lead.address}, {lead.city or ''}".strip(", ")
    return f"{lead.name}, {lead.city or ''}".strip(", ")


def enrich_lead(db, lead: VenueLead, key: str | None = None) -> dict:
    """Enrich one lead + its draft venue. Returns which fields were filled."""
    filled: dict[str, int] = {}
    info = None
    if key:
        try:
            info = places_lookup(lead.name, lead.city or "", key)
        except Exception:
            info = None

    lat = lon = None
    if info:
        if info.get("phone") and not lead.phone:
            lead.phone = info["phone"]; filled["phone"] = 1
        if info.get("website") and not lead.website:
            lead.website = info["website"]; filled["website"] = 1
        if info.get("address"):
            lead.address = info["address"]; filled["address"] = 1
        lat, lon = info.get("lat"), info.get("lon")
    else:
        g = geocode(_geo_query(lead))
        if g:
            lat, lon = g["lat"], g["lon"]
            if g.get("address") and (not lead.address or lead.address == "(address pending)"):
                lead.address = g["address"]; filled["address"] = 1

    if lead.draft_venue_id and lat is not None and lon is not None:
        v = db.query(Venue).filter(Venue.id == lead.draft_venue_id).first()
        if v:
            v.latitude, v.longitude = lat, lon
            if lead.address:
                v.address = lead.address
            filled["geo"] = 1
    db.flush()
    return filled
