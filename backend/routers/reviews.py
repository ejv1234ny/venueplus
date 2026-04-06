"""Three-way reviews after a completed booking."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import func

from auth import get_current_active_user
from database import get_db
from models import (Review, ReviewTargetType, Booking, BookingStatus, BookingService,
                    ServiceProvider, Venue, User, Notification, NotificationType)

router = APIRouter()


class ReviewCreate(BaseModel):
    booking_id: int
    target_type: ReviewTargetType
    target_id: int
    rating: int = Field(ge=1, le=5)
    body: Optional[str] = None


def _recompute_provider_rating(db: Session, provider_id: int):
    rows = db.query(Review).filter(
        Review.target_type == ReviewTargetType.PROVIDER,
        Review.target_id == provider_id,
        Review.is_public == True,
    ).all()
    if not rows:
        return
    avg = sum(r.rating for r in rows) / len(rows)
    sp = db.query(ServiceProvider).filter(ServiceProvider.id == provider_id).first()
    if sp:
        sp.rating = round(avg, 2)
        sp.total_reviews = len(rows)


@router.post("/")
def create_review(payload: ReviewCreate,
                  current_user: User = Depends(get_current_active_user),
                  db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == payload.booking_id).first()
    if not booking:
        raise HTTPException(404, "Booking not found")
    if booking.status != BookingStatus.COMPLETED:
        raise HTTPException(400, "Booking not completed")

    venue = db.query(Venue).filter(Venue.id == booking.venue_id).first()

    # Authorization rules per direction
    if payload.target_type == ReviewTargetType.VENUE:
        if current_user.id != booking.renter_id:
            raise HTTPException(403, "Only renter can review the venue")
        if payload.target_id != venue.id:
            raise HTTPException(400, "Target venue mismatch")
    elif payload.target_type == ReviewTargetType.PROVIDER:
        if current_user.id != booking.renter_id:
            raise HTTPException(403, "Only renter can review providers")
        # Provider must have actually been on this booking
        ok = db.query(BookingService).filter(
            BookingService.booking_id == booking.id,
            BookingService.service_provider_id == payload.target_id).first()
        if not ok:
            raise HTTPException(400, "Provider not on this booking")
    elif payload.target_type == ReviewTargetType.RENTER:
        # Host or any provider on this booking can review the renter
        is_host = current_user.id == venue.owner_id
        is_provider = False
        for bs in db.query(BookingService).filter(BookingService.booking_id == booking.id).all():
            sp = db.query(ServiceProvider).filter(ServiceProvider.id == bs.service_provider_id).first()
            if sp and sp.user_id == current_user.id:
                is_provider = True; break
        if not (is_host or is_provider):
            raise HTTPException(403, "Not authorized to review renter")
        if payload.target_id != booking.renter_id:
            raise HTTPException(400, "Target renter mismatch")

    # One review per author per target per booking
    dup = db.query(Review).filter(
        Review.booking_id == booking.id,
        Review.author_id == current_user.id,
        Review.target_type == payload.target_type,
        Review.target_id == payload.target_id,
    ).first()
    if dup:
        raise HTTPException(400, "Already reviewed")

    r = Review(
        booking_id=booking.id, author_id=current_user.id,
        target_type=payload.target_type, target_id=payload.target_id,
        rating=payload.rating, body=payload.body,
    )
    db.add(r); db.flush()

    if payload.target_type == ReviewTargetType.PROVIDER:
        _recompute_provider_rating(db, payload.target_id)

    # Notify reviewee
    if payload.target_type == ReviewTargetType.VENUE:
        target_user_id = venue.owner_id
    elif payload.target_type == ReviewTargetType.PROVIDER:
        sp = db.query(ServiceProvider).filter(ServiceProvider.id == payload.target_id).first()
        target_user_id = sp.user_id if sp else None
    else:
        target_user_id = payload.target_id

    if target_user_id:
        db.add(Notification(
            user_id=target_user_id, type=NotificationType.REVIEW_RECEIVED,
            title=f"You got a {payload.rating}-star review",
            body=(payload.body or "")[:200],
            link=f"/profile",
            payload={"booking_id": booking.id, "review_id": r.id},
        ))

    db.commit(); db.refresh(r)
    return {"id": r.id}


@router.get("/venue/{venue_id}")
def venue_reviews(venue_id: int, db: Session = Depends(get_db)):
    rows = db.query(Review).filter(
        Review.target_type == ReviewTargetType.VENUE,
        Review.target_id == venue_id,
        Review.is_public == True,
    ).order_by(Review.created_at.desc()).all()
    avg = (sum(r.rating for r in rows) / len(rows)) if rows else 0
    return {
        "average": round(avg, 2),
        "count": len(rows),
        "items": [{"id": r.id, "rating": r.rating, "body": r.body,
                   "author_id": r.author_id, "created_at": r.created_at} for r in rows],
    }


@router.get("/provider/{provider_id}")
def provider_reviews(provider_id: int, db: Session = Depends(get_db)):
    rows = db.query(Review).filter(
        Review.target_type == ReviewTargetType.PROVIDER,
        Review.target_id == provider_id,
        Review.is_public == True,
    ).order_by(Review.created_at.desc()).all()
    avg = (sum(r.rating for r in rows) / len(rows)) if rows else 0
    return {
        "average": round(avg, 2),
        "count": len(rows),
        "items": [{"id": r.id, "rating": r.rating, "body": r.body,
                   "author_id": r.author_id, "created_at": r.created_at} for r in rows],
    }
