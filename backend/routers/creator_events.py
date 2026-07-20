"""Creator Events router — the "influencer plugin".

Ticketed gatherings on top of the existing venue+services booking + Stripe
Connect rails. Revenue-funded model: creators sell tickets first, costs are
paid from ticket revenue at settlement, a deposit hold covers shortfalls.

Endpoints
  Creator (role=creator/admin):
    POST   /                      create draft event (+ tiers)
    PUT    /{id}                  edit draft
    POST   /{id}/tiers            replace tiers (draft)
    POST   /{id}/deposit/hold     authorize the no-show deposit
    POST   /{id}/publish          go live
    POST   /{id}/cancel           cancel + refund buyers
    POST   /{id}/settle           settle after event end (also via cron)
    GET    /mine                  creator dashboard
    GET    /{id}                  creator detail + sales
    GET    /{id}/attendees        roster
    POST   /tickets/{tid}/check-in
  Public / buyer (signup required to buy):
    GET    /public/{slug}         public event page payload
    POST   /public/{slug}/purchase   reserve + PaymentIntent
    POST   /tickets/{tid}/confirm     sim-mode finalize (real Stripe -> webhook)
  Webhook:
    POST   /webhook               ticket PaymentIntent events
"""
import os
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from auth import get_current_active_user
from database import get_db
from models import (User, UserRole, Venue, Booking, BookingService,
                    ServiceProvider, BookingStatus, StripeAccount,
                    PaymentStatus, PayoutStatus,
                    Notification, NotificationType)
from models_creator import (CreatorEvent, CreatorEventStatus, EventVisibility,
                            SettlementStatus, FundingModel, TicketTier, Ticket,
                            TicketStatus, EventDeposit, DepositStatus,
                            EventPayout)
from schemas_creator import (CreatorEventCreate, CreatorEventUpdate,
                             TierInput, PurchaseInput)
from services import payments as p
from services import creator_events as ce
from services import email as email_svc
from config import is_free_mode

router = APIRouter()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
RESERVATION_TTL_MIN = 15


def _now():
    return datetime.now(timezone.utc)


def _aware(dt):
    if dt is None:
        return dt
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def _require_creator(user: User):
    if user.role not in (UserRole.CREATOR, UserRole.ADMIN):
        raise HTTPException(403, "Only creators can manage events")


def _ensure_stripe_customer(db: Session, user: User) -> str:
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


def _cost_line_items(db: Session, booking: Booking) -> list[dict]:
    """Venue owner + each provider, at full quoted cost (no double platform
    fee — the platform fee is taken on ticket sales)."""
    if not booking:
        return []
    venue = db.query(Venue).filter(Venue.id == booking.venue_id).first()
    lines = [{
        "recipient_user_id": venue.owner_id,
        "recipient_type": "host",
        "venue_id": venue.id,
        "booking_service_id": None,
        "gross_cents": p.cents(booking.venue_cost),
        "label": f"Venue: {venue.title}",
    }]
    for bs in db.query(BookingService).filter(BookingService.booking_id == booking.id).all():
        sp = db.query(ServiceProvider).filter(ServiceProvider.id == bs.service_provider_id).first()
        if not sp:
            continue
        lines.append({
            "recipient_user_id": sp.user_id,
            "recipient_type": "provider",
            "venue_id": None,
            "booking_service_id": bs.id,
            "gross_cents": p.cents(bs.cost),
            "label": f"{sp.service_category.value.title()}: {sp.service_name}",
        })
    return lines


