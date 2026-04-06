"""Provider onboarding wizard + claim-listing flow.

Onboarding is a multi-step process that lives over multiple requests; the
client passes the step number and we update or create the right rows.
"""
import secrets
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from auth import get_current_active_user, get_password_hash
from database import get_db
from models import (User, UserRole, ServiceProvider, ServiceCategory,
                    ProviderBlackout, VerificationToken)
from services import email as email_svc

router = APIRouter()


def _now():
    return datetime.now(timezone.utc)


# ---------------- ONBOARDING ----------------
class OnboardStep1(BaseModel):
    business_name: str
    category: ServiceCategory
    bio: str
    years_experience: int = 0


class OnboardStep2(BaseModel):
    service_area_cities: List[str]
    travel_radius_miles: int = 25


class OnboardStep3(BaseModel):
    hourly_rate: float
    minimum_hours: int = 2


class OnboardStep4(BaseModel):
    weekly_availability: dict     # e.g. {"mon": "09:00-22:00"}


@router.post("/onboarding/start")
def onboarding_start(payload: OnboardStep1,
                     current_user: User = Depends(get_current_active_user),
                     db: Session = Depends(get_db)):
    if current_user.role != UserRole.SERVICE_PROVIDER:
        raise HTTPException(403, "Only service-provider accounts can onboard")
    sp = db.query(ServiceProvider).filter(
        ServiceProvider.user_id == current_user.id).first()
    if sp:
        sp.service_name = payload.business_name
        sp.service_category = payload.category
        sp.description = payload.bio
    else:
        sp = ServiceProvider(
            user_id=current_user.id,
            service_category=payload.category,
            service_name=payload.business_name,
            description=payload.bio,
            hourly_rate=50.0,  # placeholder until step 3
            minimum_hours=2,
            service_area_cities=[],
            availability={},
            images=[],
            is_active=False,  # not live until all steps done
        )
        db.add(sp)
    if payload.years_experience:
        current_user.bio = f"{payload.years_experience} years experience. {payload.bio}"
    db.commit(); db.refresh(sp)
    return {"provider_id": sp.id, "next_step": 2}


@router.post("/onboarding/{provider_id}/area")
def onboarding_area(provider_id: int, payload: OnboardStep2,
                    current_user: User = Depends(get_current_active_user),
                    db: Session = Depends(get_db)):
    sp = db.query(ServiceProvider).filter(ServiceProvider.id == provider_id).first()
    if not sp or sp.user_id != current_user.id:
        raise HTTPException(403, "Not your profile")
    sp.service_area_cities = payload.service_area_cities
    db.commit()
    return {"provider_id": sp.id, "next_step": 3}


@router.post("/onboarding/{provider_id}/pricing")
def onboarding_pricing(provider_id: int, payload: OnboardStep3,
                       current_user: User = Depends(get_current_active_user),
                       db: Session = Depends(get_db)):
    sp = db.query(ServiceProvider).filter(ServiceProvider.id == provider_id).first()
    if not sp or sp.user_id != current_user.id:
        raise HTTPException(403, "Not your profile")
    sp.hourly_rate = payload.hourly_rate
    sp.minimum_hours = payload.minimum_hours
    db.commit()
    return {"provider_id": sp.id, "next_step": 4}


@router.post("/onboarding/{provider_id}/availability")
def onboarding_availability(provider_id: int, payload: OnboardStep4,
                            current_user: User = Depends(get_current_active_user),
                            db: Session = Depends(get_db)):
    sp = db.query(ServiceProvider).filter(ServiceProvider.id == provider_id).first()
    if not sp or sp.user_id != current_user.id:
        raise HTTPException(403, "Not your profile")
    sp.availability = payload.weekly_availability
    db.commit()
    return {"provider_id": sp.id, "next_step": 5}


@router.post("/onboarding/{provider_id}/publish")
def onboarding_publish(provider_id: int,
                       current_user: User = Depends(get_current_active_user),
                       db: Session = Depends(get_db)):
    sp = db.query(ServiceProvider).filter(ServiceProvider.id == provider_id).first()
    if not sp or sp.user_id != current_user.id:
        raise HTTPException(403, "Not your profile")
    if not sp.service_area_cities or sp.hourly_rate <= 0:
        raise HTTPException(400, "Complete all onboarding steps before publishing")
    sp.is_active = True
    db.commit()
    return {"provider_id": sp.id, "is_active": True}


# ---------------- BLACKOUT DATES ----------------
class BlackoutCreate(BaseModel):
    start_datetime: datetime
    end_datetime: datetime
    reason: Optional[str] = None


