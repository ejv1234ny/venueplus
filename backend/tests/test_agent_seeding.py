"""Agent seeding loop: the data-threaded operate() path actually creates leads.

These lock the fix for the read→write disconnect — before it, agents planned
context-free actions and seeded nothing. Network reads (OSM/Overpass, Google
Places) are monkeypatched so the tests are offline and deterministic; the write
path (create_venue_lead / create_lead) runs for real against the test DB.
"""
import pytest

from agents import tools as agent_tools
from agents.specialists import VenuesAgent, ProvidersAgent
from agents import orchestrator
from agents.types import RiskLevel
from models import Venue, ServiceProvider


# --- fixtures: fake public candidates -------------------------------------- #
_VENUE_CANDIDATES = [
    {"name": "The Eastside Loft", "type": "event_space", "lat": 30.26, "lon": -97.72,
     "source": "osm"},
    {"name": "Riverside Gallery", "type": "gallery", "lat": 30.25, "lon": -97.75,
     "source": "osm"},
    {"name": "The Eastside Loft", "type": "event_space", "source": "osm"},  # dup
]

_PROVIDER_CANDIDATES = [
    {"name": "Austin Event Catering", "category": "catering", "source": "google_places",
     "tags": {"phone": "+15125550001", "website": "https://ex.com"}},
    {"name": "Lens & Light Photo", "tags": {"craft": "photographer"}, "source": "osm"},
    {"name": "Unclassifiable Thing", "tags": {"shop": "hardware"}, "source": "osm"},  # dropped
]


@pytest.fixture()
def patched_reads(monkeypatch):
    monkeypatch.setattr(agent_tools, "search_osm_venues",
                        lambda args, ctx: {"ok": True, "live": True,
                                           "candidates": list(_VENUE_CANDIDATES)})
    monkeypatch.setattr(agent_tools, "list_existing_venues",
                        lambda args, ctx: {"ok": True, "venues": []})
    monkeypatch.setattr(agent_tools, "list_existing_providers",
                        lambda args, ctx: {"ok": True, "providers": [], "coverage": {},
                                           "missing_categories": ["catering", "security"]})
    from services import provider_leads
    monkeypatch.setattr(provider_leads, "gather_candidates",
                        lambda city, sources, google_key=None: (list(_PROVIDER_CANDIDATES), {}))


# --- unit: operate() emits data-bearing actions ---------------------------- #
def test_venues_operate_threads_candidates_and_dedupes(session, patched_reads):
    actions = VenuesAgent().operate(session, "Austin")
    # discovery now unifies into venue leads (sidecar + draft)
    assert [a.tool for a in actions] == ["create_venue_prospect", "create_venue_prospect"]
    # each write carries the real candidate (not just {"city": ...})
    names = {a.args["candidate"]["name"] for a in actions}
    assert names == {"The Eastside Loft", "Riverside Gallery"}  # dup collapsed
    assert all(a.risk == RiskLevel.INTERNAL_WRITE for a in actions)


def test_venues_operate_skips_existing(session, monkeypatch, patched_reads):
    monkeypatch.setattr(agent_tools, "list_existing_venues",
                        lambda args, ctx: {"ok": True,
                                           "venues": [{"title": "The Eastside Loft"}]})
    actions = VenuesAgent().operate(session, "Austin")
    names = {a.args["candidate"]["name"] for a in actions}
    assert names == {"Riverside Gallery"}


def test_providers_operate_invites_new_candidates(session, patched_reads):
    actions = ProvidersAgent().operate(session, "Austin")
    invites = [a for a in actions if a.tool == "create_provider_invite"]
    # both classifiable candidates become invites; the unclassifiable one is dropped
    assert {a.args["candidate"]["name"] for a in invites} == {
        "Austin Event Catering", "Lens & Light Photo"}
    # missing-coverage category (catering) is prioritised first
    assert invites[0].args["candidate"]["name"] == "Austin Event Catering"
    # no existing leads in the DB yet -> nothing to outreach this pass
    assert not [a for a in actions if a.tool == "send_provider_lead_outreach"]


def test_providers_operate_outreaches_existing_leads(session, patched_reads):
    from services import provider_leads as pl
    from models import ProviderOutreach
    lead = pl.create_lead(session, "Austin", {
        "name": "Copper Shaker", "category": "bartending",
        "tags": {"phone": "(512) 555-0199"}})
    session.commit()
    actions = ProvidersAgent().operate(session, "Austin")
    outreach = [a for a in actions if a.tool == "send_provider_lead_outreach"]
    assert any(a.args["lead_id"] == lead.id for a in outreach)
    assert all(a.risk == RiskLevel.OUTBOUND for a in outreach)
    # once recorded as contacted, it's not texted again
    session.add(ProviderOutreach(provider_id=lead.id))
    session.commit()
    again = ProvidersAgent().operate(session, "Austin")
    assert not any(a.args["lead_id"] == lead.id
                   for a in again if a.tool == "send_provider_lead_outreach")


# --- integration: a live seed run creates real inactive lead rows ---------- #
def test_run_seed_live_seeds_real_leads(session, monkeypatch, patched_reads):
    monkeypatch.setenv("AGENTS_LIVE", "true")   # writes perform real side effects
    # a pre-existing venue prospect with contact -> the venues agent should queue
    # (and gate) outreach to it this run
    from models import VenueLead
    session.add(VenueLead(name="Prospect X", city="Austin", email="x@example.com"))
    session.commit()

    run = orchestrator.run_seed(session, "Austin")

    venues = session.query(Venue).all()
    providers = session.query(ServiceProvider).all()
    # real draft venues + provider leads were created, all INACTIVE (not live supply)
    assert {v.title for v in venues} == {"The Eastside Loft", "Riverside Gallery"}
    assert all(v.is_active is False for v in venues)
    assert {p.service_name for p in providers} == {"Austin Event Catering", "Lens & Light Photo"}
    assert all(p.is_active is False for p in providers)
    # outbound outreach did NOT auto-send under the default posture — it escalated
    assert run.summary["needs_approval"] >= 1