def _serialize_event(db: Session, ev: CreatorEvent, include_sales=False) -> dict:
    tiers = db.query(TicketTier).filter(TicketTier.creator_event_id == ev.id).all()
    out = {
        "id": ev.id,
        "slug": ev.slug,
        "title": ev.title,
        "description": ev.description,
        "cover_image": ev.cover_image,
        "start_datetime": ev.start_datetime,
        "end_datetime": ev.end_datetime,
        "capacity": ev.capacity,
        "status": ev.status.value,
        "visibility": ev.visibility.value,
        "funding_model": ev.funding_model.value,
        "settlement_status": ev.settlement_status.value,
        "booking_id": ev.booking_id,
        "tiers": [{
            "id": t.id, "name": t.name, "price": p.dollars(t.price_cents),
            "price_cents": t.price_cents, "quantity": t.quantity,
            "sold": t.sold, "available": max(0, t.quantity - t.sold),
            "max_per_buyer": t.max_per_buyer,
            "sales_end_datetime": t.sales_end_datetime,
        } for t in tiers],
    }
    if include_sales:
        paid = db.query(Ticket).filter(
            Ticket.creator_event_id == ev.id,
            Ticket.status.in_([TicketStatus.PAID, TicketStatus.CHECKED_IN]),
        ).all()
        gross = sum(t.amount_cents for t in paid)
        out["sales"] = {
            "tickets_sold": sum(t.quantity for t in paid),
            "gross_revenue": p.dollars(gross),
            "platform_fee": p.dollars(int(round(gross * ce.PLATFORM_FEE_PCT))),
        }
    return out


# ============================ CREATOR: CRUD ============================
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_event(data: CreatorEventCreate,
                 current_user: User = Depends(get_current_active_user),
                 db: Session = Depends(get_db)):
    _require_creator(current_user)
    if _aware(data.end_datetime) <= _aware(data.start_datetime):
        raise HTTPException(400, "end_datetime must be after start_datetime")
    if _aware(data.start_datetime) < _now():
        raise HTTPException(400, "Cannot create an event in the past")

    booking = None
    if data.booking_id:
        booking = db.query(Booking).filter(Booking.id == data.booking_id).first()
        if not booking:
            raise HTTPException(404, "Linked booking not found")
        if booking.renter_id != current_user.id:
            raise HTTPException(403, "That booking isn't yours")

    capacity = data.capacity or sum(t.quantity for t in data.tiers)
    ev = CreatorEvent(
        creator_id=current_user.id,
        booking_id=data.booking_id,
        slug=ce.slugify(data.title),
        title=data.title,
        description=data.description,
        cover_image=data.cover_image,
        start_datetime=data.start_datetime,
        end_datetime=data.end_datetime,
        capacity=capacity,
        funding_model=FundingModel.REVENUE_FUNDED,
        status=CreatorEventStatus.DRAFT,
        visibility=(EventVisibility.UNLISTED if data.visibility == "unlisted"
                    else EventVisibility.PUBLIC),
    )
    db.add(ev); db.flush()
    for t in data.tiers:
        db.add(TicketTier(
            creator_event_id=ev.id, name=t.name, price_cents=t.price_cents,
            quantity=t.quantity, max_per_buyer=t.max_per_buyer,
            sales_end_datetime=t.sales_end_datetime,
        ))
    db.commit(); db.refresh(ev)
    return _serialize_event(db, ev)


@router.put("/{event_id}")
def update_event(event_id: int, data: CreatorEventUpdate,
                 current_user: User = Depends(get_current_active_user),
                 db: Session = Depends(get_db)):
    ev = db.query(CreatorEvent).filter(CreatorEvent.id == event_id).first()
    if not ev:
        raise HTTPException(404, "Event not found")
    if ev.creator_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(403, "Not your event")
    if ev.status != CreatorEventStatus.DRAFT:
        raise HTTPException(400, "Only draft events can be edited")
    for field in ("title", "description", "cover_image", "start_datetime",
                  "end_datetime", "capacity"):
        val = getattr(data, field)
        if val is not None:
            setattr(ev, field, val)
    if data.visibility:
        ev.visibility = (EventVisibility.UNLISTED if data.visibility == "unlisted"
                         else EventVisibility.PUBLIC)
    db.commit(); db.refresh(ev)
    return _serialize_event(db, ev)


