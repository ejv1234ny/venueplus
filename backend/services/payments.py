"""Payments service — Stripe Connect wrapper.

Two backends:
  - real:   uses stripe-python (set STRIPE_SECRET_KEY)
  - sim:    in-memory simulator. Used in dev/CI when no STRIPE_SECRET_KEY.

Money is always in **cents** (int) to avoid float drift.

Pricing model:
  - Platform fee: 7% of subtotal, taken from host/provider gross
  - Stripe fee: passed to customer as a separate line item, computed via gross-up
"""
import math
import os
import secrets
import time
from typing import Optional

PLATFORM_FEE_PCT = 0.12
STRIPE_FEE_PCT = 0.029   # 2.9%
STRIPE_FEE_FIXED_CENTS = 30


def cents(dollars: float) -> int:
    return int(round(dollars * 100))


def dollars(c: int) -> float:
    return round(c / 100.0, 2)


def gross_up_for_stripe(subtotal_cents: int) -> int:
    """Given the subtotal we want to net, compute the additional cents to
    charge so that after Stripe takes its 2.9% + $0.30, we still net the
    subtotal. Returns the FEE only (not the new total).

    total = (subtotal + 30) / (1 - 0.029)
    fee   = total - subtotal
    """
    if subtotal_cents <= 0:
        return 0
    total = (subtotal_cents + STRIPE_FEE_FIXED_CENTS) / (1 - STRIPE_FEE_PCT)
    return max(0, int(math.ceil(total)) - subtotal_cents)


def compute_breakdown(subtotal_cents: int) -> dict:
    """Returns the full breakdown shown to the customer at checkout."""
    stripe_fee = gross_up_for_stripe(subtotal_cents)
    platform_fee = int(round(subtotal_cents * PLATFORM_FEE_PCT))
    return {
        "subtotal_cents": subtotal_cents,
        "platform_fee_cents": platform_fee,
        "stripe_fee_cents": stripe_fee,
        "total_charged_cents": subtotal_cents + stripe_fee,
        "platform_fee_pct": PLATFORM_FEE_PCT,
    }


def split_payouts(subtotal_cents: int, line_items: list[dict]) -> list[dict]:
    """Given the lines (host + each provider) compute net payouts after
    deducting the 7% platform fee from each line proportionally.

    line_items: [{"recipient_user_id": int, "recipient_type": "host"|"provider",
                  "gross_cents": int, "booking_service_id": int|None,
                  "venue_id": int|None}]
    """
    out = []
    for li in line_items:
        gross = li["gross_cents"]
        fee = int(round(gross * PLATFORM_FEE_PCT))
        out.append({**li, "platform_fee_cents": fee, "net_cents": gross - fee})
    return out


# ---------------------------------------------------------------------------
# Backend selection
# ---------------------------------------------------------------------------
def _has_real_stripe() -> bool:
    return bool(os.getenv("STRIPE_SECRET_KEY"))


def _stripe():
    import stripe
    stripe.api_key = os.environ["STRIPE_SECRET_KEY"]
    return stripe


# ---------- Simulator state (process-local; resets on restart) ----------
_SIM = {"accounts": {}, "intents": {}, "transfers": {}, "refunds": {}}


def _sim_id(prefix: str) -> str:
    return f"{prefix}_{secrets.token_hex(8)}"


# ---------------------------------------------------------------------------
# Public API — same shape regardless of backend
# ---------------------------------------------------------------------------
def create_connect_account(email: str, country: str = "US") -> dict:
    if _has_real_stripe():
        s = _stripe()
        acct = s.Account.create(
            type="express",
            country=country,
            email=email,
            capabilities={
                "card_payments": {"requested": True},
                "transfers": {"requested": True},
            },
        )
        return {"id": acct.id, "details_submitted": acct.details_submitted,
                "charges_enabled": acct.charges_enabled,
                "payouts_enabled": acct.payouts_enabled}
    # Sim
    aid = _sim_id("acct")
    _SIM["accounts"][aid] = {"email": email, "submitted": False,
                             "charges_enabled": False, "payouts_enabled": False}
    return {"id": aid, "details_submitted": False,
            "charges_enabled": False, "payouts_enabled": False}


def create_account_link(account_id: str, return_url: str, refresh_url: str) -> str:
    if _has_real_stripe():
        s = _stripe()
        link = s.AccountLink.create(
            account=account_id,
            type="account_onboarding",
            return_url=return_url,
            refresh_url=refresh_url,
        )
        return link.url
    # Sim: return a fake URL that immediately "completes" the account
    _SIM["accounts"].setdefault(account_id, {})["submitted"] = True
    _SIM["accounts"][account_id]["charges_enabled"] = True
    _SIM["accounts"][account_id]["payouts_enabled"] = True
    return f"http://localhost:3000/sim-stripe-onboarding?acct={account_id}&return_to={return_url}"


