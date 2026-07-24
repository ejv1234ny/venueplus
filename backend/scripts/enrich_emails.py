"""Find contact emails for venue leads by scraping their websites.

For each VenueLead in the city that has a website but no email, fetch the site
(homepage + common contact pages) and extract the best contact email. Commits
per lead so a long run persists. Polite: identifies as VenuePlus, one site at a
time with a short pause.

Usage (from backend/):
  python -m scripts.enrich_emails --city Austin
  python -m scripts.enrich_emails --city Austin --dry-run
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
    ap.add_argument("--sleep", type=float, default=0.5)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args(argv)

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        leads = (db.query(VenueLead)
                 .filter(VenueLead.city == args.city,
                         VenueLead.website.isnot(None),
                         VenueLead.email.is_(None)).all())
        print(f"{len(leads)} lead(s) with a website and no email")
        found = 0
        for i, lead in enumerate(leads, 1):
            email = None
            try:
                email = ve.find_contact_email(lead.website)
            except Exception as e:
                print(f"  ! {lead.name}: {type(e).__name__}")
            if email:
                found += 1
                if not args.dry_run:
                    lead.email = email
                    db.commit()
                print(f"  [found] {lead.name}: {email}")
            if i % 10 == 0:
                print(f"  ...{i}/{len(leads)} (found {found})")
            time.sleep(args.sleep)
        print(f"Done: scanned {len(leads)}, emails found {found}")
    finally:
        db.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
