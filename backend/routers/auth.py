import os
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from database import get_db
from models import User, VerificationToken
from schemas import UserCreate, Token
from auth import (
    get_password_hash, verify_password, create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES, get_current_active_user, rate_limit,
)
from services import email as email_svc

router = APIRouter()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
EMAIL_VERIFY_TTL = timedelta(hours=24)
PASSWORD_RESET_TTL = timedelta(hours=1)


def _now():
    return datetime.now(timezone.utc)


def _aware(dt):
    if dt is None: return dt
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def _new_token(db: Session, user_id: int, purpose: str, ttl: timedelta) -> str:
    tok = secrets.token_urlsafe(32)
    db.add(VerificationToken(
        user_id=user_id, token=tok, purpose=purpose,
        expires_at=_now() + ttl,
    ))
    db.commit()
    return tok


def _consume_token(db: Session, token: str, purpose: str) -> User:
    row = db.query(VerificationToken).filter(
        VerificationToken.token == token,
        VerificationToken.purpose == purpose,
    ).first()
    if not row:
        raise HTTPException(400, "Invalid token")
    if row.used_at:
        raise HTTPException(400, "Token already used")
    if _aware(row.expires_at) < _now():
        raise HTTPException(400, "Token expired")
    user = db.query(User).filter(User.id == row.user_id).first()
    if not user:
        raise HTTPException(400, "User not found")
    row.used_at = _now()
    db.commit()
    return user


# ---------------- REGISTER ----------------
@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, request: Request, db: Session = Depends(get_db)):
    if not rate_limit(f"register:{request.client.host}", 10, 3600):
        raise HTTPException(429, "Too many signups, try later")
    if len(user_data.password) < 8:
        raise HTTPException(400, "Password must be at least 8 characters")
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(400, "Email already registered")

    new_user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone=user_data.phone,
        role=user_data.role,
        bio=user_data.bio,
        is_verified=False,
    )
    db.add(new_user); db.commit(); db.refresh(new_user)

    # Send verification email
    tok = _new_token(db, new_user.id, "email_verify", EMAIL_VERIFY_TTL)
    link = f"{FRONTEND_URL}/verify-email?token={tok}"
    subject, html, text = email_svc.render_verification(new_user.first_name, link)
    email_svc.send(new_user.email, subject, html, text)

    access_token = create_access_token(
        {"sub": new_user.email},
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer", "user": new_user}


# ---------------- LOGIN ----------------
@router.post("/login", response_model=Token)
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(),
          db: Session = Depends(get_db)):
    if not rate_limit(f"login:{request.client.host}", 20, 600):
        raise HTTPException(429, "Too many login attempts")
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(401, "Incorrect email or password",
                            headers={"WWW-Authenticate": "Bearer"})
    if not user.is_active:
        raise HTTPException(400, "Inactive user")
    access_token = create_access_token(
        {"sub": user.email},
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user}


# ---------------- EMAIL VERIFY ----------------
class VerifyEmailRequest(BaseModel):
    token: str


@router.post("/verify-email")
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    user = _consume_token(db, payload.token, "email_verify")
    user.is_verified = True
    db.commit()
    return {"ok": True, "verified": True}


@router.post("/resend-verification")
def resend_verification(current_user: User = Depends(get_current_active_user),
                        db: Session = Depends(get_db)):
    if current_user.is_verified:
        return {"ok": True, "verified": True}
    if not rate_limit(f"resend:{current_user.id}", 5, 3600):
        raise HTTPException(429, "Too many resend requests")
    tok = _new_token(db, current_user.id, "email_verify", EMAIL_VERIFY_TTL)
    link = f"{FRONTEND_URL}/verify-email?token={tok}"
    subject, html, text = email_svc.render_verification(current_user.first_name, link)
    email_svc.send(current_user.email, subject, html, text)
    return {"ok": True}


# ---------------- PASSWORD RESET ----------------
class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str


@router.post("/forgot-password")
def forgot_password(payload: PasswordResetRequest, request: Request,
                    db: Session = Depends(get_db)):
    if not rate_limit(f"forgot:{request.client.host}", 10, 3600):
        raise HTTPException(429, "Too many requests")
    user = db.query(User).filter(User.email == payload.email).first()
    # Always return ok to prevent email enumeration
    if user:
        tok = _new_token(db, user.id, "password_reset", PASSWORD_RESET_TTL)
        link = f"{FRONTEND_URL}/reset-password?token={tok}"
        subject, html, text = email_svc.render_password_reset(user.first_name, link)
        email_svc.send(user.email, subject, html, text)
    return {"ok": True}


@router.post("/reset-password")
def reset_password(payload: PasswordResetConfirm, db: Session = Depends(get_db)):
    if len(payload.new_password) < 8:
        raise HTTPException(400, "Password must be at least 8 characters")
    user = _consume_token(db, payload.token, "password_reset")
    user.hashed_password = get_password_hash(payload.new_password)
    db.commit()
    return {"ok": True}


@router.get("/me")
def me(current_user: User = Depends(get_current_active_user)):
    return current_user
