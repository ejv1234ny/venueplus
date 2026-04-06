"""User notification center."""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import get_current_active_user
from database import get_db
from models import Notification, User

router = APIRouter()


@router.get("/")
def list_notifications(unread_only: bool = False, limit: int = 50,
                       current_user: User = Depends(get_current_active_user),
                       db: Session = Depends(get_db)):
    q = db.query(Notification).filter(Notification.user_id == current_user.id)
    if unread_only:
        q = q.filter(Notification.read_at.is_(None))
    rows = q.order_by(Notification.created_at.desc()).limit(limit).all()
    return [{
        "id": n.id, "type": n.type.value, "title": n.title, "body": n.body,
        "link": n.link, "payload": n.payload, "read": n.read_at is not None,
        "created_at": n.created_at,
    } for n in rows]


@router.get("/unread-count")
def unread_count(current_user: User = Depends(get_current_active_user),
                 db: Session = Depends(get_db)):
    n = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.read_at.is_(None),
    ).count()
    return {"unread": n}


@router.post("/{notif_id}/read")
def mark_read(notif_id: int,
              current_user: User = Depends(get_current_active_user),
              db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == notif_id).first()
    if not n or n.user_id != current_user.id:
        raise HTTPException(404, "Not found")
    n.read_at = datetime.now(timezone.utc)
    db.commit()
    return {"ok": True}


@router.post("/read-all")
def mark_all_read(current_user: User = Depends(get_current_active_user),
                  db: Session = Depends(get_db)):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.read_at.is_(None),
    ).update({Notification.read_at: datetime.now(timezone.utc)})
    db.commit()
    return {"ok": True}
