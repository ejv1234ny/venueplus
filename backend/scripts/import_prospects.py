"""Import hand-gathered prospect sheets (the playbook's output) into the lead
lists the agent fleet roots outreach from.

This is the compliant bridge for ToS-protected sources (LoopNet/Crexi/Peerspace/
brokers): you gather prospects per the playbook, export to CSV/XLSX, and this
loads them as INACTIVE leads with contact + pitch angle.

Usage (from backend/):
  python -m scripts.import_prospects --kind venue    --city Austin --file venues.xlsx
  python -m scripts.import_prospects --kind provider --city Austin --file providers.csv
  python -m scripts.import_prospects --kind creator  --city Austin --file creators.csv
  python -m scripts.import_prospects --kind venue    --city Austin --file v.xlsx --dry-run

Column mapping is flexible (case/space-insensitive). Venue sheet columns like
Venue, Type, Area, Website, Contact, Indicative pricing, On competitor?, Pitch
angle, Notes are recognized; Contact is split into email + phone automatically.
"""
from __future__ import annotations

import argparse
import csv
import os
import re
import sys
import zipfile
import xml.etree.ElementTree as ET

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import Base, engine, SessionLocal  # noqa: E402
import models  # noqa: E402,F401
import models_creator  # noqa: E402,F401
from services import prospects  # noqa: E402

_NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
PHONE_RE = re.compile(r"(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}")

# canonical field -> accepted header aliases (lowercased, alnum-only)
VENUE_ALIASES = {
    "name": ["venue", "name", "business", "space"],
    "venue_type": ["type", "venuetype", "category"],
    "area": ["area", "neighborhood", "location"],
    "address": ["address", "addr"],
    "website": ["website", "url", "site"],
    "contact": ["contact", "contactinfo"],
    "email": ["email"],
    "phone": ["phone", "tel", "telephone"],
    "indicative_pricing": ["indicativepricing", "pricing", "price"],
    "on_competitor": ["oncompetitor", "competitor"],
    "pitch_angle": ["pitchangle", "pitch", "angle"],
    "notes": ["notes", "note"],
}
PROVIDER_ALIASES = {
    "name": ["name", "business", "provider"],
    "category": ["category", "type", "service"],
    "contact": ["contact"],
    "email": ["email"],
    "phone": ["phone", "tel"],
    "website": ["website", "url"],
    "address": ["address", "addr"],
}
CREATOR_ALIASES = {
    "name": ["name", "creator"],
    "handle": ["handle", "username", "ig", "instagram", "tiktok"],
    "platform": ["platform"],
    "niche": ["niche", "category"],
    "followers": ["followers", "audience"],
    "email": ["email"],
    "phone": ["phone"],
}
ALIASES = {"venue": VENUE_ALIASES, "provider": PROVIDER_ALIASES, "creator": CREATOR_ALIASES}


def _key(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


def _read_xlsx(path: str) -> list[list[str]]:
    z = zipfile.ZipFile(path)
    ss = []
    if "xl/sharedStrings.xml" in z.namelist():
        root = ET.fromstring(z.read("xl/sharedStrings.xml"))
        for si in root.iter(_NS + "si"):
            ss.append("".join(t.text or "" for t in si.iter(_NS + "t")))
    # first worksheet
    sheet = sorted(n for n in z.namelist()
                   if re.match(r"xl/worksheets/sheet\d+\.xml$", n))[0]
    sh = ET.fromstring(z.read(sheet))
    rows = []
    for r in sh.iter(_NS + "row"):
        cells = []
        for c in r.iter(_NS + "c"):
            v = c.find(_NS + "v")
            if v is None:
                cells.append("")
            elif c.get("t") == "s":
                cells.append(ss[int(v.text)])
            else:
                cells.append(v.text or "")
        rows.append(cells)
    return rows


def _read_csv(path: str) -> list[list[str]]:
    with open(path, newline="", encoding="utf-8-sig") as f:
        return [row for row in csv.reader(f)]


def _rows_to_dicts(grid: list[list[str]], aliases: dict) -> list[dict]:
    """Find the header row (first row mentioning a name-like column), map
    columns to canonical fields, and return data dicts."""
    name_keys = set(aliases["name"])
    header_idx = next((i for i, row in enumerate(grid)
                       if any(_key(c) in name_keys for c in row)), 0)
    header = grid[header_idx]
    colmap: dict[int, str] = {}
    for ci, h in enumerate(header):
        hk = _key(h)
        for field, al in aliases.items():
            if hk in al:
                colmap[ci] = field
                break
    out = []
    for row in grid[header_idx + 1:]:
        rec = {}
        for ci, val in enumerate(row):
            if ci in colmap and str(val).strip():
                rec[colmap[ci]] = str(val).strip()
        if rec.get("name"):
            out.append(rec)
    return out


def _split_contact(rec: dict) -> dict:
    """Populate email/phone from a free-text Contact column if not explicit."""
    blob = " ".join(str(rec.get(k, "")) for k in ("contact", "email", "phone", "website"))
    if not rec.get("email"):
        m = EMAIL_RE.search(blob)
        if m:
            rec["email"] = m.group(0)
    if not rec.get("phone"):
        m = PHONE_RE.search(blob)
        if m:
            rec["phone"] = m.group(0).strip()
    rec.pop("contact", None)
    return rec


def read_prospects(path: str, kind: str) -> list[dict]:
    grid = _read_xlsx(path) if path.lower().endswith(".xlsx") else _read_csv(path)
    recs = _rows_to_dicts(grid, ALIASES[kind])
    return [_split_contact(r) for r in recs]


def main(argv=None):
    ap = argparse.ArgumentParser(description="Import prospect sheets into lead lists.")
    ap.add_argument("--kind", required=True, choices=["venue", "provider", "creator"])
    ap.add_argument("--city", required=True)
    ap.add_argument("--file", required=True, help="CSV or XLSX path")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args(argv)

    rows = read_prospects(args.file, args.kind)
    print(f"Parsed {len(rows)} {args.kind} prospect(s) from {args.file}")
    for r in rows[:5]:
        print("  -", {k: r.get(k) for k in ("name", "email", "phone", "category", "niche") if r.get(k)})

    if args.dry_run:
        print("[dry-run] no writes.")
        return 0

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if args.kind == "venue":
            stats = prospects.import_venues(db, args.city, rows)
        elif args.kind == "provider":
            stats = prospects.import_providers(db, args.city, rows)
        else:
            stats = prospects.import_creators(db, args.city, rows)
        db.commit()
    finally:
        db.close()
    print(f"Imported: {stats}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
