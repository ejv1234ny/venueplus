from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User
from schemas import UserResponse
from auth import get_current_active_user

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    """Get current user profile"""
    return current_user

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.put("/me", response_model=UserResponse)
def update_current_user(
    first_name: str = None,
    last_name: str = None,
    phone: str = None,
    bio: str = None,
    profile_image: str = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    if first_name:
        current_user.first_name = first_name
    if last_name:
        current_user.last_name = last_name
    if phone:
        current_user.phone = phone
    if bio:
        current_user.bio = bio
    if profile_image:
        current_user.profile_image = profile_image
    
    db.commit()
    db.refresh(current_user)
    return current_user
