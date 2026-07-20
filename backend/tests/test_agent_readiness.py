"""Market readiness gate + scheduled seeding cron."""
from agents import readiness, tools as agent_tools
from agents.readiness import REQUIRED_CATEGORIES, MIN_ACTIVE_VENUES
from services import provider_leads
from models import User, UserRole, Venue, ServiceProvider, ServiceCategory
from auth import get_password_hash


def _owner(session):
    u = User(email="own@venueplus.test", hashed_password=get_password_hash("pw"),
             first_name="O", last_name="W", role=UserRole.VENUE_OWNER,
             is_active=True, is_verified=True)
    session.add(u); session.flush()
    return u


def _make_market_ready(session, city="Austin"):
    owner = _owner(session)
    for i in range(MIN_ACTIVE_VENUES):
        session.add(Venue(owner_id=owner.id, title=f"V{i}", description="d",
                          venue_type="loft", address="1 St", city=city, state="TX",
                          zip_code="00000", capacity=50, price_per_hour=100.0,
                          minimum_hours=1, images=[], amenities=[], is_active=True))
    for cat in REQUIRED_CATEGORIES:
        pu = User(email=f"{cat}@venueplus.test", hashed_password=get_password_hash("pw"),
                  first_name="P", last_name=cat, role=UserRole.SERVICE_PROVIDER,
                  is_active=True, is_verified=True)
        session.add(pu); session.flush()
        session.add(ServiceProvider(user_id=pu.id, service_category=ServiceCategory(cat),
                                    service_name=f"{cat} co", description="d",
                                    hourly_rate=50.0, minimum_hours=1,
                                    service_area_cities=[city], availability={},
                                    images=[], rating=0.0, total_reviews=0, is_active=True))
    session.commit()


def test_empty_market_not_ready(session):
    r = readiness.market_readiness(session, "Austin")
    assert r["ready_for_public"] is False
    assert r["active_venues"] == 0
    assert set(r["missing_categories"]) == set(REQUIRED_CATEGORIES)
    assert r["gaps"]


def test_seeded_market_is_ready(session):
    _make_market_ready(session)
    r = readiness.market_readiness(session, "Austin")
    assert r["ready_for_public"] is True
    assert r["active_venues"] >= MIN_ACTIVE_VENUES
    assert r["missing_categories"] == []
    assert "Ready" in r["recommendation"]


def test_lead_supply_does_not_count_as_ready(session):
    # an inactive (lead) venue must NOT count toward readiness
    owner = _owner(session)
    session.add(Venue(owner_id=owner.id, title="Draft", description="d",
                      venue_type="loft", address="1 St", city="Austin", state="TX",
                      zip_code="00000", capacity=0, price_per_hour=0.0,
                      minimum_hours=1, images=[], amenities=[], is_active=False))
    session.commit()
    r = readiness.market_readiness(session, "Austin")
    assert r["active_venues"] == 0 and r["lead_venues"] == 1
    assert r["ready_for_public"] is False


# --- cron endpoint --------------------------------------------------------- #
def _patch_reads_empty(monkeypatch):
    monkeypatch.setattr(agent_tools, "search_osm_venues", lambda a, c: {"ok": True, "candidates": []})
    monkeypatch.setattr(agent_tools, "list_existing_venues", lambda a, c: {"ok": True, "venues": []})
    monkeypatch.setattr(agent_tools, "list_existing_providers",
                        lambda a, c: {"ok": True, "providers": [], "missing_categories": []})
    monkeypatch.setattr(provider_leads, "gather_candidates",
                        lambda city, sources, google_key=None: ([], {}))


def test_seed_cron_rejects_bad_secret(client, monkeypatch):
    monkeypatch.setenv("CRON_SECRET", "s3cret")
    r = client.post("/api/agents/seed/cron?city=Austin",
                    headers={"Authorization": "Bearer wrong"})
    assert r.status_code == 401


def test_seed_cron_runs_and_reports_readiness(client, monkeypatch):
    _patch_reads_empty(monkeypatch)
    monkeypatch.delenv("CRON_SECRET", raising=False)   # no secret -> open
    r = client.post("/api/agents/seed/cron?city=Austin")
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["ok"] and body["city"] == "Austin"
    assert "readiness" in body and body["readiness"]["ready_for_public"] is False
