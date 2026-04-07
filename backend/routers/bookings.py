"""Bookings: real checkout flow with locking, mandatory-service injection,
status machine, and policy-driven cancellation. Payment-pending — Stripe slot
left for the final wave.
"""
from datetime import datetime, timezone, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_active_user
from database import get_db
from models import (User, Venue, Booking, BookingService, ServiceProvider,
                    VenueRequirement, BookingStatus, UserRole, Notification,
                    NotificationType)
from schemas import BookingCreate, BookingUpdate, BookingResponse, BookingServiceResponse, BookingServiceCreate

router = APIRouter()

ACTIVE_BLOCKING_STATUSES = (
    BookingStatus.AWAITING_PAYMENT,
    BookingStatus.PENDING,
    BookingStatus.CONFIRMED,
    BookingStatus.IN_PROGRESS,
)


def _now():
    return datetime.now(timezone.utc)


def _aware(dt: datetime) -> datetime:
    """Coerce a possibly-naive DB datetime to UTC-aware for comparison."""
    if dt is None:
        return dt
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def _hours(start: datetime, end: datetime) -> int:
    if end <= start:
        raise HTTPException(400, "End must be after start")
    delta = end - start
    h = delta.total_seconds() / 3600
    return max(1, int(h) if h == int(h) else int(h) + 1)


def _venue_locked(db: Session, venue_id: int, start: datetime, end: datetime,
                  exclude_id: int | None = None) -> bool:
    """Atomic-ish conflict check (true SELECT FOR UPDATE would need explicit txn)."""
    q = db.query(Booking).filter(
        Booking.venue_id == venue_id,
        Booking.status.in_(ACTIVE_BLOCKING_STATUSES),
        Booking.start_datetime < end,
        Booking.end_datetime > start,
    )
    if exclude_id:
        q = q.filter(Booking.id != exclude_id)
    return q.first() is not None


def _notify(db: Session, user_id: int, ntype: NotificationType, title: str,
            body: str = "", link: str = "", payload: dict | None = None):
    db.add(Notification(user_id=user_id, type=ntype, title=title,
                        body=body, link=link, payload=payload or {}))


# ---------------- CHECKOUT ----------------
@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(data: BookingCreate,
                   current_user: User = Depends(get_current_active_user),
                   db: Session = Depends(get_db)):
    venue = db.query(Venue).filter(Venue.id == data.venue_id, Venue.is_active == True).first()
    if not venue:
        raise HTTPException(404, "Venue not found")

    if _aware(data.start_datetime) < _now():
        raise HTTPException(400, "Cannot book in the past")

    if _venue_locked(db, venue.id, data.start_datetime, data.end_datetime):
        raise HTTPException(409, "Venue not available for that time slot")

    total_hours = _hours(data.start_datetime, data.end_datetime)
    if total_hours < venue.minimum_hours:
        raise HTTPException(400, f"Minimum booking duration is {venue.minimum_hours}h")

    venue_cost = total_hours * venue.price_per_hour

    # Mandatory services from venue requirements
    reqs = db.query(VenueRequirement).filter(
        VenueRequirement.venue_id == venue.id,
        VenueRequirement.is_mandatory == True,
    ).all()
    mandatory_ids = {r.service_provider_id for r in reqs}
    booked_ids = {s.service_provider_id for s in data.services}
    missing = mandatory_ids - booked_ids

    # Auto-inject any mandatory services not explicitly chosen
    for req in reqs:
        if req.service_provider_id in missing:
            data.services.append(BookingServiceCreate(
                service_provider_id=req.service_provider_id,
                hours=total_hours, is_mandatory=True,
                notes=f"Auto-added mandatory: {req.service_category.value}",
            ))

    booking = Booking(
        renter_id=current_user.id,
        venue_id=venue.id,
        event_id=data.event_id,
        start_datetime=data.start_datetime,
        end_datetime=data.end_datetime,
        total_hours=total_hours,
        venue_cost=venue_cost,
        service_cost=0.0,
        total_cost=venue_cost,
        status=BookingStatus.AWAITING_PAYMENT,
        special_requests=data.special_requests,
    )
    db.add(booking); db.flush()

    service_cost = 0.0
    for s in data.services:
        sp = db.query(ServiceProvider).filter(ServiceProvider.id == s.service_provider_id).first()
        if not sp:
            raise HTTPException(404, f"Service provider {s.service_provider_id} not found")
        hours = s.hours or total_hours
        cost = hours * sp.hourly_rate
        service_cost += cost
        db.add(BookingService(
            booking_id=booking.id, service_provider_id=sp.id,
            hours=hours, cost=cost,
            is_mandatory=(sp.id in mandatory_ids),
            status="pending", notes=s.notes,
        ))

    booking.service_cost = service_cost
    booking.total_cost = venue_cost + service_cost

    # Notifications
    _notify(db, venue.owner_id, NotificationType.BOOKING_CREATED,
            f"New booking request for {venue.title}",
            f"{current_user.first_name} requested {total_hours}h on {data.start_datetime:%Y-%m-%d %H:%M}",
            link=f"/host/bookings/{booking.id}",
            payload={"booking_id": booking.id})

    db.commit(); db.refresh(booking)
    return booking


