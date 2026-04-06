"""Service-provider matching engine.

When a booking has a venue requirement that wasn't satisfied by an explicit
provider pick, the engine offers the job to ranked candidates with a timeout.
If they decline or expire, it advances to the next candidate.
"""
from datetime import datetime, timezone, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import get_current_active_user
from database import get_db
from models import (Booking, BookingService, MatchOffer, MatchStatus,
                    ServiceProvider, ServiceCategory, ProviderBlackout, User,
                    Notification, NotificationType, Venue)
from services import email as email_svc

router = APIRouter()

OFFER_TTL_HOURS = 12  # how long a candidate has to accept


def _now():
    return datetime.now(timezone.utc)


def _aware(dt):
    if dt is None:
        return dt
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def _provider_available(db: Session, provider_id: int, start: datetime, end: datetime) -> bool:
    # Blackout overlap?
    if db.query(ProviderBlackout).filter(
        ProviderBlackout.provider_id == provider_id,
        ProviderBlackout.start_datetime < end,
        ProviderBlackout.end_datetime > start,
    ).first():
        return False
    # Already accepted on overlapping booking?
    overlap = db.query(MatchOffer).join(
        Booking, Booking.id == MatchOffer.booking_id
    ).filter(
        MatchOffer.service_provider_id == provider_id,
        MatchOffer.status == MatchStatus.ACCEPTED,
        Booking.start_datetime < end,
        Booking.end_datetime > start,
    ).first()
    return overlap is None


def _rank_candidates(db: Session, category: ServiceCategory, city: str,
                     start: datetime, end: datetime, limit: int = 10) -> List[ServiceProvider]:
    rows = db.query(ServiceProvider).filter(
        ServiceProvider.service_category == category,
        ServiceProvider.is_active == True,
    ).all()
    if city:
        rows = [p for p in rows if p.service_area_cities
                and city.lower() in [c.lower() for c in p.service_area_cities]]
    # Available?
    rows = [p for p in rows if _provider_available(db, p.id, start, end)]
    # Rank: rating desc, reviews desc, hourly_rate asc
    rows.sort(key=lambda p: (-(p.rating or 0), -(p.total_reviews or 0), p.hourly_rate))
    return rows[:limit]


def _create_offer(db: Session, booking: Booking, sp: ServiceProvider,
                  category: ServiceCategory, rank: int, booking_service_id: int | None) -> MatchOffer:
    offer = MatchOffer(
        booking_id=booking.id,
        booking_service_id=booking_service_id,
        service_provider_id=sp.id,
        service_category=category,
        status=MatchStatus.OFFERED,
        rank=rank,
        expires_at=_now() + timedelta(hours=OFFER_TTL_HOURS),
    )
    db.add(offer)
    db.flush()

    # Notify provider user
    db.add(Notification(
        user_id=sp.user_id,
        type=NotificationType.MATCH_OFFERED,
        title="New job offer",
        body=f"{category.value} job — booking #{booking.id}",
        link=f"/provider/offers/{offer.id}",
        payload={"offer_id": offer.id, "booking_id": booking.id,
                 "category": category.value},
    ))

    # Email
    venue = db.query(Venue).filter(Venue.id == booking.venue_id).first()
    user = db.query(User).filter(User.id == sp.user_id).first()
    if user and venue:
        hours = booking.total_hours
        payout = hours * sp.hourly_rate
        subject, html, text = email_svc.render_match_offer(
            user.first_name, venue.title,
            booking.start_datetime.strftime("%Y-%m-%d %H:%M"),
            hours, payout,
            f"http://localhost:3000/provider/offers/{offer.id}",
        )
        email_svc.send(user.email, subject, html, text)
    return offer


# ---------------- PUBLIC ENDPOINTS ----------------
@router.post("/run/{booking_id}")
def run_matching_for_booking(booking_id: int,
                             current_user: User = Depends(get_current_active_user),
                             db: Session = Depends(get_db)):
    """Trigger matching for any booking_services that don't have an accepted offer."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(404, "Booking not found")
    venue = db.query(Venue).filter(Venue.id == booking.venue_id).first()
    if booking.renter_id != current_user.id and venue.owner_id != current_user.id:
        raise HTTPException(403, "Not authorized")

    services = db.query(BookingService).filter(BookingService.booking_id == booking.id).all()
    summary = []
    for bs in services:
        # Already an accepted offer for this slot?
        accepted = db.query(MatchOffer).filter(
            MatchOffer.booking_service_id == bs.id,
            MatchOffer.status == MatchStatus.ACCEPTED,
        ).first()
        if accepted:
            continue

        sp = db.query(ServiceProvider).filter(
            ServiceProvider.id == bs.service_provider_id).first()
        if not sp:
            continue

        # Offer to the assigned provider first if available
        if _provider_available(db, sp.id, booking.start_datetime, booking.end_datetime):
            _create_offer(db, booking, sp, sp.service_category, rank=0,
                          booking_service_id=bs.id)
            summary.append({"booking_service_id": bs.id, "offered": [sp.id]})
        else:
            # Find replacements ranked
            candidates = _rank_candidates(db, sp.service_category, venue.city,
                                          booking.start_datetime, booking.end_datetime,
                                          limit=5)
            offered = []
            for i, cand in enumerate(candidates):
                _create_offer(db, booking, cand, sp.service_category, rank=i,
                              booking_service_id=bs.id)
                offered.append(cand.id)
            summary.append({"booking_service_id": bs.id, "offered": offered})

    db.commit()
    return {"booking_id": booking.id, "results": summary}


@router.get("/my-offers")
def my_offers(current_user: User = Depends(get_current_active_user),
              db: Session = Depends(get_db)):
    """All open offers across all of a provider's profiles."""
    sp_ids = [p.id for p in db.query(ServiceProvider).filter(
        ServiceProvider.user_id == current_user.id).all()]
    if not sp_ids:
        return []
    offers = db.query(MatchOffer).filter(
        MatchOffer.service_provider_id.in_(sp_ids),
        MatchOffer.status == MatchStatus.OFFERED,
    ).all()
    return [{
        "id": o.id, "booking_id": o.booking_id,
        "category": o.service_category.value,
        "rank": o.rank, "expires_at": o.expires_at,
        "offered_at": o.offered_at,
    } for o in offers]


