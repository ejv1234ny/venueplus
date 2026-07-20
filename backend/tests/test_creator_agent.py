"""Creator/Influencer agent: managed-pipeline seeding.

Discovery isn't automatable, so the agent works an imported lead pipeline:
draft outreach for new leads (gate-send when an email exists) and draft a
ready-to-publish Creator Event once a lead commits.
"""
import pytest

from agents import tools as agent_tools
from agents.specialists import CreatorAgent
from agents import orchestrator
from agents.types import RiskLevel
from services import creator_leads as cl, provider_leads
from models_creator import CreatorLead, CreatorLeadStatus, CreatorEvent, TicketTier
from models import User, UserRole


def _seed_leads(session):
    cl.import_leads(session, "Austin", [
        {"name": "Ava Wellness", "handle": "avawell", "platform": "instagram",
         "niche": "wellness", "followers": 8000, "email": "ava@example.com"},
        {"name": "Taco Trailblazer", "handle": "tacotrail", "niche": "food",
         "followers": 5000},  # no email -> no outbound action
    ])
    session.commit()


# --- import ---------------------------------------------------------------- #
def test_import_leads_creates_and_dedupes(session):
    r1 = cl.import_leads(session, "Austin", [{"name": "Ava", "handle": "avawell"}])
    r2 = cl.import_leads(session, "Austin", [{"name": "Ava", "handle": "avawell"}])
    assert r1["created"] == 1 and r2["created"] == 0   # idempotent by handle+city
    assert session.query(CreatorLead).count() == 1


# --- operate() emits the right pipeline actions ---------------------------- #
def test_creator_operate_drafts_and_gates_outreach(session):
    _seed_leads(session)
    actions = CreatorAgent().operate(session, "Austin")
    tools_used = [a.tool for a in actions]
    # both new leads get an outreach draft; only the one with an email gets a send
    assert tools_used.count("draft_creator_outreach") == 2
    sends = [a for a in actions if a.tool == "send_creator_outreach_email"]
    assert len(sends) == 1
    assert sends[0].risk == RiskLevel.OUTBOUND


def test_creator_operate_drafts_event_for_committed(session):
    _seed_leads(session)
    lead = session.query(CreatorLead).filter(CreatorLead.handle == "avawell").first()
    lead.status = CreatorLeadStatus.COMMITTED
    session.commit()
    actions = CreatorAgent().operate(session, "Austin")
    assert any(a.tool == "draft_creator_event" and a.args["lead_id"] == lead.id
               for a in actions)


# --- draft_event_for_lead builds a real DRAFT event ------------------------ #
def test_draft_event_for_lead_creates_draft_and_tiers(session):
    _seed_leads(session)
    lead = session.query(CreatorLead).filter(CreatorLead.handle == "avawell").first()
    ev = cl.draft_event_for_lead(session, lead)
    session.commit()
    assert ev.status.value == "draft"
    # placeholder creator account, inactive until claimed
    creator = session.query(User).filter(User.id == ev.creator_id).first()
    assert creator.role == UserRole.CREATOR and creator.is_active is False
    assert session.query(TicketTier).filter(
        TicketTier.creator_event_id == ev.id).count() == 2
    # idempotent
    assert cl.draft_event_for_lead(session, lead).id == ev.id


# --- integration: a live seed run works the creator pipeline for real ------ #
def test_run_seed_live_processes_creator_pipeline(session, monkeypatch):
    # isolate the creator agent: make venues/providers find nothing
    monkeypatch.setattr(agent_tools, "search_osm_venues",
                        lambda a, c: {"ok": True, "candidates": []})
    monkeypatch.setattr(agent_tools, "list_existing_venues",
                        lambda a, c: {"ok": True, "venues": []})
    monkeypatch.setattr(agent_tools, "list_existing_providers",
                        lambda a, c: {"ok": True, "providers": [], "missing_categories": []})
    monkeypatch.setattr(provider_leads, "gather_candidates",
                        lambda city, sources, google_key=None: ([], {}))
    monkeypatch.setenv("AGENTS_LIVE", "true")

    _seed_leads(session)
    # commit one lead so an event gets drafted this run
    lead = session.query(CreatorLead).filter(CreatorLead.handle == "avawell").first()
    lead.status = CreatorLeadStatus.COMMITTED
    session.commit()

    run = orchestrator.run_seed(session, "Austin")

    # committed lead now has a real draft event; new lead got outreach drafted
    session.refresh(lead)
    assert lead.event_drafted and lead.draft_event_id
    assert session.query(CreatorEvent).count() == 1
    taco = session.query(CreatorLead).filter(CreatorLead.handle == "tacotrail").first()
    assert taco.notes  # outreach copy drafted (auto internal_write ran live)
    # the creator job is part of the seed run
    assert any(j.agent == "creator" for j in run.jobs)
