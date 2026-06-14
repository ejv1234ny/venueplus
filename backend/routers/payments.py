"""Stripe Connect payments router.

Endpoints:
  POST /onboarding-link              -> Stripe Connect onboarding URL for current user
  GET  /account-status               -> is current user payout-enabled?
  POST /checkout/{booking_id}        -> create PaymentIntent + line-item breakdown
  POST /sim-confirm/{booking_id}     -> sim-mode only: simulate card success
  POST /capture/{booking_id}         -> capture authorized payment (host confirms)
  POST /refund/{booking_id}          -> issue refund per cancellation policy
  POST /release-payouts/{booking_id} -> fan-out transfers after event end
  POST /webhook                      -> Stripe webhook handler
  GET  /my/payouts                   -> dashboard for current user
  GET  /breakdown/{booking_id}       -> view price breakdown without creating PI

FREE MODE (config.is_free_mode): /checkout short-circuits — no PaymentIntent,
no Payment/Payout rows; the booking moves straight to host approval. The rest
of the Stripe Connect plumbing stays intact and reactivates when FREE_MODE is
turned off.
"""
import os
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from auth import get_current_active_user, require_admin
from config import is_free_mode
from database import get_db
from models import (User, UserRole, Venue, Booking, BookingStatus,
                    BookingService, ServiceProvider, StripeAccount,
                    Payment, PaymentStatus, Payout, PayoutStatus,
                    Notification, NotificationType)
from services import payments as p
from services import email as email_svc

router = APIRouter()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


def _now():
    return datetime.now(timezone.utc)


def _aware(dt):
    if dt is None: return dt
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def _ensure_stripe_customer(db: Session, user: User) -> str:
    """Returns the Stripe customer id for a user, creating one if missing."""
    if user.stripe_customer_id:
        return user.stripe_customer_id
    c = p.create_customer(
        email=user.email,
        name=f"{user.first_name} {user.last_name}".strip(),
        metadata={"user_id": str(user.id)},
        idempotency_key=f"customer_user_{user.id}",
    )
    user.stripe_customer_id = c["id"]
    db.commit()
    return c["id"]


def _ensure_stripe_account(db: Session, user: User) -> StripeAccount:
    sa = db.query(StripeAccount).filter(StripeAccount.user_id == user.id).first()
    if sa:
        return sa
    acct = p.create_connect_account(
        email=user.email,
        idempotency_key=f"connect_acct_user_{user.id}",
    )
    sa = StripeAccount(
        user_id=user.id,
        stripe_account_id=acct["id"],
        details_submitted=acct["details_submitted"],
        charges_enabled=acct["charges_enabled"],
        payouts_enabled=acct["payouts_enabled"],
    )
    db.add(sa); db.commit(); db.refresh(sa)
    return sa


# ---------------- ONBOARDING ----------------
@router.post("/onboarding-link")
def onboarding_link(current_user: User = Depends(get_current_active_user),
                    db: Session = Depends(get_db)):
    if current_user.role not in (UserRole.VENUE_OWNER, UserRole.SERVICE_PROVIDER):
        raise HTTPException(403, "Only hosts and providers can onboard")
    sa = _ensure_stripe_account(db, current_user)
    url = p.create_account_link(
        sa.stripe_account_id,
        return_url=f"{FRONTEND_URL}/payouts/onboarding/return",
        refresh_url=f"{FRONTEND_URL}/payouts/onboarding/refresh",
    )
    # In sim mode the link "completes" the account immediately. Refresh.
    info = p.fetch_account(sa.stripe_account_id)
    sa.details_submitted = info["details_submitted"]
    sa.charges_enabled = info["charges_enabled"]
    sa.payouts_enabled = info["payouts_enabled"]
    sa.onboarding_complete = info["details_submitted"] and info["payouts_enabled"]
    db.commit()
    return {"url": url, "account_status": {
        "id": sa.stripe_account_id,
        "onboarding_complete": sa.onboarding_complete,
        "charges_enabled": sa.charges_enabled,
        "payouts_enabled": sa.payouts_enabled,
    }}


@router.get("/account-status")
def account_status(current_user: User = Depends(get_current_active_user),
                   db: Session = Depends(get_db)):
    sa = db.query(StripeAccount).filter(StripeAccount.user_id == current_user.id).first()
    if not sa:
        return {"connected": False, "onboarding_complete": False, "payouts_enabled": False}
    return {
        "connected": True,
        "onboarding_complete": sa.onboarding_complete,
        "charges_enabled": sa.charges_enabled,
        "payouts_enabled": sa.payouts_enabled,
    }