@router.post("/{event_id}/tiers")
def set_tiers(event_id: int, tiers: list[TierInput],
              current_user: User = Depends(get_current_active_user),
              db: Session = Depends(get_db)):
    ev = db.query(CreatorEvent).filter(CreatorEvent.id == event_id).first()
    if not ev:
        raise HTTPException(404, "Event not found")
    if ev.creator_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(403, "Not your event")
    if ev.status != CreatorEventStatus.DRAFT:
        raise HTTPException(400, "Tiers can only be changed on a draft event")
    db.query(TicketTier).filter(TicketTier.creator_event_id == ev.id).delete()
    for t in tiers:
        db.add(TicketTier(
            creator_event_id=ev.id, name=t.name, price_cents=t.price_cents,
            quantity=t.quantity, max_per_buyer=t.max_per_buyer,
            sales_end_datetime=t.sales_end_datetime,
        ))
    ev.capacity = ev.capacity or sum(t.quantity for t in tiers)
    db.commit(); db.refresh(ev)
    return _serialize_event(db, ev)


# ============================ DEPOSIT ============================
@router.post("/{event_id}/deposit/hold")
def hold_deposit(event_id: int,
                 current_user: User = Depends(get_current_active_user),
                 db: Session = Depends(get_db)):
    ev = db.query(CreatorEvent).filter(CreatorEvent.id == event_id).first()
    if not ev:
        raise HTTPException(404, "Event not found")
    if ev.creator_id != current_user.id:
        raise HTTPException(403, "Not your event")
    booking = db.query(Booking).filter(Booking.id == ev.booking_id).first() if ev.booking_id else None
    amount = ce.suggested_deposit_cents(_cost_line_items(db, booking))
    if amount <= 0:
        return {"ok": True, "amount": 0, "note": "No costs to cover — deposit not required"}

    existing = db.query(EventDeposit).filter(EventDeposit.creator_event_id == ev.id).first()
    if existing and existing.status == DepositStatus.HELD:
        return {"ok": True, "amount": p.dollars(existing.amount_cents),
                "status": existing.status.value, "payment_intent_id": existing.stripe_payment_intent_id}

    customer_id = _ensure_stripe_customer(db, current_user)
    intent = p.create_payment_intent(
        amount_cents=amount, customer_email=current_user.email,
        metadata={"kind": "event_deposit", "creator_event_id": str(ev.id)},
        customer_id=customer_id, idempotency_key=f"deposit_event_{ev.id}",
    )
    dep = EventDeposit(
        creator_event_id=ev.id, payer_user_id=current_user.id,
        amount_cents=amount, stripe_payment_intent_id=intent["id"],
        status=DepositStatus.HELD,
    )
    db.add(dep); db.commit()
    return {"ok": True, "amount": p.dollars(amount),
            "client_secret": intent["client_secret"],
            "payment_intent_id": intent["id"], "status": "held"}


# ============================ PUBLISH ============================
@router.post("/{event_id}/publish")
def publish_event(event_id: int,
                  current_user: User = Depends(get_current_active_user),
                  db: Session = Depends(get_db)):
    ev = db.query(CreatorEvent).filter(CreatorEvent.id == event_id).first()
    if not ev:
        raise HTTPException(404, "Event not found")
    if ev.creator_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(403, "Not your event")
    if ev.status not in (CreatorEventStatus.DRAFT,):
        raise HTTPException(400, f"Cannot publish from {ev.status.value}")

    tiers = db.query(TicketTier).filter(TicketTier.creator_event_id == ev.id).all()
    if not tiers:
        raise HTTPException(400, "Add at least one ticket tier before publishing")

    # Creator must be able to receive payouts — except in FREE MODE, where no
    # money moves, so no Stripe payout account is required to go live.
    if not is_free_mode():
        sa = db.query(StripeAccount).filter(StripeAccount.user_id == current_user.id).first()
        if not sa or not sa.payouts_enabled:
            raise HTTPException(400, "Connect a payout-enabled Stripe account first "
                                     "(POST /api/payments/onboarding-link)")

    # Revenue-funded events with real costs need the deposit held
    booking = db.query(Booking).filter(Booking.id == ev.booking_id).first() if ev.booking_id else None
    costs = ce.suggested_deposit_cents(_cost_line_items(db, booking))
    if ev.funding_model == FundingModel.REVENUE_FUNDED and costs > 0:
        dep = db.query(EventDeposit).filter(
            EventDeposit.creator_event_id == ev.id,
            EventDeposit.status == DepositStatus.HELD).first()
        if not dep:
            raise HTTPException(400, "Place the no-show deposit before publishing "
                                     "(POST /{id}/deposit/hold)")

    ev.status = CreatorEventStatus.PUBLISHED
    db.commit(); db.refresh(ev)
    return {"ok": True, "status": ev.status.value,
            "public_url": f"{FRONTEND_URL}/e/{ev.slug}"}


