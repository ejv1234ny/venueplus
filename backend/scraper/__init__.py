"""VenuePlus service-provider scraper.

Pulls service providers from public sources, normalizes them, and inserts
them into the VenuePlus database as User + ServiceProvider rows.

Sources:
  - osm     : OpenStreetMap Overpass API (free, no key)
  - yelp    : Yelp Fusion API (set YELP_API_KEY)
  - google  : Google Places API (set GOOGLE_PLACES_API_KEY)
"""