# ---------------- CHECKOUT ----------------
def _compute_booking_payouts(db: Session, booking: Booking) -> tuple[dict, list[dict]]:
    """Returns (breakdown, line_items) where line_items have recipient info
    and gross_cents for each host/provider that should be paid."""
    venue = db.query(Venue).filter(Venue.id == booking.venue_id).first()
    venue_cents = p.cents(booking.venue_cost)

    line_items = [{
        "recipient_user_id": venue.owner_id,
        "recipient_type": "host",
        "venue_id": venue.id,
        "booking_service_id": None,
        "gross_cents": venue_cents,
        "label": f"Venue: {venue.title}",
    }]
    services = db.query(BookingService).filter(BookingService.booking_id == booking.id).all()
    for bs in services:
        sp = db.query(ServiceProvider).filter(ServiceProvider.id == bs.service_provider_id).first()
        if not sp:
            continue
        line_items.append({
            "recipient_user_id": sp.user_id,
            "recipient_type": "provider",
            "venue_id": None,
            "booking_service_id": bs.id,
            "gross_cents": p.cents(bs.cost),
            "label": f"{sp.service_category.value.title()}: {sp.service_name}",
        })

    subtotal = sum(li["gross_cents"] for li in line_items)
    breakdown = p.compute_breakdown(subtotal)
    return breakdown, line_items