# ============================ DASHBOARD ============================
@router.get("/mine")
def my_events(current_user: User = Depends(get_current_active_user),
              db: Session = Depends(get_db)):
    _require_creator(current_user)
    evs = db.query(CreatorEvent).filter(
        CreatorEvent.creator_id == current_user.id).order_by(
        CreatorEvent.start_datetime.desc()).all()
    return [_serialize_event(db, e, include_sales=True) for e in evs]


@router.get("/{event_id}")
def get_event(event_id: int,
              current_user: User = Depends(get_current_active_user),
              db: Session = Depends(get_db)):
    ev = db.query(CreatorEvent).filter(CreatorEvent.id == event_id).first()
    if not ev:
        raise HTTPException(404, "Event not found")
    if ev.creator_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(403, "Not your event")
    return _serialize_event(db, ev, include_sales=True)


@router.get("/{event_id}/attendees")
def attendees(event_id: int,
              current_user: User = Depends(get_current_active_user),
              db: Session = Depends(get_db)):
    ev = db.query(CreatorEvent).filter(CreatorEvent.id == event_id).first()
    if not ev:
        raise HTTPException(404, "Event not found")
    if ev.creator_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(403, "Not your event")
    rows = db.query(Ticket).filter(
        Ticket.creator_event_id == ev.id,
        Ticket.status.in_([TicketStatus.PAID, TicketStatus.CHECKED_IN])).all()
    return [{
        "ticket_id": t.id, "buyer_name": t.buyer_name, "buyer_email": t.buyer_email,
        "quantity": t.quantity, "status": t.status.value,
        "qr_code": t.qr_code, "checked_in_at": t.checked_in_at,
    } for t in rows]


# ============================ PUBLIC PAGE ============================
@router.get("/public/{slug}")
def public_event(slug: str, db: Session = Depends(get_db)):
    ev = db.query(CreatorEvent).filter(CreatorEvent.slug == slug).first()
    if not ev or ev.status not in (CreatorEventStatus.PUBLISHED,
                                   CreatorEventStatus.SOLD_OUT):
        raise HTTPException(404, "Event not found")
    creator = db.query(User).filter(User.id == ev.creator_id).first()
    venue = None
    if ev.booking_id:
        b = db.query(Booking).filter(Booking.id == ev.booking_id).first()
        if b:
            venue = db.query(Venue).filter(Venue.id == b.venue_id).first()
    data = _serialize_event(db, ev)
    data["creator"] = {"name": f"{creator.first_name} {creator.last_name}".strip(),
                       "bio": creator.bio, "image": creator.profile_image} if creator else None
    data["venue"] = ({"title": venue.title, "city": venue.city, "state": venue.state}
                     if venue else None)
    return data