def fetch_account(account_id: str) -> dict:
    if _has_real_stripe():
        s = _stripe()
        a = s.Account.retrieve(account_id)
        return {
            "id": a.id,
            "details_submitted": a.details_submitted,
            "charges_enabled": a.charges_enabled,
            "payouts_enabled": a.payouts_enabled,
            "requirements": a.requirements.to_dict() if a.requirements else {},
        }
    a = _SIM["accounts"].get(account_id, {})
    return {
        "id": account_id,
        "details_submitted": a.get("submitted", False),
        "charges_enabled": a.get("charges_enabled", False),
        "payouts_enabled": a.get("payouts_enabled", False),
        "requirements": {},
    }


def create_payment_intent(amount_cents: int, customer_email: str,
                          metadata: dict) -> dict:
    """Authorize-only (manual capture) intent."""
    if _has_real_stripe():
        s = _stripe()
        pi = s.PaymentIntent.create(
            amount=amount_cents,
            currency="usd",
            capture_method="manual",
            receipt_email=customer_email,
            metadata=metadata,
            automatic_payment_methods={"enabled": True},
        )
        return {"id": pi.id, "client_secret": pi.client_secret, "status": pi.status}
    pid = _sim_id("pi")
    _SIM["intents"][pid] = {
        "amount": amount_cents, "status": "requires_payment_method",
        "metadata": metadata, "captured": False, "refunded": 0,
    }
    return {"id": pid, "client_secret": f"{pid}_secret_{secrets.token_hex(8)}",
            "status": "requires_payment_method"}


def simulate_payment_success(intent_id: str) -> dict:
    """Test helper — sim mode only. Marks an intent as authorized."""
    if _has_real_stripe():
        raise RuntimeError("simulate_payment_success only for sim mode")
    pi = _SIM["intents"].get(intent_id)
    if not pi:
        raise RuntimeError("intent not found")
    pi["status"] = "requires_capture"
    return {"id": intent_id, "status": "requires_capture"}


def capture_payment_intent(intent_id: str) -> dict:
    if _has_real_stripe():
        s = _stripe()
        pi = s.PaymentIntent.capture(intent_id)
        charge_id = pi.latest_charge if hasattr(pi, "latest_charge") else None
        return {"id": pi.id, "status": pi.status, "charge_id": charge_id}
    pi = _SIM["intents"].get(intent_id)
    if not pi:
        raise RuntimeError("intent not found")
    pi["status"] = "succeeded"
    pi["captured"] = True
    return {"id": intent_id, "status": "succeeded", "charge_id": _sim_id("ch")}


def refund_payment(intent_id: str, amount_cents: Optional[int] = None,
                   reason: Optional[str] = None) -> dict:
    if _has_real_stripe():
        s = _stripe()
        kwargs = {"payment_intent": intent_id, "reverse_transfer": True}
        if amount_cents is not None:
            kwargs["amount"] = amount_cents
        if reason:
            kwargs["reason"] = "requested_by_customer"
        r = s.Refund.create(**kwargs)
        return {"id": r.id, "amount": r.amount, "status": r.status}
    pi = _SIM["intents"].get(intent_id)
    if not pi:
        raise RuntimeError("intent not found")
    amt = amount_cents if amount_cents is not None else pi["amount"] - pi["refunded"]
    pi["refunded"] += amt
    rid = _sim_id("re")
    _SIM["refunds"][rid] = {"intent": intent_id, "amount": amt}
    return {"id": rid, "amount": amt, "status": "succeeded"}


def create_transfer(amount_cents: int, destination_account_id: str,
                    transfer_group: str, metadata: dict) -> dict:
    if _has_real_stripe():
        s = _stripe()
        t = s.Transfer.create(
            amount=amount_cents,
            currency="usd",
            destination=destination_account_id,
            transfer_group=transfer_group,
            metadata=metadata,
        )
        return {"id": t.id, "amount": t.amount, "destination": t.destination}
    tid = _sim_id("tr")
    _SIM["transfers"][tid] = {
        "amount": amount_cents, "destination": destination_account_id,
        "group": transfer_group, "metadata": metadata,
    }
    return {"id": tid, "amount": amount_cents, "destination": destination_account_id}


def verify_webhook(payload: bytes, sig_header: str) -> dict:
    """Verifies a real Stripe webhook. In sim mode, just parses JSON."""
    if _has_real_stripe():
        s = _stripe()
        secret = os.environ["STRIPE_WEBHOOK_SECRET"]
        return s.Webhook.construct_event(payload, sig_header, secret)
    import json
    return json.loads(payload.decode("utf-8"))