@router.get("/breakdown/{booking_id}")
def get_breakdown(booking_id: int,
                  current_user: User = Depends(get_current_active_user),
                  db: Session = Depends(get_db)):
    """Show the price breakdown for a booking without creating a PaymentIntent."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(404, "Not found")
    if booking.renter_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(403, "Not yours")
    breakdown, lines = _compute_booking_payouts(db, booking)
    note = ("VenuePlus is free during beta — no charges." if breakdown.get("free_mode")
            else "Platform fee is deducted from host/provider payouts. "
                 "Stripe processing fee is added to your total.")
    return {
        "lines": [{"label": l["label"],
                   "gross": p.dollars(l["gross_cents"]),
                   "type": l["recipient_type"]} for l in lines],
        "subtotal": p.dollars(breakdown["subtotal_cents"]),
        "platform_fee": p.dollars(breakdown["platform_fee_cents"]),
        "platform_fee_pct": breakdown["platform_fee_pct"],
        "stripe_processing_fee": p.dollars(breakdown["stripe_fee_cents"]),
        "total": p.dollars(breakdown["total_charged_cents"]),
        "free_mode": breakdown.get("free_mode", False),
        "note": note,
    }


@router.post("/checkout/{booking_id}")
def checkout(booking_id: int,
             current_user: User = Depends(get_current_active_user),
             db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(404, "Booking not found")
    if booking.renter_id != current_user.id:
        raise HTTPException(403, "Not your booking")

    # FREE MODE: no payment. Move the booking to host approval and return.
    if is_free_mode():
        if booking.status == BookingStatus.AWAITING_PAYMENT:
            booking.status = BookingStatus.PENDING
            db.add(Notification(
                user_id=db.query(Venue).filter(Venue.id == booking.venue_id).first().owner_id,
                type=NotificationType.BOOKING_CREATED,
                title="Booking request — please confirm",
                body=f"Free booking #{booking.id} awaiting your approval",
                link=f"/host/bookings/{booking.id}",
            ))
            db.commit()
        return {
            "free_mode": True,
            "total_charged": 0,
            "status": booking.status.value,
            "message": "VenuePlus is free during beta — no payment required. "
                       "Your request is awaiting host confirmation.",
        }

    if booking.status != BookingStatus.AWAITING_PAYMENT:
        raise HTTPException(400, f"Booking is {booking.status.value}, not awaiting payment")

    existing = db.query(Payment).filter(Payment.booking_id == booking.id).first()
    if existing and existing.status not in (PaymentStatus.FAILED, PaymentStatus.CANCELED):
        # Already have a usable PI
        return {
            "payment_intent_id": existing.stripe_payment_intent_id,
            "client_secret": None,  # client should call /sim-confirm or already has the secret
            "total_charged": p.dollars(existing.total_charged_cents),
            "status": existing.status.value,
        }

    breakdown, lines = _compute_booking_payouts(db, booking)

    # Ensure the renter has a Stripe Customer (for saved cards across bookings)
    customer_id = _ensure_stripe_customer(db, current_user)

    intent = p.create_payment_intent(
        amount_cents=breakdown["total_charged_cents"],
        customer_email=current_user.email,
        metadata={"booking_id": str(booking.id), "renter_id": str(current_user.id)},
        customer_id=customer_id,
        idempotency_key=f"pi_booking_{booking.id}",
    )

    payment = Payment(
        booking_id=booking.id,
        stripe_payment_intent_id=intent["id"],
        subtotal_cents=breakdown["subtotal_cents"],
        platform_fee_cents=breakdown["platform_fee_cents"],
        stripe_fee_cents=breakdown["stripe_fee_cents"],
        total_charged_cents=breakdown["total_charged_cents"],
        status=PaymentStatus.PENDING,
    )
    db.add(payment); db.flush()

    # Create pending payout rows
    payouts = p.split_payouts(breakdown["subtotal_cents"], lines)
    for li in payouts:
        db.add(Payout(
            booking_id=booking.id,
            payment_id=payment.id,
            recipient_user_id=li["recipient_user_id"],
            recipient_type=li["recipient_type"],
            booking_service_id=li["booking_service_id"],
            venue_id=li["venue_id"],
            gross_cents=li["gross_cents"],
            platform_fee_cents=li["platform_fee_cents"],
            net_cents=li["net_cents"],
            status=PayoutStatus.PENDING,
        ))
    db.commit(); db.refresh(payment)

    return {
        "payment_intent_id": intent["id"],
        "client_secret": intent["client_secret"],
        "total_charged": p.dollars(breakdown["total_charged_cents"]),
        "subtotal": p.dollars(breakdown["subtotal_cents"]),
        "platform_fee": p.dollars(breakdown["platform_fee_cents"]),
        "stripe_processing_fee": p.dollars(breakdown["stripe_fee_cents"]),
        "status": "requires_payment_method",
    }


@router.post("/sim-confirm/{booking_id}")
def sim_confirm(booking_id: int,
                current_user: User = Depends(get_current_active_user),
                db: Session = Depends(get_db)):
    """Sim-mode helper: marks the PaymentIntent as authorized (skipping the
    Stripe Elements card form). Use only when STRIPE_SECRET_KEY is unset.
    """
    if os.getenv("STRIPE_SECRET_KEY"):
        raise HTTPException(400, "Sim endpoint disabled when real Stripe is configured")
    payment = db.query(Payment).filter(Payment.booking_id == booking_id).first()
    if not payment:
        raise HTTPException(404, "No payment for booking")
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if booking.renter_id != current_user.id:
        raise HTTPException(403, "Not your booking")
    p.simulate_payment_success(payment.stripe_payment_intent_id)
    payment.status = PaymentStatus.AUTHORIZED
    booking.status = BookingStatus.PENDING  # awaiting host approval
    db.add(Notification(
        user_id=db.query(Venue).filter(Venue.id == booking.venue_id).first().owner_id,
        type=NotificationType.BOOKING_CREATED,
        title="Payment authorized — please confirm",
        body=f"Renter authorized payment for booking #{booking.id}",
        link=f"/host/bookings/{booking.id}",
    ))
    db.commit()
    return {"ok": True, "status": payment.status.value}


# ---------------- CAPTURE (host confirms) ----------------
@router.post("/capture/{booking_id}")
def capture(booking_id: int,
            current_user: User = Depends(get_current_active_user),
            db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(404, "Not found")
    venue = db.query(Venue).filter(Venue.id == booking.venue_id).first()
    if venue.owner_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(403, "Only host or admin")

    payment = db.query(Payment).filter(Payment.booking_id == booking.id).first()
    if not payment:
        raise HTTPException(400, "No payment to capture")
    if payment.status != PaymentStatus.AUTHORIZED:
        raise HTTPException(400, f"Payment is {payment.status.value}")

    result = p.capture_payment_intent(
        payment.stripe_payment_intent_id,
        idempotency_key=f"capture_payment_{payment.id}",
    )
    payment.status = PaymentStatus.CAPTURED
    payment.captured_at = _now()
    payment.stripe_charge_id = result.get("charge_id")
    booking.status = BookingStatus.CONFIRMED

    # Schedule payouts (still PENDING — they go out after event end)
    db.query(Payout).filter(Payout.payment_id == payment.id).update(
        {Payout.status: PayoutStatus.SCHEDULED})

    # Notify renter
    db.add(Notification(
        user_id=booking.renter_id, type=NotificationType.BOOKING_CONFIRMED,
        title=f"Booking confirmed: {venue.title}",
        body=f"Your card was charged ${p.dollars(payment.total_charged_cents)}",
        link=f"/bookings/{booking.id}",
    ))
    db.commit()
    return {"ok": True, "captured": p.dollars(payment.total_charged_cents)}


# ---------------- REFUND ----------------
@router.post("/refund/{booking_id}")
def refund(booking_id: int, refund_pct: int = 100,
           current_user: User = Depends(get_current_active_user),
           db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(404, "Not found")
    venue = db.query(Venue).filter(Venue.id == booking.venue_id).first()
    if (booking.renter_id != current_user.id and venue.owner_id != current_user.id
            and current_user.role != UserRole.ADMIN):
        raise HTTPException(403, "Not authorized")
    payment = db.query(Payment).filter(Payment.booking_id == booking.id).first()
    if not payment or payment.status not in (PaymentStatus.AUTHORIZED, PaymentStatus.CAPTURED):
        raise HTTPException(400, "No captured payment to refund")
    if not (0 <= refund_pct <= 100):
        raise HTTPException(400, "refund_pct out of range")

    refund_amount = int(round(payment.total_charged_cents * refund_pct / 100))
    if refund_amount == 0:
        return {"ok": True, "refunded": 0, "note": "Policy: zero refund window"}

    res = p.refund_payment(
        payment.stripe_payment_intent_id,
        amount_cents=refund_amount,
        reason="cancellation",
        idempotency_key=f"refund_payment_{payment.id}_pct{refund_pct}",
    )
    payment.refunded_cents += refund_amount
    payment.refunded_at = _now()
    payment.status = (PaymentStatus.REFUNDED if refund_amount == payment.total_charged_cents
                      else PaymentStatus.PARTIALLY_REFUNDED)
    payment.refund_reason = f"cancellation {refund_pct}%"

    # Reverse the corresponding payouts proportionally
    payouts = db.query(Payout).filter(Payout.payment_id == payment.id).all()
    for po in payouts:
        if po.status in (PayoutStatus.PENDING, PayoutStatus.SCHEDULED):
            po.status = PayoutStatus.REVERSED if refund_pct == 100 else PayoutStatus.SCHEDULED
            if refund_pct < 100:
                po.gross_cents = int(round(po.gross_cents * (100 - refund_pct) / 100))
                po.platform_fee_cents = int(round(po.gross_cents * p.PLATFORM_FEE_PCT))
                po.net_cents = po.gross_cents - po.platform_fee_cents

    booking.status = BookingStatus.REFUNDED if refund_pct == 100 else BookingStatus.CANCELLED
    db.commit()
    return {"ok": True, "refunded": p.dollars(refund_amount), "refund_id": res["id"]}


# ---------------- RELEASE PAYOUTS ----------------
@router.post("/release-payouts/cron")
def release_payouts_cron(request: Request, db: Session = Depends(get_db)):
    """Cron-friendly: finds every CONFIRMED booking whose end_datetime is
    >24h ago and whose payment is captured, and runs the per-booking
    release-payouts logic on each. Idempotent — already-sent payouts are
    skipped because release_for_booking only acts on SCHEDULED status.

    Protected by CRON_SECRET env var (Bearer token in Authorization header).
    Set this in Railway and pass it from the cron config.
    """
    from datetime import timedelta
    expected = os.getenv("CRON_SECRET")
    # In prod (CRON_SECRET set) require it. In dev (unset) allow direct calls.
    if expected:
        provided = request.headers.get("authorization", "")
        if provided != f"Bearer {expected}":
            raise HTTPException(401, "Invalid cron secret")
    cutoff = _now() - timedelta(hours=24)

    eligible = db.query(Booking).filter(
        Booking.status == BookingStatus.CONFIRMED,
        Booking.end_datetime < cutoff,
    ).all()

    summary = {"checked": len(eligible), "bookings": [], "total_sent": 0,
               "total_skipped": 0}
    for b in eligible:
        payment = db.query(Payment).filter(Payment.booking_id == b.id).first()
        if not payment or payment.status not in (PaymentStatus.CAPTURED,
                                                 PaymentStatus.PARTIALLY_REFUNDED):
            continue
        result = _release_for_booking(db, b)
        summary["bookings"].append({"booking_id": b.id, **result})
        summary["total_sent"] += result["sent"]
        summary["total_skipped"] += result["skipped"]
    return summary


def _release_for_booking(db: Session, booking: Booking) -> dict:
    """Internal helper used by both the per-booking endpoint and the cron."""
    payment = db.query(Payment).filter(Payment.booking_id == booking.id).first()
    payouts = db.query(Payout).filter(
        Payout.payment_id == payment.id,
        Payout.status == PayoutStatus.SCHEDULED,
    ).all()
    sent = 0
    skipped = 0
    for po in payouts:
        sa = db.query(StripeAccount).filter(
            StripeAccount.user_id == po.recipient_user_id).first()
        if not sa or not sa.payouts_enabled:
            po.status = PayoutStatus.PENDING
            po.error_message = "recipient has no payout-enabled Stripe account"
            skipped += 1
            continue
        try:
            t = p.create_transfer(
                amount_cents=po.net_cents,
                destination_account_id=sa.stripe_account_id,
                transfer_group=f"booking_{booking.id}",
                metadata={"booking_id": str(booking.id),
                          "payout_id": str(po.id),
                          "recipient_type": po.recipient_type},
                idempotency_key=f"transfer_payout_{po.id}",
            )
            po.stripe_transfer_id = t["id"]
            po.status = PayoutStatus.SENT
            po.sent_at = _now()
            sent += 1
            db.add(Notification(
                user_id=po.recipient_user_id,
                type=NotificationType.PAYOUT_SENT,
                title=f"Payout sent: ${p.dollars(po.net_cents)}",
                body=f"For booking #{booking.id}",
                link="/payouts",
            ))
        except Exception as e:
            po.status = PayoutStatus.FAILED
            po.error_message = str(e)[:500]

    booking.status = BookingStatus.COMPLETED
    db.commit()
    return {"sent": sent, "skipped": skipped, "total": len(payouts)}


@router.post("/release-payouts/{booking_id}")
def release_payouts(booking_id: int,
                    current_user: User = Depends(get_current_active_user),
                    db: Session = Depends(get_db)):
    """Triggered after event end (manually). Fans out transfers to all
    SCHEDULED payouts. Used by host UI; cron uses /release-payouts/cron."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(404, "Not found")
    venue = db.query(Venue).filter(Venue.id == booking.venue_id).first()
    if (current_user.role != UserRole.ADMIN
            and venue.owner_id != current_user.id):
        raise HTTPException(403, "Only host or admin")
    if _aware(booking.end_datetime) > _now():
        raise HTTPException(400, "Event has not ended yet")

    payment = db.query(Payment).filter(Payment.booking_id == booking.id).first()
    if not payment or payment.status not in (PaymentStatus.CAPTURED,
                                             PaymentStatus.PARTIALLY_REFUNDED):
        raise HTTPException(400, "Payment not captured")

    return _release_for_booking(db, booking)


