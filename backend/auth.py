from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import os

from database import get_db
from models import User

# Secret key for JWT - in production, use environment variable
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Ensure user is active"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def require_role(*roles):
    """Dependency factory: require current user to have one of these roles."""
    from models import UserRole
    role_set = {UserRole(r) if isinstance(r, str) else r for r in roles}
    def _checker(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role not in role_set:
            raise HTTPException(status_code=403, detail="Insufficient role")
        return current_user
    return _checker


def require_admin(current_user: User = Depends(get_current_active_user)) -> User:
    from models import UserRole
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")
    return current_user


# ---------- Simple in-memory rate limiter ----------
import time
from collections import defaultdict, deque
_RL_BUCKETS: dict = defaultdict(deque)


def rate_limit(key: str, max_calls: int, window_seconds: int) -> bool:
    """Returns True if allowed, False if over the limit."""
    now = time.time()
    q = _RL_BUCKETS[key]
    while q and q[0] < now - window_seconds:
        q.popleft()
    if len(q) >= max_calls:
        return False
    q.append(now)
    return True
