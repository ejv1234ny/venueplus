"""Unclaimed (seeded directory) provider listings: exposed via is_claimed, not bookable."""
from datetime import datetime, timezone, timedelta

from models import User, UserRole, Venue, ServiceProvider, ServiceCategory
from auth import create_access_token, get_password_hash


def _user(session, email, role):
    u = User(email=email, hashed_password=get_password_hash("pw"), first_name="T",
             last_name="U", role=role, is_active=True, is_verified=True)
    session.add(u); session.commit(); session.refresh(u)
    return u


def _headers(email):
    return {"Authorization": f"Bearer {create_access_token({'sub': email})}"}


def _provider(session, email, claimed=True):
    u = _user(session, email, UserRole.SERVICE_PROVIDER)
    sp = ServiceProvider(user_id=u.id, service_category=ServiceCategory.DJ,
                         service_name="A DJ", description="d", hourly_rate=50.0,
                         minimum_hours=1, service_area_cities=["Austin"],
                         availability={}, images=[], is_active=True, is_claimed=claimed)
    session.add(sp); session.commit(); session.refresh(sp)
    return sp


def test_unclaimed_provider_not_bookable(client, session):
    owner = _user(session, "owner@u.test", UserRole.VENUE_OWNER)
    venue = Venue(owner_id=owner.id, title="V", description="d", venue_type="rooftop",
                  address="a", city="Austin", state="TX", zip_code="z", capacity=50,
                  price_per_hour=100.0, minimum_hours=1, is_active=True)
    session.add(venue); session.commit(); session.refresh(venue)
    renter = _user(session, "renter@u.test", UserRole.RENTER)
    unclaimed = _provider(session, "unclaimed@u.test", claimed=False)
    claimed = _provider(session, "claimed@u.test", claimed=True)

    start = (datetime.now(timezone.utc) + timedelta(days=2)).replace(microsecond=0)
    end = start + timedelta(hours=3)
    base = {"venue_id": venue.id, "start_datetime": start.isoformat(), "end_datetime": end.isoformat()}

    r1 = client.post("/api/bookings/", headers=_headers(renter.email),
                     json={**base, "services": [{"service_provider_id": unclaimed.id, "hours": 3}]})
    assert r1.status_code == 400, r1.text
    assert "unclaimed" in r1.text.lower()

    r2 = client.post("/api/bookings/", headers=_headers(renter.email),
                     json={**base, "services": [{"service_provider_id": claimed.id, "hours": 3}]})
    assert r2.status_code == 201, r2.text


def test_is_claimed_in_services_response(client, session):
    _provider(session, "seed@u.test", claimed=False)
    r = client.get("/api/services/?limit=50")
    assert r.status_code == 200, r.text
    sp = next(s for s in r.json() if s["service_name"] == "A DJ")
    assert sp["is_claimed"] is False
