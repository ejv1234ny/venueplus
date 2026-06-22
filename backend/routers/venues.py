from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import cast, String
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from models import User, Venue, VenueRequirement, UserRole
from schemas import VenueCreate, VenueUpdate, VenueResponse, VenueRequirementCreate, VenueRequirementResponse
from auth import get_current_active_user
from services import places

router = APIRouter()

@router.post("/", response_model=VenueResponse, status_code=status.HTTP_201_CREATED)
def create_venue(
    venue_data: VenueCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new venue (venue owners only)"""
    if current_user.role != UserRole.VENUE_OWNER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only venue owners can create venues"
        )
    
    new_venue = Venue(
        owner_id=current_user.id,
        **venue_data.model_dump()
    )
    
    db.add(new_venue)
    db.commit()
    db.refresh(new_venue)
    return new_venue

@router.get("/", response_model=List[VenueResponse])
def search_venues(
    city: Optional[str] = None,
    venue_type: Optional[str] = None,
    event_type: Optional[str] = None,
    min_capacity: Optional[int] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    sw_lat: Optional[float] = Query(None, description="Southwest corner latitude"),
    sw_lng: Optional[float] = Query(None, description="Southwest corner longitude"),
    ne_lat: Optional[float] = Query(None, description="Northeast corner latitude"),
    ne_lng: Optional[float] = Query(None, description="Northeast corner longitude"),
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Search venues with filters, text search, and map bounds"""
    query = db.query(Venue).filter(Venue.is_active == True)

    # Map bounds filter
    if all(v is not None for v in [sw_lat, sw_lng, ne_lat, ne_lng]):
        query = query.filter(
            Venue.latitude.isnot(None),
            Venue.longitude.isnot(None),
            Venue.latitude >= sw_lat,
            Venue.latitude <= ne_lat,
            Venue.longitude >= sw_lng,
            Venue.longitude <= ne_lng,
        )

    # Text search across city, state, address
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Venue.city.ilike(search_term)) |
            (Venue.state.ilike(search_term)) |
            (Venue.address.ilike(search_term))
        )

    if city:
        query = query.filter(Venue.city.ilike(f"%{city}%"))
    if venue_type:
        query = query.filter(Venue.venue_type.ilike(f"%{venue_type}%"))
    if event_type:
        # Match venues whose ideal_for JSON array contains this event_type slug.
        # Portable across SQLite/Postgres: substring-match the serialized array,
        # escaping LIKE metacharacters (slugs contain underscores).
        esc = event_type.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        query = query.filter(cast(Venue.ideal_for, String).like(f'%"{esc}"%', escape="\\"))
    if min_capacity:
        query = query.filter(Venue.capacity >= min_capacity)
    if max_price:
        query = query.filter(Venue.price_per_hour <= max_price)

    venues = query.offset(skip).limit(limit).all()
    return venues

# NOTE: declared before "/{venue_id}" so the literal path isn't captured by it.
@router.get("/photo-suggestions")
def photo_suggestions(
    query: str = Query(..., min_length=4, description="Address or name + address"),
    current_user: User = Depends(get_current_active_user),
):
    """Suggest property photos for an address via Google Places (venue owners).

    Returns ``{"suggestions": [{"url", "attribution"}]}``. Each photo is downloaded
    into the configured storage backend so the URL persists (the Google Photo
    endpoint needs the server key and isn't client-safe). Responds 501 when
    GOOGLE_MAPS_API_KEY is unset — the frontend treats that as "coming soon".
    """
    if current_user.role != UserRole.VENUE_OWNER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only venue owners can fetch photos",
        )
    if not places.is_configured():
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Photo suggestions are not configured yet",
        )
    try:
        suggestions = places.fetch_suggestions(query)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not fetch photos right now",
        )
    return {"suggestions": suggestions}

@router.get("/{venue_id}", response_model=VenueResponse)
def get_venue(venue_id: int, db: Session = Depends(get_db)):
    """Get venue details by ID"""
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Venue not found"
        )
    return venue

@router.put("/{venue_id}", response_model=VenueResponse)
def update_venue(
    venue_id: int,
    venue_data: VenueUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update venue (owner only)"""
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Venue not found"
        )
    
    if venue.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this venue"
        )
    
    update_data = venue_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(venue, field, value)
    
    db.commit()
    db.refresh(venue)
    return venue

@router.delete("/{venue_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_venue(
    venue_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete venue (owner only)"""
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Venue not found"
        )
    
    if venue.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this venue"
        )
    
    db.delete(venue)
    db.commit()
    return None

@router.get("/my/venues", response_model=List[VenueResponse])
def get_my_venues(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all venues owned by current user"""
    venues = db.query(Venue).filter(Venue.owner_id == current_user.id).all()
    return venues

# Venue Requirements endpoints
@router.post("/{venue_id}/requirements", response_model=VenueRequirementResponse, status_code=status.HTTP_201_CREATED)
def add_venue_requirement(
    venue_id: int,
    requirement_data: VenueRequirementCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Add a service requirement to a venue (owner only)"""
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Venue not found"
        )
    
    if venue.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this venue"
        )
    
    new_requirement = VenueRequirement(
        venue_id=venue_id,
        **requirement_data.model_dump()
    )
    
    db.add(new_requirement)
    db.commit()
    db.refresh(new_requirement)
    return new_requirement

@router.get("/{venue_id}/requirements", response_model=List[VenueRequirementResponse])
def get_venue_requirements(venue_id: int, db: Session = Depends(get_db)):
    """Get all service requirements for a venue"""
    requirements = db.query(VenueRequirement).filter(
        VenueRequirement.venue_id == venue_id
    ).all()
    return requirements

@router.delete("/{venue_id}/requirements/{requirement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_venue_requirement(
    venue_id: int,
    requirement_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a venue requirement (owner only)"""
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not venue or venue.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    requirement = db.query(VenueRequirement).filter(
        VenueRequirement.id == requirement_id,
        VenueRequirement.venue_id == venue_id
    ).first()
    
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requirement not found"
        )
    
    db.delete(requirement)
    db.commit()
    return None
