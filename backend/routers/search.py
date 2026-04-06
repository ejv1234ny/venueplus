"""Search endpoints — venues and providers with filters, geo, availability."""
import math
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from database import get_db
from models import (Venue, Booking, BookingStatus, ServiceProvider,
                    ServiceCategory, ProviderBlackout)
from services.geocode import geocode

router = APIRouter()


def _haversine_miles(lat1, lon1, lat2, lon2):
    R = 3958.8
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return 2 * R * math.asin(math.sqrt(a))


def _venue_available(db: Session, venue_id: int, start: datetime, end: datetime) -> bool:
    conflict = db.query(Booking).filter(
        Booking.venue_id == venue_id,
        Booking.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED,
                            BookingStatus.AWAITING_PAYMENT, BookingStatus.IN_PROGRESS]),
        Booking.start_datetime < end,
        Booking.end_datetime > start,
    ).first()
    return conflict is None


@router.get("/venues")
def search_venues(
    q: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    venue_type: Optional[str] = None,
    min_capacity: Optional[int] = None,
    max_price: Optional[float] = None,
    amenities: Optional[str] = Query(None, description="comma-separated"),
    start: Optional[datetime] = None,
    end: Optional[datetime] = None,
    near: Optional[str] = Query(None, description="freeform location to geocode"),
    radius_miles: Optional[float] = 25.0,
    sort: str = Query("relevance", pattern="^(relevance|price_asc|price_desc|capacity|distance)$"),
    skip: int = 0,
    limit: int = 24,
    db: Session = Depends(get_db),
):
    query = db.query(Venue).filter(Venue.is_active == True)

    if q:
        like = f"%{q.lower()}%"
        query = query.filter(or_(
            Venue.title.ilike(like),
            Venue.description.ilike(like),
            Venue.venue_type.ilike(like),
        ))
    if city:
        query = query.filter(Venue.city.ilike(city))
    if state:
        query = query.filter(Venue.state.ilike(state))
    if venue_type:
        query = query.filter(Venue.venue_type.ilike(venue_type))
    if min_capacity:
        query = query.filter(Venue.capacity >= min_capacity)
    if max_price:
        query = query.filter(Venue.price_per_hour <= max_price)

    rows = query.all()

    # Amenity filter (JSON contains)
    if amenities:
        wanted = {a.strip().lower() for a in amenities.split(",") if a.strip()}
        rows = [v for v in rows if v.amenities and wanted.issubset({a.lower() for a in v.amenities})]

    # Date availability filter
    if start and end:
        rows = [v for v in rows if _venue_available(db, v.id, start, end)]

    # Geo filter via "near"
    distances = {}
    if near:
        coords = geocode(near)
        if coords:
            lat0, lon0 = coords
            kept = []
            for v in rows:
                if v.latitude and v.longitude:
                    d = _haversine_miles(lat0, lon0, v.latitude, v.longitude)
                    if d <= (radius_miles or 25.0):
                        distances[v.id] = d
                        kept.append(v)
            rows = kept

    # Sort
    if sort == "price_asc":
        rows.sort(key=lambda v: v.price_per_hour)
    elif sort == "price_desc":
        rows.sort(key=lambda v: -v.price_per_hour)
    elif sort == "capacity":
        rows.sort(key=lambda v: -v.capacity)
    elif sort == "distance" and distances:
        rows.sort(key=lambda v: distances.get(v.id, 1e9))

    total = len(rows)
    rows = rows[skip:skip+limit]

    def serialize(v: Venue):
        return {
            "id": v.id, "title": v.title, "venue_type": v.venue_type,
            "city": v.city, "state": v.state,
            "capacity": v.capacity, "price_per_hour": v.price_per_hour,
            "images": v.images or [], "amenities": v.amenities or [],
            "latitude": v.latitude, "longitude": v.longitude,
            "distance_miles": round(distances[v.id], 1) if v.id in distances else None,
        }

    return {"total": total, "items": [serialize(v) for v in rows]}


@router.get("/providers")
def search_providers(
    category: Optional[ServiceCategory] = None,
    city: Optional[str] = None,
    max_rate: Optional[float] = None,
    min_rating: Optional[float] = None,
    start: Optional[datetime] = None,
    end: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 24,
    db: Session = Depends(get_db),
):
    query = db.query(ServiceProvider).filter(ServiceProvider.is_active == True)
    if category:
        query = query.filter(ServiceProvider.service_category == category)
    if max_rate:
        query = query.filter(ServiceProvider.hourly_rate <= max_rate)
    if min_rating:
        query = query.filter(ServiceProvider.rating >= min_rating)
    rows = query.all()

    if city:
        rows = [p for p in rows if p.service_area_cities
                and city.lower() in [c.lower() for c in p.service_area_cities]]

    if start and end:
        # remove providers with blackout overlap
        keep = []
        for p in rows:
            blackout = db.query(ProviderBlackout).filter(
                ProviderBlackout.provider_id == p.id,
                ProviderBlackout.start_datetime < end,
                ProviderBlackout.end_datetime > start,
            ).first()
            if not blackout:
                keep.append(p)
        rows = keep

    total = len(rows)
    rows = rows[skip:skip+limit]
    return {
        "total": total,
        "items": [
            {
                "id": p.id, "name": p.service_name,
                "category": p.service_category.value,
                "hourly_rate": p.hourly_rate,
                "rating": p.rating, "total_reviews": p.total_reviews,
                "service_area_cities": p.service_area_cities or [],
                "images": p.images or [],
            } for p in rows
        ],
    }


@router.get("/cities")
def list_cities(db: Session = Depends(get_db)):
    """Distinct cities with active venues — used in city dropdowns."""
    rows = db.query(Venue.city, Venue.state).filter(Venue.is_active == True).distinct().all()
    return [{"city": c, "state": s} for c, s in rows if c]
