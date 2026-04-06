from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User, Event
from schemas import EventCreate, EventResponse
from auth import get_current_active_user

router = APIRouter()

@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    event_data: EventCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new event"""
    new_event = Event(
        host_id=current_user.id,
        **event_data.model_dump()
    )
    
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

@router.get("/", response_model=List[EventResponse])
def get_my_events(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all events created by current user"""
    events = db.query(Event).filter(Event.host_id == current_user.id).all()
    return events

@router.get("/{event_id}", response_model=EventResponse)
def get_event(
    event_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get event details by ID"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Only owner can view event details
    if event.host_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this event"
        )
    
    return event

@router.put("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int,
    event_data: EventCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update event (owner only)"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    if event.host_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this event"
        )
    
    for field, value in event_data.model_dump().items():
        setattr(event, field, value)
    
    db.commit()
    db.refresh(event)
    return event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete event (owner only)"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    if event.host_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this event"
        )
    
    db.delete(event)
    db.commit()
    return None
