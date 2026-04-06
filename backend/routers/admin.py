"""Admin endpoints — guarded by require_admin."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from auth import require_admin
from database import get_db
from models import (User, Venue, ServiceProvider, Booking, BookingStatus,
                    Review, AuditLog, Notification, Message)

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


@router.get("/audit-log")
def audit_log(limit: int = 200, admin: User = Depends(require_admin),
              db: Session = Depends(get_db)):
    rows = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [{"id": a.id, "actor_id": a.actor_id, "action": a.action,
             "entity_type": a.entity_type, "entity_id": a.entity_id,
             "meta": a.meta, "created_at": a.created_at} for a in rows]