# ---------------- LIST / DETAIL ----------------
@router.get("/", response_model=List[BookingResponse])
def my_bookings(current_user: User = Depends(get_current_active_user),
                db: Session = Depends(get_db)):
    return db.query(Booking).filter(Booking.renter_id == current_user.id).order_by(
        Booking.start_datetime.desc()).all()


@router.get("/host", response_model=List[BookingResponse])
def host_bookings(current_user: User = Depends(get_current_active_user),
                  db: Session = Depends(get_db)):
    if current_user.role != UserRole.VENUE_OWNER:
        raise HTTPException(403, "Venue owners only")
    venue_ids = [v.id for v in db.query(Venue).filter(Venue.owner_id == current_user.id).all()]
    return db.query(Booking).filter(Booking.venue_id.in_(venue_ids)).order_by(
        Booking.start_datetime.desc()).all()


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(booking_id: int,
                current_user: User = Depends(get_current_active_user),
                db: Session = Depends(get_db)):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(404, "Booking not found")
    venue = db.query(Venue).filter(Venue.id == b.venue_id).first()
    if b.renter_id != current_user.id and venue.owner_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(403, "Not authorized")
    return b


# ---------------- STATE TRANSITIONS ----------------
@router.post("/{booking_id}/confirm")
def confirm_booking(booking_id: int,
                    current_user: User = Depends(get_current_active_user),
                    db: Session = Depends(get_db)):
    """Host accepts the booking. If a payment has been authorized for this
    booking, also captures it via Stripe (or sim)."""
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(404, "Booking not found")
    venue = db.query(Venue).filter(Venue.id == b.venue_id).first()
    if venue.owner_id != current_user.id:
        raise HTTPException(403, "Only the host can confirm")
    if b.status not in (BookingStatus.AWAITING_PAYMENT, BookingStatus.PENDING):
        raise HTTPException(400, f"Cannot confirm from status {b.status.value}")

    # If there's an authorized payment, capture it now
    from models import Payment, PaymentStatus, Payout, PayoutStatus
    from services import payments as p_svc
    payment = db.query(Payment).filter(Payment.booking_id == b.id).first()
    if payment and payment.status == PaymentStatus.AUTHORIZED:
        result = p_svc.capture_payment_intent(payment.stripe_payment_intent_id)
        payment.status = PaymentStatus.CAPTURED
        payment.captured_at = datetime.now(timezone.utc)
        payment.stripe_charge_id = result.get("charge_id")
        db.query(Payout).filter(Payout.payment_id == payment.id).update(
            {Payout.status: PayoutStatus.SCHEDULED})

    b.status = BookingStatus.CONFIRMED
    _notify(db, b.renter_id, NotificationType.BOOKING_CONFIRMED,
            f"Your booking at {venue.title} is confirmed",
            link=f"/bookings/{b.id}", payload={"booking_id": b.id})
    db.commit()
    return {"ok": True, "status": b.status.value}


