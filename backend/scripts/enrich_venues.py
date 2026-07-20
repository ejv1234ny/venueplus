"""Enrich venue leads for a city: fill phone/website/address/geo via Google
Places (when GOOGLE_PLACES_API_KEY is set) with a free Nominatim geocode
fallback. Commits per lead so a long run persists/resumes.

Usage (from backend/):
  GOOGLE_PLACES_API_KEY=... python -m scripts.enrich_venues --city Austin
  python -m scripts.enrich_venues --city Austin --dry-run
"""
from __future__ import annotations

import argparse
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import Base, engine, SessionLocal  # noqa: E402
import models  # noqa: E402,F401
from models import VenueLead  # noqa: E402
from services import venue_enrich as ve  # noqa: E402


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--city", required=True)
    ap.add_argument("--key", default=os.getenv("GOOGLE_PLACES_API_KEY"))
    ap.add_argument("--sleep", type=float, default=0.25, help="pause between calls")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args(argv)

    key = (args.key or "").strip() or None
    print(f"Enrichment source: {'Google Places' if key else 'Nominatim geocode only (no key)'}")
    # Nominatim policy is <=1 req/s; Places is fine faster.
    sleep = args.sleep if key else max(args.sleep, 1.0)

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        leads = db.query(VenueLead).filter(VenueLead.city == args.city).all()
        print(f"{len(leads)} venue lead(s) for {args.city}")
        totals = {"processed": 0, "phone": 0, "website": 0, "address": 0, "geo": 0}
        for i, lead in enumerate(leads, 1):
            try:
                filled = ve.enrich_lead(db, lead, key=key)
            except Exception as e:
                print(f"  ! {lead.name}: {type(e).__name__}: {e}")
                filled = {}
            if not args.dry_run:
                db.commit()
            totals["processed"] += 1
            for k in ("phone", "website", "address", "geo"):
                totals[k] += filled.get(k, 0)
            if i % 10 == 0 or i == len(leads):
                print(f"  {i}/{len(leads)} — phone+{totals['phone']} web+{totals['website']} geo+{totals['geo']}")
            time.sleep(sleep)
        if args.dry_run:
            db.rollback()
        print(f"Done: {totals}")
    finally:
        db.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