# ---------------- WEBHOOK ----------------
@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = p.verify_webhook(payload, sig)
    except Exception as e:
        raise HTTPException(400, f"Webhook verification failed: {e}")

    etype = event.get("type") if isinstance(event, dict) else event["type"]
    data = (event.get("data", {}).get("object", {}) if isinstance(event, dict)
            else event["data"]["object"])

    if etype == "payment_intent.succeeded":
        pi_id = data.get("id")
        payment = db.query(Payment).filter(
            Payment.stripe_payment_intent_id == pi_id).first()
        if payment:
            payment.status = PaymentStatus.AUTHORIZED  # capture comes later
            booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
            if booking and booking.status == BookingStatus.AWAITING_PAYMENT:
                booking.status = BookingStatus.PENDING
            db.commit()

    elif etype == "payment_intent.payment_failed":
        pi_id = data.get("id")
        payment = db.query(Payment).filter(
            Payment.stripe_payment_intent_id == pi_id).first()
        if payment:
            payment.status = PaymentStatus.FAILED
            payment.error_message = data.get("last_payment_error", {}).get("message", "")
            db.commit()

    elif etype == "account.updated":
        acct_id = data.get("id")
        sa = db.query(StripeAccount).filter(
            StripeAccount.stripe_account_id == acct_id).first()
        if sa:
            sa.charges_enabled = data.get("charges_enabled", False)
            sa.payouts_enabled = data.get("payouts_enabled", False)
            sa.details_submitted = data.get("details_submitted", False)
            sa.onboarding_complete = sa.details_submitted and sa.payouts_enabled
            sa.requirements = data.get("requirements", {})
            db.commit()

    elif etype == "charge.dispute.created":
        pi_id = data.get("payment_intent")
        payment = db.query(Payment).filter(
            Payment.stripe_payment_intent_id == pi_id).first()
        if payment:
            booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
            if booking:
                booking.status = BookingStatus.DISPUTED
                db.commit()

    elif etype == "charge.refunded":
        pi_id = data.get("payment_intent")
        payment = db.query(Payment).filter(
            Payment.stripe_payment_intent_id == pi_id).first()
        if payment:
            refunded_amt = data.get("amount_refunded", 0)
            payment.refunded_cents = refunded_amt
            payment.refunded_at = _now()
            payment.status = (PaymentStatus.REFUNDED
                              if refunded_amt >= payment.total_charged_cents
                              else PaymentStatus.PARTIALLY_REFUNDED)
            db.commit()

    elif etype == "transfer.created":
        # Reflect the destination + amount on the matching Payout row
        transfer_id = data.get("id")
        meta = data.get("metadata", {}) or {}
        payout_id = meta.get("payout_id")
        if payout_id:
            po = db.query(Payout).filter(Payout.id == int(payout_id)).first()
            if po:
                po.stripe_transfer_id = transfer_id
                po.status = PayoutStatus.SENT
                po.sent_at = _now()
                db.commit()

    elif etype == "transfer.failed" or etype == "transfer.reversed":
        transfer_id = data.get("id")
        po = db.query(Payout).filter(
            Payout.stripe_transfer_id == transfer_id).first()
        if po:
            po.status = (PayoutStatus.FAILED if etype == "transfer.failed"
                         else PayoutStatus.REVERSED)
            po.error_message = data.get("failure_message") or data.get("reversal_reason", "")
            db.commit()
            # Notify recipient + admin
            db.add(Notification(
                user_id=po.recipient_user_id,
                type=NotificationType.SYSTEM,
                title=f"Payout {po.status.value}",
                body=f"Booking #{po.booking_id} payout of ${p.dollars(po.net_cents)} {po.status.value}",
                link="/payouts",
            ))
            db.commit()

    elif etype == "payment_intent.canceled":
        pi_id = data.get("id")
        payment = db.query(Payment).filter(
            Payment.stripe_payment_intent_id == pi_id).first()
        if payment:
            payment.status = PaymentStatus.CANCELED
            db.commit()

    return {"received": True, "type": etype}