@router.post("/public/{slug}/purchase")
def purchase(slug: str, data: PurchaseInput,
             current_user: User = Depends(get_current_active_user),
             db: Session = Depends(get_db)):
    """Reserve tickets + create a PaymentIntent. Signup required (uses the
    logged-in user as the buyer)."""
    ev = db.query(CreatorEvent).filter(CreatorEvent.slug == slug).first()
    if not ev or ev.status != CreatorEventStatus.PUBLISHED:
        raise HTTPException(404, "Event not available")
    tier = db.query(TicketTier).filter(
        TicketTier.id == data.tier_id,
        TicketTier.creator_event_id == ev.id).first()
    if not tier or not tier.is_active:
        raise HTTPException(404, "Ticket tier not found")
    if tier.sales_end_datetime and _aware(tier.sales_end_datetime) < _now():
        raise HTTPException(400, "Sales for this tier have ended")
    if data.quantity > tier.max_per_buyer:
        raise HTTPException(400, f"Max {tier.max_per_buyer} tickets per buyer")
    if not ce.can_reserve(tier.quantity, tier.sold, data.quantity):
        raise HTTPException(409, "Not enough tickets left")

    bd = ce.ticket_breakdown(tier.price_cents, data.quantity)

    # Free RSVP tier — no payment
    if bd["total_charged_cents"] == 0:
        tier.sold += data.quantity
        ticket = Ticket(
            tier_id=tier.id, creator_event_id=ev.id,
            buyer_user_id=current_user.id, buyer_email=current_user.email,
            buyer_name=f"{current_user.first_name} {current_user.last_name}".strip(),
            quantity=data.quantity, amount_cents=0, platform_fee_cents=0,
            stripe_fee_cents=0, total_charged_cents=0,
            status=TicketStatus.PAID, qr_code=ce.gen_qr_token(),
        )
        db.add(ticket)
        _maybe_sold_out(db, ev)
        db.commit(); db.refresh(ticket)
        return {"ok": True, "free": True, "ticket_id": ticket.id,
                "qr_code": ticket.qr_code}

    customer_id = _ensure_stripe_customer(db, current_user)
    # Tickets capture immediately (automatic), unlike bookings
    intent = p.create_payment_intent(
        amount_cents=bd["total_charged_cents"], customer_email=current_user.email,
        metadata={"kind": "ticket", "creator_event_id": str(ev.id),
                  "tier_id": str(tier.id), "buyer_id": str(current_user.id),
                  "quantity": str(data.quantity)},
        customer_id=customer_id,
        idempotency_key=f"ticket_pi_{ev.id}_{tier.id}_{current_user.id}_{_now().timestamp()}",
    )

    # Reserve inventory now; released if the PI fails or expires
    tier.sold += data.quantity
    ticket = Ticket(
        tier_id=tier.id, creator_event_id=ev.id,
        buyer_user_id=current_user.id, buyer_email=current_user.email,
        buyer_name=f"{current_user.first_name} {current_user.last_name}".strip(),
        quantity=data.quantity, amount_cents=bd["subtotal_cents"],
        platform_fee_cents=bd["platform_fee_cents"],
        stripe_fee_cents=bd["stripe_fee_cents"],
        total_charged_cents=bd["total_charged_cents"],
        stripe_payment_intent_id=intent["id"],
        payment_status=PaymentStatus.PENDING,
        status=TicketStatus.RESERVED,
        qr_code=ce.gen_qr_token(),
        reserved_until=_now() + timedelta(minutes=RESERVATION_TTL_MIN),
    )
    db.add(ticket)
    db.commit(); db.refresh(ticket)
    return {
        "ok": True, "ticket_id": ticket.id,
        "payment_intent_id": intent["id"], "client_secret": intent["client_secret"],
        "subtotal": p.dollars(bd["subtotal_cents"]),
        "processing_fee": p.dollars(bd["stripe_fee_cents"]),
        "total": p.dollars(bd["total_charged_cents"]),
    }


def _maybe_sold_out(db: Session, ev: CreatorEvent):
    tiers = db.query(TicketTier).filter(TicketTier.creator_event_id == ev.id).all()
    if tiers and all(t.sold >= t.quantity for t in tiers):
        ev.status = CreatorEventStatus.SOLD_OUT


