"""Tests for the admin dashboard aggregate endpoints (/api/admin/dashboard)."""
from datetime import datetime, timedelta

import pytest

from conftest import make_user
from models import (UserRole, Venue, ServiceProvider, ServiceCategory, Event,
                    Booking, BookingStatus, BookingService, VenueRequirement,
                    Payment, PaymentStatus)


@pytest.fixture()
def seeded(session, admin_user):
    """Seed a small but representative marketplace and return key ids."""
    owner = make_user(session, "owner@t.test", role=UserRole.VENUE_OWNER)
    renter = make_user(session, "renter@t.test", role=UserRole.RENTER)

    venue_a = Venue(owner_id=owner.id, title="Rooftop A", description="d",
                    venue_type="rooftop", address="1 St", city="Austin TX",
                    state="TX", zip_code="78701", capacity=100,
                    price_per_hour=200, is_active=True)
    venue_b = Venue(owner_id=owner.id, title="Hall B", description="d",
                    venue_type="hall", address="2 St", city="Austin TX",
                    state="TX", zip_code="78702", capacity=50,
                    price_per_hour=100, is_active=False)
    session.add_all([venue_a, venue_b])
    session.commit()

    p1 = ServiceProvider(user_id=owner.id, service_category=ServiceCategory.CATERING,
                         service_name="Cater", description="d", hourly_rate=50,
                         service_area_cities=["Austin TX", "Dallas TX"], is_active=True)
    p2 = ServiceProvider(user_id=owner.id, service_category=ServiceCategory.DJ,
                         service_name="DJ", description="d", hourly_rate=40,
                         service_area_cities=["Austin TX"], is_active=True)
    p3 = ServiceProvider(user_id=owner.id, service_category=ServiceCategory.SECURITY,
                         service_name="Sec", description="d", hourly_rate=30,
                         service_area_cities=["Houston TX"], is_active=False)
    session.add_all([p1, p2, p3])
    session.commit()

    session.add_all([
        Event(host_id=renter.id, title="Wedding", event_type="wedding",
              expected_guests=80),
        Event(host_id=renter.id, title="Offsite", event_type="corporate",
              expected_guests=40),
    ])
    # venue A requires catering (mandatory)
    session.add(VenueRequirement(venue_id=venue_a.id, service_provider_id=p1.id,
                                 service_category=ServiceCategory.CATERING,
                                 is_mandatory=True))
    session.commit()

    now = datetime.utcnow()
    b1 = Booking(renter_id=renter.id, venue_id=venue_a.id,
                 start_datetime=now, end_datetime=now + timedelta(hours=4),
                 total_hours=4, venue_cost=800, total_cost=1000,
                 status=BookingStatus.CONFIRMED)
    b2 = Booking(renter_id=renter.id, venue_id=venue_a.id,
                 start_datetime=now, end_datetime=now + timedelta(hours=2),
                 total_hours=2, venue_cost=400, total_cost=400,
                 status=BookingStatus.PENDING)
    session.add_all([b1, b2])
    session.commit()

    # b1 has its mandatory catering service booked -> fully serviced.
    session.add(BookingService(booking_id=b1.id, service_provider_id=p1.id,
                               hours=4, cost=200, is_mandatory=True))
    # b1 captured payment -> GMV; b2 still pending -> excluded.
    session.add(Payment(booking_id=b1.id, subtotal_cents=10000,
                        platform_fee_cents=1500, stripe_fee_cents=0,
                        total_charged_cents=11500, status=PaymentStatus.CAPTURED,
                        captured_at=now))
    session.add(Payment(booking_id=b2.id, subtotal_cents=4000,
                        platform_fee_cents=600, stripe_fee_cents=0,
                        total_charged_cents=4600, status=PaymentStatus.PENDING))
    session.commit()
    return {"venue_a": venue_a.id, "renter": renter.id}


def test_dashboard_requires_admin(client, renter_headers):
    assert client.get("/api/admin/dashboard/metrics").status_code == 401
    assert client.get("/api/admin/dashboard/metrics",
                      headers=renter_headers).status_code == 403


