"""Scrape contact emails for provider leads from their websites -> contact_email.

For each INACTIVE provider lead serving the city that has a website (parsed from
its description) and no contact_email yet, fetch the site and extract the best
contact email. Commits per lead so a long run persists/resumes.

Usage (from backend/):
  python -m scripts.enrich_provider_emails --city Austin
  python -m scripts.enrich_provider_emails --city Austin --limit 100
"""
from __future__ import annotations

import argparse
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import Base, engine, SessionLocal  # noqa: E402
import models  # noqa: E402,F401
from models import ServiceProvider  # noqa: E402
from services import provider_leads as pl  # noqa: E402
from services import venue_enrich as ve  # noqa: E402


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--city", required=True)
    ap.add_argument("--limit", type=int, default=None)
    ap.add_argument("--sleep", type=float, default=0.4)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args(argv)

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        rows = (db.query(ServiceProvider)
                .filter(ServiceProvider.is_active.is_(False),
                        ServiceProvider.contact_email.is_(None)).all())
        # serve-city filter + has-website, in Python (service_area_cities is JSON)
        leads = []
        for p in rows:
            areas = p.service_area_cities or []
            if args.city and not any(str(args.city).lower() in str(a).lower() for a in areas):
                continue
            if pl.lead_website(p):
                leads.append(p)
        if args.limit:
            leads = leads[:args.limit]
        print(f"{len(leads)} provider lead(s) with a website and no email")
        found = 0
        for i, p in enumerate(leads, 1):
            email = None
            try:
                email = ve.find_contact_email(pl.lead_website(p))
            except Exception:
                pass
            if email:
                found += 1
                if not args.dry_run:
                    p.contact_email = email
                    db.commit()
                print(f"  [found] {p.service_name}: {email}")
            if i % 25 == 0:
                print(f"  ...{i}/{len(leads)} (found {found})")
            time.sleep(args.sleep)
        print(f"Done: scanned {len(leads)}, emails found {found}")
    finally:
        db.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