@router.post("/tickets/{ticket_id}/confirm")
def sim_confirm_ticket(ticket_id: int,
                       current_user: User = Depends(get_current_active_user),
                       db: Session = Depends(get_db)):
    """Sim-mode only: finalize a ticket purchase (skips Stripe Elements).
    With real Stripe configured this is disabled — the webhook finalizes."""
    if os.getenv("STRIPE_SECRET_KEY"):
        raise HTTPException(400, "Disabled when real Stripe is configured; use webhook")
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(404, "Ticket not found")
    if ticket.buyer_user_id != current_user.id:
        raise HTTPException(403, "Not your ticket")
    if ticket.status != TicketStatus.RESERVED:
        return {"ok": True, "status": ticket.status.value}
    if ticket.stripe_payment_intent_id:
        p.simulate_payment_success(ticket.stripe_payment_intent_id)
        p.capture_payment_intent(ticket.stripe_payment_intent_id)
        ticket.payment_status = PaymentStatus.CAPTURED
    ticket.status = TicketStatus.PAID
    ev = db.query(CreatorEvent).filter(CreatorEvent.id == ticket.creator_event_id).first()
    _maybe_sold_out(db, ev)
    db.add(Notification(
        user_id=ev.creator_id, type=NotificationType.SYSTEM,
        title="Ticket sold", body=f"{ticket.buyer_name} bought {ticket.quantity} ticket(s)",
        link=f"/creator/events/{ev.id}"))
    db.commit()
    return {"ok": True, "status": ticket.status.value, "qr_code": ticket.qr_code}


