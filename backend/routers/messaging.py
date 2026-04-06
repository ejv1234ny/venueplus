"""Messaging — per-booking conversations between renter, host, and providers."""
import re
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth import get_current_active_user
from database import get_db
from models import (Conversation, ConversationParticipant, Message, Booking,
                    BookingService, ServiceProvider, Venue, User,
                    Notification, NotificationType)

router = APIRouter()

# Anti-circumvention scrub: phone + email patterns
PHONE_RE = re.compile(r"\+?\d[\d\-\s().]{7,}\d")
EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")


def _now():
    return datetime.now(timezone.utc)


def _scrub(body: str) -> tuple[str, bool]:
    flagged = False
    if PHONE_RE.search(body) or EMAIL_RE.search(body):
        flagged = True
        body = PHONE_RE.sub("[contact removed]", body)
        body = EMAIL_RE.sub("[contact removed]", body)
    return body, flagged


def _ensure_conversation(db: Session, booking_id: int, current_user: User) -> Conversation:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(404, "Booking not found")
    venue = db.query(Venue).filter(Venue.id == booking.venue_id).first()

    # Authorization: must be renter, host, or assigned provider on this booking
    is_renter = current_user.id == booking.renter_id
    is_host = current_user.id == venue.owner_id
    provider_user_ids = set()
    for bs in db.query(BookingService).filter(BookingService.booking_id == booking.id).all():
        sp = db.query(ServiceProvider).filter(ServiceProvider.id == bs.service_provider_id).first()
        if sp:
            provider_user_ids.add(sp.user_id)
    is_provider = current_user.id in provider_user_ids
    if not (is_renter or is_host or is_provider):
        raise HTTPException(403, "Not part of this booking")

    convo = db.query(Conversation).filter(Conversation.booking_id == booking.id).first()
    if convo:
        return convo

    convo = Conversation(booking_id=booking.id,
                         title=f"Booking #{booking.id} — {venue.title}")
    db.add(convo); db.flush()
    participant_ids = {booking.renter_id, venue.owner_id} | provider_user_ids
    for uid in participant_ids:
        db.add(ConversationParticipant(conversation_id=convo.id, user_id=uid))
    db.commit(); db.refresh(convo)
    return convo


# ---------------- ENDPOINTS ----------------
@router.get("/conversations")
def list_conversations(current_user: User = Depends(get_current_active_user),
                       db: Session = Depends(get_db)):
    parts = db.query(ConversationParticipant).filter(
        ConversationParticipant.user_id == current_user.id).all()
    convos = []
    for p in parts:
        c = db.query(Conversation).filter(Conversation.id == p.conversation_id).first()
        if not c:
            continue
        last = db.query(Message).filter(Message.conversation_id == c.id).order_by(
            Message.created_at.desc()).first()
        unread = 0
        if last and (not p.last_read_at or last.created_at > p.last_read_at):
            unread = db.query(Message).filter(
                Message.conversation_id == c.id,
                Message.created_at > (p.last_read_at or datetime.min.replace(tzinfo=timezone.utc)),
            ).count()
        convos.append({
            "id": c.id, "title": c.title, "booking_id": c.booking_id,
            "last_message": last.body if last else None,
            "last_at": last.created_at if last else None,
            "unread": unread,
        })
    convos.sort(key=lambda x: x["last_at"] or datetime.min.replace(tzinfo=timezone.utc), reverse=True)
    return convos


@router.get("/conversations/{convo_id}")
def get_conversation(convo_id: int,
                     current_user: User = Depends(get_current_active_user),
                     db: Session = Depends(get_db)):
    p = db.query(ConversationParticipant).filter(
        ConversationParticipant.conversation_id == convo_id,
        ConversationParticipant.user_id == current_user.id).first()
    if not p:
        raise HTTPException(403, "Not a participant")
    p.last_read_at = _now()
    msgs = db.query(Message).filter(Message.conversation_id == convo_id).order_by(
        Message.created_at).all()
    db.commit()
    return {
        "id": convo_id,
        "messages": [{
            "id": m.id, "sender_id": m.sender_id, "body": m.body,
            "flagged": m.flagged, "created_at": m.created_at,
        } for m in msgs],
    }


class SendMessage(BaseModel):
    body: str


@router.post("/booking/{booking_id}")
def send_to_booking(booking_id: int, payload: SendMessage,
                    current_user: User = Depends(get_current_active_user),
                    db: Session = Depends(get_db)):
    convo = _ensure_conversation(db, booking_id, current_user)
    body, flagged = _scrub(payload.body)
    if not body.strip():
        raise HTTPException(400, "Empty message")
    msg = Message(conversation_id=convo.id, sender_id=current_user.id,
                  body=body, flagged=flagged,
                  flagged_reason="contact_info" if flagged else None)
    db.add(msg); db.flush()

    # Notify other participants
    parts = db.query(ConversationParticipant).filter(
        ConversationParticipant.conversation_id == convo.id,
        ConversationParticipant.user_id != current_user.id).all()
    for p in parts:
        db.add(Notification(
            user_id=p.user_id, type=NotificationType.MESSAGE_RECEIVED,
            title=f"New message: {convo.title}",
            body=body[:200],
            link=f"/messages/{convo.id}",
            payload={"conversation_id": convo.id},
        ))
    db.commit(); db.refresh(msg)
    return {"id": msg.id, "flagged": flagged, "created_at": msg.created_at}


@router.post("/conversations/{convo_id}/send")
def send_to_conversation(convo_id: int, payload: SendMessage,
                         current_user: User = Depends(get_current_active_user),
                         db: Session = Depends(get_db)):
    p = db.query(ConversationParticipant).filter(
        ConversationParticipant.conversation_id == convo_id,
        ConversationParticipant.user_id == current_user.id).first()
    if not p:
        raise HTTPException(403, "Not a participant")
    body, flagged = _scrub(payload.body)
    if not body.strip():
        raise HTTPException(400, "Empty message")
    msg = Message(conversation_id=convo_id, sender_id=current_user.id,
                  body=body, flagged=flagged,
                  flagged_reason="contact_info" if flagged else None)
    db.add(msg); db.commit(); db.refresh(msg)
    return {"id": msg.id, "flagged": flagged, "created_at": msg.created_at}
