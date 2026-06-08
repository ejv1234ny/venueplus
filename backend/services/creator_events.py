"""Creator Events service layer — pure money math + helpers.

Built on top of `services/payments.py` (Stripe Connect wrapper, sim/real
backends). All money in cents.

Fee model (single fee, no double-dip):
  - Buyers pay ticket subtotal S, grossed up for Stripe's processing fee.
  - VenuePlus keeps PLATFORM_FEE_PCT * S as its platform fee.
  - The remaining (1 - PLATFORM_FEE_PCT) * S is the "creator pool".
  - Venue owner + providers are paid their FULL quoted costs out of the pool
    (no second platform fee — the booking flow's fee is waived for events
    settled this way).
  - Creator nets pool - costs. If negative, the gap is captured from the
    creator's deposit so venue/providers are still made whole.
"""
import math
import re
import secrets
from typing import Optional

from services import payments as p

PLATFORM_FEE_PCT = p.PLATFORM_FEE_PCT


# --------------------------------------------------------------------------
# Slug / QR helpers
# --------------------------------------------------------------------------
def slugify(title: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", (title or "event").lower()).strip("-")
    base = base[:40] or "event"
    return f"{base}-{secrets.token_hex(3)}"


def gen_qr_token() -> str:
    return f"tkt_{secrets.token_urlsafe(16)}"


# --------------------------------------------------------------------------
# Ticket pricing (buyer-facing)
# --------------------------------------------------------------------------
def ticket_breakdown(price_cents: int, quantity: int) -> dict:
    """What a buyer pays for `quantity` tickets at `price_cents` each.

    Reuses the same gross-up + fee logic as bookings so behaviour is
    consistent across the product.
    """
    subtotal = max(0, price_cents) * max(1, quantity)
    b = p.compute_breakdown(subtotal)   # platform_fee, stripe_fee, total_charged
    return {
        "subtotal_cents": subtotal,
        "platform_fee_cents": b["platform_fee_cents"],
        "stripe_fee_cents": b["stripe_fee_cents"],
        "total_charged_cents": b["total_charged_cents"],
        "platform_fee_pct": b["platform_fee_pct"],
    }


# --------------------------------------------------------------------------
# Inventory
# --------------------------------------------------------------------------
def can_reserve(tier_quantity: int, tier_sold: int, requested: int) -> bool:
    return requested > 0 and (tier_sold + requested) <= tier_quantity


# --------------------------------------------------------------------------
# Settlement
# --------------------------------------------------------------------------
def compute_settlement(ticket_subtotal_cents: int, cost_line_items: list[dict]) -> dict:
    """Given total PAID ticket subtotal and the event's cost lines (venue +
    each provider), produce the settlement plan.

    cost_line_items: [{"recipient_user_id": int, "recipient_type": "host"|"provider",
                       "gross_cents": int, "booking_service_id": int|None,
                       "venue_id": int|None, "label": str}]

    Returns a dict with the platform fee, the per-recipient payout rows
    (venue/providers at full cost, plus a "creator" row), and any deposit
    shortfall to capture.
    """
    S = max(0, ticket_subtotal_cents)
    platform_fee = int(round(S * PLATFORM_FEE_PCT))
    creator_pool = S - platform_fee
    total_costs = sum(max(0, li["gross_cents"]) for li in cost_line_items)
    creator_net = creator_pool - total_costs
    shortfall = max(0, -creator_net)
    creator_payout_net = max(0, creator_net)

    payouts = []
    # Venue + providers paid at full cost (platform fee already taken on tickets)
    for li in cost_line_items:
        payouts.append({
            "recipient_user_id": li["recipient_user_id"],
            "recipient_type": li["recipient_type"],
            "booking_service_id": li.get("booking_service_id"),
            "venue_id": li.get("venue_id"),
            "gross_cents": li["gross_cents"],
            "platform_fee_cents": 0,
            "net_cents": li["gross_cents"],
            "label": li.get("label", li["recipient_type"]),
        })

    return {
        "ticket_subtotal_cents": S,
        "platform_fee_cents": platform_fee,
        "creator_pool_cents": creator_pool,
        "total_costs_cents": total_costs,
        "creator_net_cents": creator_payout_net,
        "creator_raw_net_cents": creator_net,   # may be negative
        "deposit_shortfall_cents": shortfall,
        "cost_payouts": payouts,
        "fully_funded": shortfall == 0,
    }


def suggested_deposit_cents(cost_line_items: list[dict]) -> int:
    """Default deposit = 100% of event cost, so the platform is fully
    protected against an undersold/no-show event."""
    return sum(max(0, li["gross_cents"]) for li in cost_line_items)
