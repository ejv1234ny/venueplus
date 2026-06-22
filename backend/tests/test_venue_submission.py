"""Venue-submission backend: required_services persistence + booking enforcement."""
from datetime import datetime, timezone, timedelta

from models import User, UserRole, Venue, ServiceProvider, ServiceCategory
from auth import create_access_token, get_password_hash


def _user(session, email, role):
    u = User(email=email, hashed_password=get_password_hash("pw"),
             first_name="T", last_name="U", role=role,
             is_active=True, is_verified=True)
    session.add(u); session.commit(); session.refresh(u)
    return u


def _headers(email):
    return {"Authorization": f"Bearer {create_access_token({'sub': email})}"}


def _provider(session, email, category):
    u = _user(session, email, UserRole.SERVICE_PROVIDER)
    sp = ServiceProvider(user_id=u.id, service_category=category,
                         service_name=f"{category.value} pro", description="d",
                         hourly_rate=50.0, minimum_hours=1,
                         service_area_cities=["Austin"], availability={},
                         images=[], is_active=True)
    session.add(sp); session.commit(); session.refresh(sp)
    return sp


def test_create_persists_required_services(client, session):
    owner = _user(session, "owner1@t.test", UserRole.VENUE_OWNER)
    payload = {
        "title": "Rooftop", "description": "Nice", "venue_type": "rooftop",
        "address": "1 Main", "city": "Austin", "state": "TX", "zip_code": "78701",
        "capacity": 50, "price_per_hour": 100.0, "minimum_hours": 1,
        "amenities": ["bar"], "required_services": ["security"], "images": [],
    }
    r = client.post("/api/venues/", json=payload, headers=_headers(owner.email))
    assert r.status_code == 201, r.text
    assert r.json()["required_services"] == ["security"]
    vid = r.json()["id"]
    assert client.get(f"/api/venues/{vid}").json()["required_services"] == ["security"]


def test_booking_enforces_required_services(client, session):
    owner = _user(session, "owner2@t.test", UserRole.VENUE_OWNER)
    venue = Venue(owner_id=owner.id, title="V", description="d", venue_type="rooftop",
                  address="a", city="Austin", state="TX", zip_code="78701",
                  capacity=50, price_per_hour=100.0, minimum_hours=1,
                  amenities=[], required_services=["security"], images=[], is_active=True)
    session.add(venue); session.commit(); session.refresh(venue)

    renter = _user(session, "renter2@t.test", UserRole.RENTER)
    sec = _provider(session, "sec@t.test", ServiceCategory.SECURITY)
    cat = _provider(session, "cat@t.test", ServiceCategory.CATERING)

    start = (datetime.now(timezone.utc) + timedelta(days=2)).replace(microsecond=0)
    end = start + timedelta(hours=3)
    base = {"venue_id": venue.id, "start_datetime": start.isoformat(),
            "end_datetime": end.isoformat()}

    # Missing the required 'security' category -> rejected
    r1 = client.post("/api/bookings/", headers=_headers(renter.email),
                     json={**base, "services": [{"service_provider_id": cat.id, "hours": 3}]})
    assert r1.status_code == 400, r1.text
    assert "security" in r1.json()["detail"].lower()

    # Includes a security provider -> accepted
    r2 = client.post("/api/bookings/", headers=_headers(renter.email),
                     json={**base, "services": [{"service_provider_id": sec.id, "hours": 3}]})
    assert r2.status_code == 201, r2.text


def test_ideal_for_persist_and_search(client, session):
    owner = _user(session, "owner3@t.test", UserRole.VENUE_OWNER)

    def mk(title, ideal):
        r = client.post("/api/venues/", headers=_headers(owner.email), json={
            "title": title, "description": "d", "venue_type": "rooftop", "address": "x",
            "city": "Austin", "state": "TX", "zip_code": "78701", "capacity": 50,
            "price_per_hour": 100.0, "minimum_hours": 1, "ideal_for": ideal, "images": []})
        assert r.status_code == 201, r.text
        return r.json()

    wed = mk("Wedding Hall", ["wedding", "engagement_party"])
    mk("Reception Only", ["wedding_reception"])  # must NOT match a "wedding" search
    assert wed["ideal_for"] == ["wedding", "engagement_party"]

    def titles(r):
        return sorted(v["title"] for v in r.json())

    # exact slug match (quote-bounded): 'wedding' != 'wedding_reception'
    assert titles(client.get("/api/venues/", params={"event_type": "wedding"})) == ["Wedding Hall"]
    assert titles(client.get("/api/venues/", params={"event_type": "wedding_reception"})) == ["Reception Only"]
    assert titles(client.get("/api/venues/", params={"event_type": "engagement_party"})) == ["Wedding Hall"]
