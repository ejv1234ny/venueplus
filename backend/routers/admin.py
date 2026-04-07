"""Admin endpoints — guarded by require_admin."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from auth import require_admin
from database import get_db
from models import (User, Venue, ServiceProvider, Booking, BookingStatus,
                    Review, AuditLog, Notification, Message,
                    Payment, PaymentStatus, Payout, PayoutStatus, StripeAccount)

router = APIRouter()


def _audit(db: Session, actor_id: int, action: str, entity_type: str,
           entity_id: int, meta: dict | None = None):
    db.add(AuditLog(actor_id=actor_id, action=action, entity_type=entity_type,
                    entity_id=entity_id, meta=meta or {}))


@router.get("/stats")
def stats(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    return {
        "users":     db.query(User).count(),
        "venues":    db.query(Venue).count(),
        "providers": db.query(ServiceProvider).count(),
        "bookings":  db.query(Booking).count(),
        "gmv":       db.query(func.coalesce(func.sum(Booking.total_cost), 0.0)).filter(
                        Booking.status.in_([BookingStatus.CONFIRMED,
                                            BookingStatus.COMPLETED])).scalar(),
        "reviews":   db.query(Review).count(),
        "messages":  db.query(Message).count(),
        "by_status": {s.value: db.query(Booking).filter(Booking.status == s).count()
                      for s in BookingStatus},
    }


@router.get("/users")
def list_users(skip: int = 0, limit: int = 100, q: str | None = None,
               admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    query = db.query(User)
    if q:
        like = f"%{q.lower()}%"
        query = query.filter((User.email.ilike(like)) | (User.first_name.ilike(like))
                             | (User.last_name.ilike(like)))
    rows = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    return [{
        "id": u.id, "email": u.email, "name": f"{u.first_name} {u.last_name}",
        "role": u.role.value, "active": u.is_active, "verified": u.is_verified,
        "created_at": u.created_at,
    } for u in rows]


@router.post("/users/{user_id}/suspend")
def suspend_user(user_id: int, admin: User = Depends(require_admin),
                 db: Session = Depends(get_db)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(404, "Not found")
    u.is_active = False
    _audit(db, admin.id, "suspend_user", "user", user_id)
    db.commit()
    return {"ok": True}


@router.post("/users/{user_id}/reactivate")
def reactivate_user(user_id: int, admin: User = Depends(require_admin),
                    db: Session = Depends(get_db)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(404, "Not found")
    u.is_active = True
    _audit(db, admin.id, "reactivate_user", "user", user_id)
    db.commit()
    return {"ok": True}


@router.post("/users/{user_id}/verify")
def verify_user(user_id: int, admin: User = Depends(require_admin),
                db: Session = Depends(get_db)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(404, "Not found")
    u.is_verified = True
    _audit(db, admin.id, "verify_user", "user", user_id)
    db.commit()
    return {"ok": True}


@router.get("/bookings")
def list_bookings(status: BookingStatus | None = None, limit: int = 100,
                  admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    q = db.query(Booking)
    if status:
        q = q.filter(Booking.status == status)
    rows = q.order_by(Booking.created_at.desc()).limit(limit).all()
    return [{"id": b.id, "renter_id": b.renter_id, "venue_id": b.venue_id,
             "status": b.status.value, "total": b.total_cost,
             "start": b.start_datetime} for b in rows]


@router.post("/bookings/{booking_id}/force-status/{new_status}")
def force_status(booking_id: int, new_status: BookingStatus,
                 admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(404, "Not found")
    old = b.status.value
    b.status = new_status
    _audit(db, admin.id, "force_booking_status", "booking", b.id,
           {"from": old, "to": new_status.value})
    db.commit()
    return {"ok": True, "from": old, "to": new_status.value}


@router.get("/flagged-messages")
def flagged_messages(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    rows = db.query(Message).filter(Message.flagged == True).order_by(
        Message.created_at.desc()).limit(200).all()
    return [{"id": m.id, "conversation_id": m.conversation_id,
             "sender_id": m.sender_id, "body": m.body,
             "reason": m.flagged_reason, "created_at": m.created_at} for m in rows]


@router.get("/payments")
def list_payments(status: PaymentStatus | None = None, limit: int = 100,
                  admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    q = db.query(Payment)
    if status:
        q = q.filter(Payment.status == status)
    rows = q.order_by(Payment.created_at.desc()).limit(limit).all()
    return [{
        "id": p.id,
        "booking_id": p.booking_id,
        "stripe_payment_intent_id": p.stripe_payment_intent_id,
        "subtotal": p.subtotal_cents / 100,
        "platform_fee": p.platform_fee_cents / 100,
        "stripe_fee": p.stripe_fee_cents / 100,
        "total": p.total_charged_cents / 100,
        "refunded": p.refunded_cents / 100,
        "status": p.status.value,
        "created_at": p.created_at,
        "captured_at": p.captured_at,
    } for p in rows]


@router.get("/payments/{payment_id}")
def get_payment(payment_id: int, admin: User = Depends(require_admin),
                db: Session = Depends(get_db)):
    pay = db.query(Payment).filter(Payment.id == payment_id).first()
    if not pay:
        raise HTTPException(404, "Not found")
    payouts = db.query(Payout).filter(Payout.payment_id == payment_id).all()
    return {
        "id": pay.id,
        "booking_id": pay.booking_id,
        "stripe_payment_intent_id": pay.stripe_payment_intent_id,
        "stripe_charge_id": pay.stripe_charge_id,
        "subtotal": pay.subtotal_cents / 100,
        "platform_fee": pay.platform_fee_cents / 100,
        "stripe_fee": pay.stripe_fee_cents / 100,
        "total": pay.total_charged_cents / 100,
        "refunded": pay.refunded_cents / 100,
        "status": pay.status.value,
        "refund_reason": pay.refund_reason,
        "error_message": pay.error_message,
        "created_at": pay.created_at,
        "captured_at": pay.captured_at,
        "refunded_at": pay.refunded_at,
        "payouts": [{
            "id": po.id,
            "recipient_user_id": po.recipient_user_id,
            "recipient_type": po.recipient_type,
            "gross": po.gross_cents / 100,
            "platform_fee": po.platform_fee_cents / 100,
            "net": po.net_cents / 100,
            "status": po.status.value,
            "stripe_transfer_id": po.stripe_transfer_id,
            "error_message": po.error_message,
            "sent_at": po.sent_at,
        } for po in payouts],
    }


@router.get("/payouts")
def list_payouts(status: PayoutStatus | None = None, limit: int = 200,
                 admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    q = db.query(Payout)
    if status:
        q = q.filter(Payout.status == status)
    rows = q.order_by(Payout.created_at.desc()).limit(limit).all()
    return [{
        "id": po.id,
        "booking_id": po.booking_id,
        "payment_id": po.payment_id,
        "recipient_user_id": po.recipient_user_id,
        "recipient_type": po.recipient_type,
        "gross": po.gross_cents / 100,
        "net": po.net_cents / 100,
        "status": po.status.value,
        "stripe_transfer_id": po.stripe_transfer_id,
        "error_message": po.error_message,
        "created_at": po.created_at,
        "sent_at": po.sent_at,
    } for po in rows]


@router.post("/payments/{payment_id}/manual-refund")
def admin_manual_refund(payment_id: int, refund_pct: int = 100,
                        admin: User = Depends(require_admin),
                        db: Session = Depends(get_db)):
    """Admin override: refund a payment without going through the booking
    cancellation policy. Useful for disputes."""
    from services import payments as p_svc
    pay = db.query(Payment).filter(Payment.id == payment_id).first()
    if not pay:
        raise HTTPException(404, "Not found")
    if pay.status not in (PaymentStatus.AUTHORIZED, PaymentStatus.CAPTURED,
                          PaymentStatus.PARTIALLY_REFUNDED):
        raise HTTPException(400, f"Cannot refund from {pay.status.value}")
    if not (0 < refund_pct <= 100):
        raise HTTPException(400, "refund_pct must be 1-100")
    amount = int(round(pay.total_charged_cents * refund_pct / 100))
    res = p_svc.refund_payment(pay.stripe_payment_intent_id, amount_cents=amount,
                               reason="admin_manual")
    pay.refunded_cents += amount
    pay.refunded_at = func.now()
    pay.status = (PaymentStatus.REFUNDED if amount == pay.total_charged_cents
                  else PaymentStatus.PARTIALLY_REFUNDED)
    pay.refund_reason = f"admin_manual {refund_pct}%"
    _audit(db, admin.id, "manual_refund", "payment", payment_id,
           {"amount": amount, "pct": refund_pct})
    db.commit()
    return {"ok": True, "refund_id": res["id"], "amount": amount / 100}


@router.post("/payouts/{payout_id}/retry")
def admin_retry_payout(payout_id: int,
                       admin: User = Depends(require_admin),
                       db: Session = Depends(get_db)):
    """Re-attempt a failed payout transfer."""
    from services import payments as p_svc
    po = db.query(Payout).filter(Payout.id == payout_id).first()
    if not po:
        raise HTTPException(404, "Not found")
    if po.status not in (PayoutStatus.FAILED, PayoutStatus.PENDING):
        raise HTTPException(400, f"Cannot retry from {po.status.value}")
    sa = db.query(StripeAccount).filter(
        StripeAccount.user_id == po.recipient_user_id).first()
    if not sa or not sa.payouts_enabled:
        raise HTTPException(400, "Recipient has no payout-enabled account")
    try:
        t = p_svc.create_transfer(
            amount_cents=po.net_cents,
            destination_account_id=sa.stripe_account_id,
            transfer_group=f"booking_{po.booking_id}",
            metadata={"payout_id": str(po.id), "retry": "1"},
        )
        po.stripe_transfer_id = t["id"]
        po.status = PayoutStatus.SENT
        po.sent_at = func.now()
        po.error_message = None
        _audit(db, admin.id, "retry_payout", "payout", payout_id, {})
        db.commit()
        return {"ok": True, "transfer_id": t["id"]}
    except Exception as e:
        po.status = PayoutStatus.FAILED
        po.error_message = str(e)[:500]
        db.commit()
        raise HTTPException(500, str(e))


@router.get("/audit-log")
def audit_log(limit: int = 200, admin: User = Depends(require_admin),
              db: Session = Depends(get_db)):
    rows = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [{"id": a.id, "actor_id": a.actor_id, "action": a.action,
             "entity_type": a.entity_type, "entity_id": a.entity_id,
             "meta": a.meta, "created_at": a.created_at} for a in rows]
