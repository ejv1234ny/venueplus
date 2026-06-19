"""Populate a city's service providers from the internet (OSM + Google Places).

Thin CLI over :mod:`services.provider_leads`. Pulls real SMBs and writes them as
PROVISIONAL LEADS -- inactive ServiceProvider rows on the ``@venueplus.lead``
domain, not bookable until the business onboards. The Providers agent's live
``create_provider_invite`` uses the same module, so the agent and this script
populate leads identically.

Sources (``--source``):
  * ``osm``    -- OpenStreetMap, free, no key (default).
  * ``google`` -- Google Places (needs GOOGLE_PLACES_API_KEY or --google-key);
                  covers the categories OSM misses (bartending, cleaning, DJ).
  * ``both``   -- union of the two (a business in both is written once).

Safety: touches only the ``@venueplus.lead`` domain; idempotent; ``--dry-run``
rolls back; ``--purge`` removes a city's leads.

Usage (from backend/)::

    python -m scripts.ingest_providers --city "Austin" --state TX
    python -m scripts.ingest_providers --city "Austin" --source google
    python -m scripts.ingest_providers --city "Austin" --source both --max-per-category 25
    python -m scripts.ingest_providers --city "Austin" --dry-run
    python -m scripts.ingest_providers --city "Austin" --purge
"""
from __future__ import annotations

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, engine, Base  # noqa: E402
import models  # noqa: E402
from services import provider_leads as pl  # noqa: E402


def main(argv=None):
    ap = argparse.ArgumentParser(description="Ingest providers from OSM / Google Places as leads.")
    ap.add_argument("--city", required=True)
    ap.add_argument("--state", default="")  # accepted for symmetry; unused
    ap.add_argument("--source", choices=["osm", "google", "both"], default="osm")
    ap.add_argument("--google-key", default=None,
                    help="Google Places API key (else GOOGLE_PLACES_API_KEY env)")
    ap.add_argument("--max-per-category", type=int, default=None)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--purge", action="store_true")
    args = ap.parse_args(argv)

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if args.purge:
            n = pl.purge(db, args.city)
            db.commit()
            print(f"Purged {n} provider lead(s) for {args.city}.")
            return 0

        sources = ["osm", "google"] if args.source == "both" else [args.source]
        print(f"Fetching provider candidates for {args.city} from {sources}...")
        candidates, errors = pl.gather_candidates(
            args.city, sources, google_key=args.google_key)
        for src, err in errors.items():
            print(f"  WARNING [{src}]: {err}")
        if not candidates and errors:
            print("No candidates fetched (all sources failed).")
            return 1
        print(f"Fetched {len(candidates)} named businesses.")

        stats = pl.ingest(db, args.city, candidates, args.max_per_category)
        if args.dry_run:
            db.rollback()
            print(f"[DRY RUN] {stats}  (rolled back)")
        else:
            db.commit()
            print(f"Ingested leads for {args.city}: {stats}")
        summary = pl.summarize(db, args.city)
        print(f"Summary: {summary}")
        if summary["target_categories_empty"]:
            print("Note: still empty after these sources: "
                  f"{summary['target_categories_empty']} "
                  "(try --source both, or another keyed source)")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