def test_metrics_shape_and_values(client, admin_headers, seeded):
    m = client.get("/api/admin/dashboard/metrics", headers=admin_headers).json()

    assert set(m) == {"supply", "demand", "liquidity", "agents", "leads"}
    assert set(m["leads"]) == {"venue_leads", "provider_leads",
                               "creator_leads", "outreach_queued"}

    assert m["supply"]["active_venues"] == 1          # venue_b is inactive
    assert m["supply"]["active_providers"] == 2       # p3 is inactive
    assert m["supply"]["providers_by_category"] == {"catering": 1, "dj": 1}
    assert m["supply"]["providers_by_city"]["Austin TX"] == 2
    assert m["supply"]["providers_by_city"]["Dallas TX"] == 1

    assert m["demand"]["total_bookings"] == 2
    assert m["demand"]["bookings_30d"] == 2
    assert m["demand"]["gmv_cents"] == 11500          # only the captured payment
    assert m["demand"]["gmv_usd"] == 115.0
    assert m["demand"]["platform_fees_cents"] == 1500
    assert m["demand"]["events_total"] == 2
    assert m["demand"]["events_by_type"] == {"wedding": 1, "corporate": 1}

    assert m["liquidity"]["fully_serviced_bookings"] == 1   # b1 only
    assert m["liquidity"]["unserviceable_bookings"] == 1    # b2 missing catering
    assert m["liquidity"]["fully_serviced_pct"] == 50.0
    assert m["liquidity"]["bookings_per_active_venue"] == 2.0

    assert m["agents"]["fleet_enabled"] is True
    assert m["agents"]["total_runs"] == 0


def test_metrics_reflects_agent_runs(client, admin_headers, seeded):
    client.post("/api/agents/goals", json={"goal": "Expand into Austin",
                                            "city": "Austin TX"},
                headers=admin_headers)
    m = client.get("/api/admin/dashboard/metrics", headers=admin_headers).json()
    assert m["agents"]["total_runs"] == 1
    assert m["agents"]["runs_7d"] == 1
    assert m["agents"]["open_escalations"] == 3  # one outbound per agent


def test_agents_status(client, admin_headers, seeded):
    client.post("/api/agents/goals", json={"goal": "Expand into Austin"},
                headers=admin_headers)
    rows = client.get("/api/admin/dashboard/agents/status",
                      headers=admin_headers).json()
    by_agent = {r["agent"]: r for r in rows}
    assert set(by_agent) == {"coo", "venues", "providers", "marketing"}
    # each worker had one outbound escalation -> the job needs approval
    assert by_agent["venues"]["jobs_needs_approval"] == 1
    assert by_agent["venues"]["open_escalations"] == 1
    assert by_agent["coo"]["open_escalations"] == 3
    assert by_agent["venues"]["last_run"] is not None


def test_dashboard_escalations_joined_context(client, admin_headers, seeded):
    client.post("/api/agents/goals", json={"goal": "Expand into Austin"},
                headers=admin_headers)
    rows = client.get("/api/admin/dashboard/escalations?status=open",
                      headers=admin_headers).json()
    assert len(rows) == 3
    e = rows[0]
    assert set(e) >= {"id", "agent", "tool", "risk", "decision", "args",
                      "reason", "status", "run_id", "run_goal", "job_status"}
    assert e["decision"] == "require_approval"
    assert e["run_goal"] == "Expand into Austin"

    # 'all' is a superset of 'open'
    all_rows = client.get("/api/admin/dashboard/escalations?status=all",
                          headers=admin_headers).json()
    assert len(all_rows) >= len(rows)


def test_timeseries_bookings_and_gmv(client, admin_headers, seeded):
    ts = client.get("/api/admin/dashboard/timeseries?metric=bookings&days=30",
                    headers=admin_headers).json()
    assert ts["metric"] == "bookings"
    assert len(ts["points"]) == 30
    assert sum(p["value"] for p in ts["points"]) == 2  # both bookings today

    gmv = client.get("/api/admin/dashboard/timeseries?metric=gmv&days=30",
                     headers=admin_headers).json()
    assert sum(p["value"] for p in gmv["points"]) == 115.0

    bad = client.get("/api/admin/dashboard/timeseries?metric=nope",
                     headers=admin_headers)
    assert bad.status_code == 422
