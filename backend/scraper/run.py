"""CLI runner for the VenuePlus scraper.

Usage:
  python -m scraper.run --city Austin --state TX
  python -m scraper.run --city Austin --state TX --category cleaning
  python -m scraper.run --city Austin --state TX --sources osm,yelp,google
"""
import argparse
import sys

from database import Base, engine, SessionLocal
from scraper.types import CATEGORIES
from scraper.sources import osm, yelp, google
from scraper.normalize import upsert

SOURCES = {"osm": osm, "yelp": yelp, "google": google}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--city", required=True)
    ap.add_argument("--state", required=True)
    ap.add_argument("--category", default=None,
                    help="Single category, otherwise all")
    ap.add_argument("--sources", default="osm",
                    help="Comma list: osm,yelp,google")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    cats = [args.category] if args.category else CATEGORIES
    src_names = [s.strip() for s in args.sources.split(",") if s.strip()]
    for s in src_names:
        if s not in SOURCES:
            print(f"unknown source: {s}", file=sys.stderr)
            sys.exit(2)

    Base.metadata.create_all(bind=engine)

    all_raw = []
    for src_name in src_names:
        src = SOURCES[src_name]
        print(f"\n== source: {src_name} ==")
        for cat in cats:
            results = src.fetch(args.city, args.state, cat)
            print(f"  {cat:12s} -> {len(results)} results")
            all_raw.extend(results)

    print(f"\nTotal raw records: {len(all_raw)}")

    if args.dry_run:
        for rp in all_raw[:20]:
            print(f"  - [{rp.category}] {rp.name} ({rp.source}) {rp.address or ''}")
        print(f"  ... ({len(all_raw)} total)")
        return

    db = SessionLocal()
    try:
        stats = upsert(db, all_raw)
    finally:
        db.close()
    print(f"\nDB upsert: inserted={stats['inserted']} skipped={stats['skipped']}")


if __name__ == "__main__":
    main()
