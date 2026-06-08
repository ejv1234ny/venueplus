"""Shared pytest fixtures.

Spins up a fresh in-memory SQLite DB per test, builds every table from the
app's ``Base.metadata`` (no Alembic), overrides ``get_db``, and exposes a
``TestClient`` plus an admin JWT. Run from the ``backend/`` directory::

    python -m pytest tests/ -q
"""
import os
import sys

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Ensure `from main import app` etc. resolve when pytest is invoked oddly.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import models  # noqa: E402,F401  (register marketplace tables on Base)
import models_agents  # noqa: E402,F401  (register agent tables on Base)
from database import Base, get_db  # noqa: E402
from main import app  # noqa: E402
from auth import create_access_token, get_password_hash  # noqa: E402
from models import User, UserRole  # noqa: E402


@pytest.fixture()
def db_factory():
    """Fresh in-memory DB shared across connections for one test."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False,
                                       bind=engine)
    yield TestingSessionLocal
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture()
def session(db_factory):
    db = db_factory()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture()
def client(db_factory):
    def _override_get_db():
        db = db_factory()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def make_user(session, email, role=UserRole.RENTER, **kw):
    user = User(
        email=email,
        hashed_password=get_password_hash("pw"),
        first_name=kw.pop("first_name", "Test"),
        last_name=kw.pop("last_name", "User"),
        role=role,
        is_active=kw.pop("is_active", True),
        is_verified=kw.pop("is_verified", True),
        **kw,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture()
def admin_user(session):
    return make_user(session, "admin@venueplus.test", role=UserRole.ADMIN)


@pytest.fixture()
def admin_headers(admin_user):
    token = create_access_token({"sub": admin_user.email})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def renter_headers(session):
    user = make_user(session, "renter@venueplus.test", role=UserRole.RENTER)
    token = create_access_token({"sub": user.email})
    return {"Authorization": f"Bearer {token}"}