@router.post("/{booking_id}/cancel")
def cancel_booking(booking_id: int,
                   current_user: User = Depends(get_current_active_user),
                   db: Session = Depends(get_db)):
    """Cancel — applies a simple flexible policy:
       - >7 days out: full refund eligible
       - 1-7 days:    50% refund eligible
       - <1 day:      no refund
       (Refund execution belongs to Stripe wave.)
    """
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(404, "Booking not found")
    venue = db.query(Venue).filter(Venue.id == b.venue_id).first()
    if b.renter_id != current_user.id and venue.owner_id != current_user.id:
        raise HTTPException(403, "Not authorized")
    if b.status in (BookingStatus.CANCELLED, BookingStatus.COMPLETED, BookingStatus.REFUNDED):
        raise HTTPException(400, "Already finalized")

    delta = _aware(b.start_datetime) - _now()
    if delta > timedelta(days=7):
        refund_pct = 100
    elif delta > timedelta(days=1):
        refund_pct = 50
    else:
        refund_pct = 0

    # If there's a captured/authorized payment, issue the refund now
    from models import Payment, PaymentStatus, Payout, PayoutStatus
    from services import payments as p_svc
    payment = db.query(Payment).filter(Payment.booking_id == b.id).first()
    refund_amount = 0
    if payment and payment.status in (PaymentStatus.AUTHORIZED, PaymentStatus.CAPTURED) and refund_pct > 0:
        refund_amount = int(round(payment.total_charged_cents * refund_pct / 100))
        try:
            p_svc.refund_payment(
                payment.stripe_payment_intent_id,
                amount_cents=refund_amount, reason="cancellation",
            )
            payment.refunded_cents += refund_amount
            payment.refunded_at = _now()
            payment.status = (PaymentStatus.REFUNDED if refund_amount == payment.total_charged_cents
                              else PaymentStatus.PARTIALLY_REFUNDED)
            payment.refund_reason = f"cancellation {refund_pct}%"
            for po in db.query(Payout).filter(Payout.payment_id == payment.id).all():
                if po.status in (PayoutStatus.PENDING, PayoutStatus.SCHEDULED):
                    # Not sent yet → just adjust the row
                    if refund_pct == 100:
                        po.status = PayoutStatus.REVERSED
                    else:
                        po.gross_cents = int(round(po.gross_cents * (100 - refund_pct) / 100))
                        po.platform_fee_cents = int(round(po.gross_cents * p_svc.PLATFORM_FEE_PCT))
                        po.net_cents = po.gross_cents - po.platform_fee_cents
                elif po.status == PayoutStatus.SENT and po.stripe_transfer_id:
                    # Money already left for the connected account — claw it
                    # back via Stripe Transfer reversal.
                    clawback = po.net_cents if refund_pct == 100 else int(
                        round(po.net_cents * refund_pct / 100))
                    try:
                        p_svc.reverse_transfer(
                            po.stripe_transfer_id,
                            amount_cents=clawback,
                            idempotency_key=f"reverse_payout_{po.id}_pct{refund_pct}",
                        )
                        if refund_pct == 100:
                            po.status = PayoutStatus.REVERSED
                            po.error_message = "reversed due to renter cancellation"
                        else:
                            po.net_cents = po.net_cents - clawback
                            po.gross_cents = int(round(po.gross_cents * (100 - refund_pct) / 100))
                            po.error_message = f"partially reversed ({refund_pct}%)"
                    except Exception as e:
                        # Reversal can fail if the connected account has
                        # insufficient balance — flag it for admin.
                        po.error_message = f"reversal failed: {e}"[:500]
                        print(f"[refund] transfer reversal failed for payout {po.id}: {e}")
        except Exception as e:
            print(f"[refund] error: {e}")

    b.status = (BookingStatus.REFUNDED if refund_pct == 100 and payment
                else BookingStatus.CANCELLED)
    other = b.renter_id if current_user.id != b.renter_id else venue.owner_id
    _notify(db, other, NotificationType.BOOKING_CANCELLED,
            f"Booking at {venue.title} cancelled",
            f"Refund: {refund_pct}% (${refund_amount/100:.2f})",
            link=f"/bookings/{b.id}", payload={"booking_id": b.id, "refund_pct": refund_pct})
    db.commit()
    return {"ok": True, "refund_pct": refund_pct, "refund_amount": refund_amount / 100}


@router.post("/{booking_id}/complete")
def complete_booking(booking_id: int,
                     current_user: User = Depends(get_current_active_user),
                     db: Session = Depends(get_db)):
    """Mark booking complete after the event end time has passed."""
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(404, "Booking not found")
    venue = db.query(Venue).filter(Venue.id == b.venue_id).first()
    if venue.owner_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(403, "Only host or admin")
    if _aware(b.end_datetime) > _now():
        raise HTTPException(400, "Event has not ended yet")
    b.status = BookingStatus.COMPLETED
    _notify(db, b.renter_id, NotificationType.REVIEW_REQUEST,
            f"How was {venue.title}?",
            "Leave a review for the venue and any services.",
            link=f"/bookings/{b.id}/review", payload={"booking_id": b.id})
    db.commit()
    return {"ok": True}