@router.post("/offers/{offer_id}/accept")
def accept_offer(offer_id: int,
                 current_user: User = Depends(get_current_active_user),
                 db: Session = Depends(get_db)):
    offer = db.query(MatchOffer).filter(MatchOffer.id == offer_id).first()
    if not offer:
        raise HTTPException(404, "Offer not found")
    sp = db.query(ServiceProvider).filter(ServiceProvider.id == offer.service_provider_id).first()
    if sp.user_id != current_user.id:
        raise HTTPException(403, "Not your offer")
    if offer.status != MatchStatus.OFFERED:
        raise HTTPException(400, f"Offer is {offer.status.value}")
    if offer.expires_at and _aware(offer.expires_at) < _now():
        offer.status = MatchStatus.EXPIRED
        db.commit()
        raise HTTPException(400, "Offer expired")

    # Lock: cancel sibling offers for the same booking_service
    if offer.booking_service_id:
        siblings = db.query(MatchOffer).filter(
            MatchOffer.booking_service_id == offer.booking_service_id,
            MatchOffer.id != offer.id,
            MatchOffer.status == MatchStatus.OFFERED,
        ).all()
        for s in siblings:
            s.status = MatchStatus.CANCELLED
            s.responded_at = _now()

        # Update the BookingService to point at this provider
        bs = db.query(BookingService).filter(BookingService.id == offer.booking_service_id).first()
        if bs:
            bs.service_provider_id = sp.id
            bs.status = "accepted"

    offer.status = MatchStatus.ACCEPTED
    offer.responded_at = _now()

    # Notify renter
    booking = db.query(Booking).filter(Booking.id == offer.booking_id).first()
    db.add(Notification(
        user_id=booking.renter_id, type=NotificationType.MATCH_ACCEPTED,
        title=f"{offer.service_category.value.title()} provider confirmed",
        body=f"{sp.service_name} accepted your job for booking #{booking.id}",
        link=f"/bookings/{booking.id}",
    ))
    db.commit()
    return {"ok": True}


@router.post("/offers/{offer_id}/decline")
def decline_offer(offer_id: int,
                  current_user: User = Depends(get_current_active_user),
                  db: Session = Depends(get_db)):
    offer = db.query(MatchOffer).filter(MatchOffer.id == offer_id).first()
    if not offer:
        raise HTTPException(404, "Offer not found")
    sp = db.query(ServiceProvider).filter(ServiceProvider.id == offer.service_provider_id).first()
    if sp.user_id != current_user.id:
        raise HTTPException(403, "Not your offer")
    if offer.status != MatchStatus.OFFERED:
        raise HTTPException(400, f"Offer is {offer.status.value}")
    offer.status = MatchStatus.DECLINED
    offer.responded_at = _now()

    # Auto-advance: if no other offers are open for this slot, find the next candidate
    if offer.booking_service_id:
        any_open = db.query(MatchOffer).filter(
            MatchOffer.booking_service_id == offer.booking_service_id,
            MatchOffer.status == MatchStatus.OFFERED,
        ).first()
        if not any_open:
            booking = db.query(Booking).filter(Booking.id == offer.booking_id).first()
            venue = db.query(Venue).filter(Venue.id == booking.venue_id).first()
            tried = {o.service_provider_id for o in db.query(MatchOffer).filter(
                MatchOffer.booking_service_id == offer.booking_service_id).all()}
            candidates = _rank_candidates(db, offer.service_category, venue.city,
                                          booking.start_datetime, booking.end_datetime, limit=10)
            for i, cand in enumerate(candidates):
                if cand.id in tried:
                    continue
                _create_offer(db, booking, cand, offer.service_category, rank=i,
                              booking_service_id=offer.booking_service_id)
                break
    db.commit()
    return {"ok": True}


@router.post("/expire-stale")
def expire_stale_offers(db: Session = Depends(get_db)):
    """Cron-friendly endpoint to mark expired offers and trigger fallbacks."""
    rows = db.query(MatchOffer).filter(
        MatchOffer.status == MatchStatus.OFFERED,
        MatchOffer.expires_at < _now(),
    ).all()
    n = 0
    for o in rows:
        o.status = MatchStatus.EXPIRED
        n += 1
    db.commit()
    return {"expired": n}