@router.post("/{provider_id}/blackouts")
def add_blackout(provider_id: int, payload: BlackoutCreate,
                 current_user: User = Depends(get_current_active_user),
                 db: Session = Depends(get_db)):
    sp = db.query(ServiceProvider).filter(ServiceProvider.id == provider_id).first()
    if not sp or sp.user_id != current_user.id:
        raise HTTPException(403, "Not your profile")
    bo = ProviderBlackout(provider_id=provider_id,
                          start_datetime=payload.start_datetime,
                          end_datetime=payload.end_datetime,
                          reason=payload.reason)
    db.add(bo); db.commit(); db.refresh(bo)
    return {"id": bo.id}


@router.get("/{provider_id}/blackouts")
def list_blackouts(provider_id: int, db: Session = Depends(get_db)):
    rows = db.query(ProviderBlackout).filter(
        ProviderBlackout.provider_id == provider_id).all()
    return [{"id": b.id, "start": b.start_datetime, "end": b.end_datetime,
             "reason": b.reason} for b in rows]


# ---------------- CLAIM-LISTING FLOW (for scraped records) ----------------
class ClaimRequest(BaseModel):
    provider_id: int
    real_email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None


@router.post("/claim/request")
def claim_request(payload: ClaimRequest, db: Session = Depends(get_db)):
    """Step 1: a person says 'I own this listing.' We email them a token.
    The token, when consumed, transfers the listing to a freshly created (or
    existing) account that they then set a password on.
    """
    sp = db.query(ServiceProvider).filter(ServiceProvider.id == payload.provider_id).first()
    if not sp:
        raise HTTPException(404, "Listing not found")
    owner = db.query(User).filter(User.id == sp.user_id).first()
    if owner and owner.is_verified and not owner.email.endswith("@providers.venueplus.local"):
        raise HTTPException(400, "Listing already claimed")

    # Create or fetch the claimer user
    user = db.query(User).filter(User.email == payload.real_email).first()
    if not user:
        user = User(
            email=payload.real_email,
            hashed_password=get_password_hash(secrets.token_urlsafe(16)),
            first_name=payload.first_name,
            last_name=payload.last_name,
            phone=payload.phone,
            role=UserRole.SERVICE_PROVIDER,
            is_verified=False,
        )
        db.add(user); db.commit(); db.refresh(user)

    # Token (purpose includes provider id so we know what to transfer)
    tok = secrets.token_urlsafe(32)
    db.add(VerificationToken(
        user_id=user.id, token=tok,
        purpose=f"claim_provider:{sp.id}",
        expires_at=_now() + timedelta(hours=24),
    ))
    db.commit()

    # Email the claimer
    link = f"http://localhost:3000/claim?token={tok}"
    subject = f"Claim your VenuePlus listing: {sp.service_name}"
    html = f"""
    <p>Hi {payload.first_name},</p>
    <p>You requested to claim the VenuePlus listing for <strong>{sp.service_name}</strong>.</p>
    <p>Click below to verify and set your password:</p>
    <p><a href="{link}">Claim my listing</a></p>
    <p>This link expires in 24 hours.</p>
    """
    email_svc.send(payload.real_email, subject, html)
    return {"ok": True}


class ClaimConfirm(BaseModel):
    token: str
    new_password: str


@router.post("/claim/confirm")
def claim_confirm(payload: ClaimConfirm, db: Session = Depends(get_db)):
    if len(payload.new_password) < 8:
        raise HTTPException(400, "Password must be at least 8 characters")
    tok = db.query(VerificationToken).filter(
        VerificationToken.token == payload.token).first()
    if not tok or tok.used_at or (tok.expires_at and (tok.expires_at if tok.expires_at.tzinfo else tok.expires_at.replace(tzinfo=timezone.utc)) < _now()):
        raise HTTPException(400, "Invalid or expired token")
    if not tok.purpose.startswith("claim_provider:"):
        raise HTTPException(400, "Wrong token purpose")

    provider_id = int(tok.purpose.split(":", 1)[1])
    sp = db.query(ServiceProvider).filter(ServiceProvider.id == provider_id).first()
    if not sp:
        raise HTTPException(404, "Listing missing")

    user = db.query(User).filter(User.id == tok.user_id).first()
    user.hashed_password = get_password_hash(payload.new_password)
    user.is_verified = True

    # Transfer the SP to this user
    sp.user_id = user.id
    sp.is_active = True
    tok.used_at = _now()
    db.commit()
    return {"ok": True, "provider_id": sp.id, "user_id": user.id}
