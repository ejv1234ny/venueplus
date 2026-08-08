"""Autonomy drain cron — approve queued outreach under the policy envelope.

Run every ~15 minutes as a Railway cron service (see
``railway-cron-autonomy.json``); the same tick is callable on demand via
``POST /api/agents/autonomy/tick`` (CRON_SECRET-gated).

The tick itself lives in ``agents/autonomy.py`` and enforces the full
envelope: master + fleet switches, AGENTS_LIVE, tool allowlist, suppression,
dedupe, send window, staged daily cap, and the bounce/complaint circuit
breaker. This script just gives it a heartbeat.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from database import SessionLocal          # noqa: E402
from agents import autonomy                # noqa: E402


def main() -> int:
    db = SessionLocal()
    try:
        out = autonomy.run_tick(db)
        db.commit()
        print(f"[drain] {json.dumps(out, default=str)}")
        return 0
    except Exception as e:
        db.rollback()
        print(f"[drain] FAILED: {type(e).__name__}: {e}")
        return 1
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
