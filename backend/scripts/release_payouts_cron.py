"""Cron entrypoint for the release-payouts job.

Runs against the deployed API and reports the result. Designed to be
invoked by Railway's cron schedule (or any external scheduler).

Required env vars:
  API_URL      e.g. https://venueplus-api.up.railway.app
  CRON_SECRET  shared secret matching the backend's CRON_SECRET (optional in dev)

Schedule: every hour. The endpoint itself filters for bookings whose
end_datetime is >24h ago, so running more frequently is harmless.
"""
import json
import os
import sys
import urllib.request

API_URL = os.environ.get("API_URL", "http://localhost:8000").rstrip("/")
CRON_SECRET = os.environ.get("CRON_SECRET", "")


def main():
    url = f"{API_URL}/api/payments/release-payouts/cron"
    headers = {"Content-Type": "application/json"}
    if CRON_SECRET:
        headers["Authorization"] = f"Bearer {CRON_SECRET}"
    req = urllib.request.Request(url, data=b"", headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            payload = json.loads(r.read().decode("utf-8"))
        print(json.dumps(payload, indent=2, default=str))
        print(f"OK — checked {payload.get('checked', 0)} bookings, "
              f"sent {payload.get('total_sent', 0)}, "
              f"skipped {payload.get('total_skipped', 0)}")
        return 0
    except Exception as e:
        print(f"FAIL: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