# ---------------- DASHBOARD ----------------
@router.get("/my/payouts")
def my_payouts(current_user: User = Depends(get_current_active_user),
               db: Session = Depends(get_db)):
    rows = db.query(Payout).filter(
        Payout.recipient_user_id == current_user.id).order_by(
        Payout.created_at.desc()).all()
    return [{
        "id": po.id,
        "booking_id": po.booking_id,
        "type": po.recipient_type,
        "gross": p.dollars(po.gross_cents),
        "platform_fee": p.dollars(po.platform_fee_cents),
        "net": p.dollars(po.net_cents),
        "status": po.status.value,
        "transfer_id": po.stripe_transfer_id,
        "created_at": po.created_at,
        "sent_at": po.sent_at,
    } for po in rows]


@router.get("/my/payments")
def my_payments(current_user: User = Depends(get_current_active_user),
                db: Session = Depends(get_db)):
    """A renter's payment history."""
    pay_rows = db.query(Payment).join(Booking, Booking.id == Payment.booking_id).filter(
        Booking.renter_id == current_user.id).order_by(
        Payment.created_at.desc()).all()
    return [{
        "id": pay.id,
        "booking_id": pay.booking_id,
        "subtotal": p.dollars(pay.subtotal_cents),
        "stripe_fee": p.dollars(pay.stripe_fee_cents),
        "total": p.dollars(pay.total_charged_cents),
        "refunded": p.dollars(pay.refunded_cents),
        "status": pay.status.value,
        "created_at": pay.created_at,
    } for pay in pay_rows]
