"""Cron entrypoint for the orphan-upload cleanup job.

Calls the backend cleanup endpoint, which deletes object-storage files not
referenced by any venue/provider image or user profile photo and older than
ORPHAN_TTL_DAYS (default 7). Mirrors scripts/release_payouts_cron.py.

Required env vars:
  API_URL      e.g. https://venueplus-production.up.railway.app
  CRON_SECRET  shared secret matching the backend's CRON_SECRET (optional in dev)

Schedule: daily.
"""
import json
import os
import sys
import urllib.request

API_URL = os.environ.get("API_URL", "http://localhost:8000").rstrip("/")
CRON_SECRET = os.environ.get("CRON_SECRET", "")


def main():
    url = f"{API_URL}/api/uploads/cleanup-orphans/cron"
    headers = {"Content-Type": "application/json"}
    if CRON_SECRET:
        headers["Authorization"] = f"Bearer {CRON_SECRET}"
    req = urllib.request.Request(url, data=b"", headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            print("orphan-cleanup:", json.loads(r.read().decode("utf-8")))
    except Exception as e:
        print("orphan-cleanup failed:", e, file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