@router.post("/tickets/{ticket_id}/check-in")
def check_in(ticket_id: int,
             current_user: User = Depends(get_current_active_user),
             db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(404, "Ticket not found")
    ev = db.query(CreatorEvent).filter(CreatorEvent.id == ticket.creator_event_id).first()
    if ev.creator_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(403, "Only the creator can check in guests")
    if ticket.status not in (TicketStatus.PAID, TicketStatus.CHECKED_IN):
        raise HTTPException(400, f"Ticket is {ticket.status.value}")
    ticket.status = TicketStatus.CHECKED_IN
    ticket.checked_in_at = _now()
    db.commit()
    return {"ok": True, "status": ticket.status.value}


# ============================ SETTLEMENT ============================
def _settle_event(db: Session, ev: CreatorEvent) -> dict:
    booking = db.query(Booking).filter(Booking.id == ev.booking_id).first() if ev.booking_id else None
    cost_lines = _cost_line_items(db, booking)

    paid = db.query(Ticket).filter(
        Ticket.creator_event_id == ev.id,
        Ticket.status.in_([TicketStatus.PAID, TicketStatus.CHECKED_IN])).all()
    subtotal = sum(t.amount_cents for t in paid)

    plan = ce.compute_settlement(subtotal, cost_lines)

    sent = 0
    # 1) Cost payouts (venue + providers) at full cost
    for li in plan["cost_payouts"]:
        po = EventPayout(
            creator_event_id=ev.id,
            recipient_user_id=li["recipient_user_id"],
            recipient_type=li["recipient_type"],
            booking_service_id=li["booking_service_id"], venue_id=li["venue_id"],
            gross_cents=li["gross_cents"], platform_fee_cents=0,
            net_cents=li["net_cents"], status=PayoutStatus.SCHEDULED,
        )
        db.add(po); db.flush()
        sent += _transfer(db, po, ev)

    # 2) Creator payout (the remainder)
    if plan["creator_net_cents"] > 0:
        po = EventPayout(
            creator_event_id=ev.id,
            recipient_user_id=ev.creator_id, recipient_type="creator",
            booking_service_id=None, venue_id=None,
            gross_cents=plan["creator_pool_cents"],
            platform_fee_cents=plan["platform_fee_cents"],
            net_cents=plan["creator_net_cents"], status=PayoutStatus.SCHEDULED,
        )
        db.add(po); db.flush()
        sent += _transfer(db, po, ev)

    # 3) Resolve the deposit
    dep = db.query(EventDeposit).filter(EventDeposit.creator_event_id == ev.id).first()
    if dep and dep.status == DepositStatus.HELD:
        if plan["deposit_shortfall_cents"] > 0:
            capture = min(dep.amount_cents, plan["deposit_shortfall_cents"])
            p.capture_payment_intent(dep.stripe_payment_intent_id)
            dep.captured_cents = capture
            dep.status = DepositStatus.CAPTURED
        else:
            # Release the hold (sim: cancel intent if supported, else mark)
            try:
                if not os.getenv("STRIPE_SECRET_KEY"):
                    pass
                else:
                    import stripe
                    stripe.api_key = os.environ["STRIPE_SECRET_KEY"]
                    stripe.PaymentIntent.cancel(dep.stripe_payment_intent_id)
            except Exception:
                pass
            dep.status = DepositStatus.RELEASED
        dep.resolved_at = _now()

    ev.status = CreatorEventStatus.COMPLETED
    ev.settlement_status = (SettlementStatus.SETTLED if plan["fully_funded"]
                            or (dep and dep.status == DepositStatus.CAPTURED)
                            else SettlementStatus.FAILED)
    db.add(Notification(
        user_id=ev.creator_id, type=NotificationType.PAYOUT_SENT,
        title=f"Event settled: {ev.title}",
        body=f"You netted ${p.dollars(plan['creator_net_cents'])} "
             f"from ${p.dollars(plan['ticket_subtotal_cents'])} in ticket sales.",
        link=f"/creator/events/{ev.id}"))
    db.commit()
    return {"event_id": ev.id, "transfers_sent": sent, **{
        k: plan[k] for k in ("ticket_subtotal_cents", "platform_fee_cents",
                             "creator_net_cents", "deposit_shortfall_cents",
                             "fully_funded")}}


def _transfer(db: Session, po: EventPayout, ev: CreatorEvent) -> int:
    sa = db.query(StripeAccount).filter(
        StripeAccount.user_id == po.recipient_user_id).first()
    if not sa or not sa.payouts_enabled:
        po.status = PayoutStatus.PENDING
        po.error_message = "recipient has no payout-enabled Stripe account"
        return 0
    if po.net_cents <= 0:
        po.status = PayoutStatus.SKIPPED
        return 0
    try:
        t = p.create_transfer(
            amount_cents=po.net_cents, destination_account_id=sa.stripe_account_id,
            transfer_group=f"creator_event_{ev.id}",
            metadata={"creator_event_id": str(ev.id), "payout_id": str(po.id),
                      "recipient_type": po.recipient_type},
            idempotency_key=f"transfer_event_payout_{po.id}")
        po.stripe_transfer_id = t["id"]
        po.status = PayoutStatus.SENT
        po.sent_at = _now()
        db.add(Notification(
            user_id=po.recipient_user_id, type=NotificationType.PAYOUT_SENT,
            title=f"Payout sent: ${p.dollars(po.net_cents)}",
            body=f"For creator event #{ev.id}", link="/payouts"))
        return 1
    except Exception as e:
        po.status = PayoutStatus.FAILED
        po.error_message = str(e)[:500]
        return 0


@router.post("/{event_id}/settle")
def settle_event(event_id: int,
                 current_user: User = Depends(get_current_active_user),
                 db: Session = Depends(get_db)):
    ev = db.query(CreatorEvent).filter(CreatorEvent.id == event_id).first()
    if not ev:
        raise HTTPException(404, "Event not found")
    if ev.creator_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(403, "Only the creator or admin can settle")
    if ev.settlement_status == SettlementStatus.SETTLED:
        raise HTTPException(400, "Already settled")
    if _aware(ev.end_datetime) > _now():
        raise HTTPException(400, "Event has not ended yet")
    return _settle_event(db, ev)


@router.post("/settle/cron")
def settle_cron(request: Request, db: Session = Depends(get_db)):
    expected = os.getenv("CRON_SECRET")
    if expected:
        if request.headers.get("authorization", "") != f"Bearer {expected}":
            raise HTTPException(401, "Invalid cron secret")
    cutoff = _now() - timedelta(hours=24)
    evs = db.query(CreatorEvent).filter(
        CreatorEvent.status == CreatorEventStatus.PUBLISHED,
        CreatorEvent.end_datetime < cutoff,
        CreatorEvent.settlement_status == SettlementStatus.PENDING).all()
    return {"checked": len(evs),
            "events": [_settle_event(db, e) for e in evs]}


# ============================ CANCEL ============================
@router.post("/{event_id}/cancel")
def cancel_event(event_id: int,
                 current_user: User = Depends(get_current_active_user),
                 db: Session = Depends(get_db)):
    ev = db.query(CreatorEvent).filter(CreatorEvent.id == event_id).first()
    if not ev:
        raise HTTPException(404, "Event not found")
    if ev.creator_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(403, "Not your event")
    if ev.status in (CreatorEventStatus.COMPLETED, CreatorEventStatus.CANCELLED):
        raise HTTPException(400, "Already finalized")

    refunded = 0
    paid = db.query(Ticket).filter(
        Ticket.creator_event_id == ev.id,
        Ticket.status.in_([TicketStatus.PAID, TicketStatus.CHECKED_IN])).all()
    for t in paid:
        if t.stripe_payment_intent_id and t.payment_status in (
                PaymentStatus.CAPTURED, PaymentStatus.AUTHORIZED):
            try:
                p.refund_payment(t.stripe_payment_intent_id,
                                 amount_cents=t.total_charged_cents,
                                 reason="event_cancelled",
                                 idempotency_key=f"refund_ticket_{t.id}")
                t.payment_status = PaymentStatus.REFUNDED
                refunded += 1
            except Exception:
                pass
        t.status = TicketStatus.REFUNDED
        db.add(Notification(
            user_id=t.buyer_user_id, type=NotificationType.SYSTEM,
            title=f"Event cancelled: {ev.title}",
            body="Your ticket has been refunded.", link="/tickets"))

    # Release the deposit (creator-initiated cancel before event keeps it; we
    # release here since no costs were incurred. Policy can tighten later.)
    dep = db.query(EventDeposit).filter(EventDeposit.creator_event_id == ev.id).first()
    if dep and dep.status == DepositStatus.HELD:
        dep.status = DepositStatus.RELEASED
        dep.resolved_at = _now()

    ev.status = CreatorEventStatus.CANCELLED
    db.commit()
    return {"ok": True, "tickets_refunded": refunded}


# ============================ WEBHOOK ============================
@router.post("/webhook")
async def ticket_webhook(request: Request, db: Session = Depends(get_db)):
    """Separate Stripe webhook endpoint for ticket PaymentIntents (use a
    dedicated endpoint in the Stripe dashboard, or route by metadata.kind)."""
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = p.verify_webhook(payload, sig)
    except Exception as e:
        raise HTTPException(400, f"Webhook verification failed: {e}")
    etype = event.get("type") if isinstance(event, dict) else event["type"]
    data = (event.get("data", {}).get("object", {}) if isinstance(event, dict)
            else event["data"]["object"])
    meta = data.get("metadata", {}) or {}

    if meta.get("kind") != "ticket":
        return {"received": True, "ignored": "not a ticket event"}

    pi_id = data.get("id")
    ticket = db.query(Ticket).filter(
        Ticket.stripe_payment_intent_id == pi_id).first()

    if etype == "payment_intent.succeeded" and ticket:
        ticket.payment_status = PaymentStatus.CAPTURED
        ticket.status = TicketStatus.PAID
        ev = db.query(CreatorEvent).filter(CreatorEvent.id == ticket.creator_event_id).first()
        _maybe_sold_out(db, ev)
        db.commit()
    elif etype == "payment_intent.payment_failed" and ticket:
        ticket.payment_status = PaymentStatus.FAILED
        # release reserved inventory
        tier = db.query(TicketTier).filter(TicketTier.id == ticket.tier_id).first()
        if tier and ticket.status == TicketStatus.RESERVED:
            tier.sold = max(0, tier.sold - ticket.quantity)
        ticket.status = TicketStatus.CANCELLED
        db.commit()

    return {"received": True, "type": etype}
