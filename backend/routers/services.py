from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from models import User, ServiceProvider, UserRole, ServiceCategory
from schemas import ServiceProviderCreate, ServiceProviderUpdate, ServiceProviderResponse
from auth import get_current_active_user

router = APIRouter()

@router.post("/", response_model=ServiceProviderResponse, status_code=status.HTTP_201_CREATED)
def create_service_profile(
    service_data: ServiceProviderCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a service provider profile (service providers only)"""
    if current_user.role != UserRole.SERVICE_PROVIDER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can create service profiles"
        )
    
    new_service = ServiceProvider(
        user_id=current_user.id,
        **service_data.model_dump()
    )
    
    db.add(new_service)
    db.commit()
    db.refresh(new_service)
    return new_service

@router.get("/", response_model=List[ServiceProviderResponse])
def search_services(
    category: Optional[ServiceCategory] = None,
    city: Optional[str] = None,
    max_rate: Optional[float] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Search service providers with filters"""
    query = db.query(ServiceProvider).filter(ServiceProvider.is_active == True)
    
    if category:
        query = query.filter(ServiceProvider.service_category == category)
    if max_rate:
        query = query.filter(ServiceProvider.hourly_rate <= max_rate)
    
    services = query.offset(skip).limit(limit).all()
    
    # Filter by city if provided (JSON field search)
    if city:
        services = [
            s for s in services
            if s.service_area_cities and city.lower() in [c.lower() for c in s.service_area_cities]
        ]
    
    return services

@router.get("/{service_id}", response_model=ServiceProviderResponse)
def get_service(service_id: int, db: Session = Depends(get_db)):
    """Get service provider details by ID"""
    service = db.query(ServiceProvider).filter(ServiceProvider.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service provider not found"
        )
    return service

@router.put("/{service_id}", response_model=ServiceProviderResponse)
def update_service(
    service_id: int,
    service_data: ServiceProviderUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update service provider profile (owner only)"""
    service = db.query(ServiceProvider).filter(ServiceProvider.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service provider not found"
        )
    
    if service.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this service profile"
        )
    
    update_data = service_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(service, field, value)
    
    db.commit()
    db.refresh(service)
    return service

@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(
    service_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete service provider profile (owner only)"""
    service = db.query(ServiceProvider).filter(ServiceProvider.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service provider not found"
        )
    
    if service.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this service profile"
        )
    
    db.delete(service)
    db.commit()
    return None

@router.get("/my/services", response_model=List[ServiceProviderResponse])
def get_my_services(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all service profiles owned by current user"""
    services = db.query(ServiceProvider).filter(ServiceProvider.user_id == current_user.id).all()
    return services

@router.get("/categories/list", response_model=List[str])
def get_service_categories():
    """Get list of all service categories"""
    return [category.value for category in ServiceCategory]
