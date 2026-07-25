"""Prospect ingestion: hand-gathered sheets -> the three lead lists."""
import csv

from services import prospects
from scripts.import_prospects import read_prospects, _split_contact, _rows_to_dicts, VENUE_ALIASES
from models import Venue, VenueLead, ServiceProvider
from models_creator import CreatorLead
from agents.specialists import VenuesAgent
from agents.types import RiskLevel


# --- service: venues ------------------------------------------------------- #
def test_import_venues_creates_lead_draft_and_contact(session):
    rows = [{
        "name": "Distribution Hall", "venue_type": "warehouse",
        "area": "East Austin (1500 E 4th St)",
        "website": "https://distributionhall.com",
        "email": "hello@distributionhall.com", "phone": "(512) 262-9656",
        "pitch_angle": "Restored warehouse; add a demand channel.",
    }]
    stats = prospects.import_venues(session, "Austin", rows)
    session.commit()
    assert stats["created"] == 1
    lead = session.query(VenueLead).one()
    assert lead.email == "hello@distributionhall.com" and lead.phone
    assert lead.pitch_angle and lead.status.value == "new"
    # a linked inactive draft venue was created (counts as lead supply)
    assert lead.draft_venue_id
    v = session.query(Venue).filter(Venue.id == lead.draft_venue_id).one()
    assert v.is_active is False and v.title == "Distribution Hall"
    # idempotent
    assert prospects.import_venues(session, "Austin", rows)["created"] == 0


# --- service: providers + creators ----------------------------------------- #
def test_import_providers_creates_inactive_leads(session):
    rows = [{"name": "Copper Shaker Bartending", "category": "bartending",
             "phone": "(512) 555-0100", "website": "https://copper.example"}]
    stats = prospects.import_providers(session, "Austin", rows)
    session.commit()
    assert stats["created"] == 1
    p = session.query(ServiceProvider).one()
    assert p.is_active is False and p.service_category.value == "bartending"


def test_import_creators_via_prospects(session):
    stats = prospects.import_creators(session, "Austin",
                                      [{"name": "Ava", "handle": "avawell", "niche": "wellness"}])
    session.commit()
    assert stats["created"] == 1
    assert session.query(CreatorLead).count() == 1


def test_import_all_mixed_payload(session):
    r = prospects.import_all(session, "Austin",
                             venues=[{"name": "Fair Market", "venue_type": "warehouse"}],
                             providers=[{"name": "DJ Pulse", "category": "dj"}],
                             creators=[{"name": "Taco", "handle": "tacotrail"}])
    session.commit()
    assert r["venues"]["created"] == 1
    assert r["providers"]["created"] == 1
    assert r["creators"]["created"] == 1


# --- importer parsing ------------------------------------------------------ #
def test_contact_split_from_freetext():
    rec = _split_contact({"name": "X", "contact": "hello@x.com; (512) 262-9656"})
    assert rec["email"] == "hello@x.com"
    assert "262-9656" in rec["phone"]
    assert "contact" not in rec


def test_header_mapping_finds_venue_columns():
    grid = [
        ["#", "Venue", "Type", "Area", "Website", "Contact", "Pitch angle", "Notes"],
        ["1", "Fair Market", "warehouse", "East Austin", "https://fm.com",
         "(512) 710-8832", "Iconic warehouse", "book weekdays"],
    ]
    recs = _rows_to_dicts(grid, VENUE_ALIASES)
    assert recs[0]["name"] == "Fair Market"
    assert recs[0]["venue_type"] == "warehouse"
    assert recs[0]["pitch_angle"] == "Iconic warehouse"


def test_read_prospects_csv_roundtrip(tmp_path):
    p = tmp_path / "venues.csv"
    with open(p, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["Venue", "Type", "Contact", "Pitch angle"])
        w.writerow(["Distribution Hall", "warehouse",
                    "hello@dh.com; (512) 262-9656", "Restored warehouse"])
    rows = read_prospects(str(p), "venue")
    assert len(rows) == 1
    assert rows[0]["name"] == "Distribution Hall"
    assert rows[0]["email"] == "hello@dh.com" and rows[0]["phone"]


# --- the Venues agent roots outreach from the imported lead list ----------- #
def test_venues_agent_roots_outreach_from_leads(session):
    prospects.import_venues(session, "Austin", [
        {"name": "Distribution Hall", "email": "hello@dh.com", "pitch_angle": "Restored warehouse"}])
    session.commit()
    actions = VenuesAgent().operate(session, "Austin", live=False)
    outreach = [a for a in actions if a.tool == "send_venue_lead_outreach"]
    assert len(outreach) == 1 and outreach[0].risk == RiskLevel.OUTBOUND
    lead = session.query(VenueLead).filter(VenueLead.name == "Distribution Hall").one()
    assert outreach[0].args["lead_id"] == lead.id


def test_venues_agent_skips_phone_only_leads(session):
    # email-first: a phone-only prospect (no email) is NOT queued for outreach
    lead = VenueLead(name="Warehouse X", city="Austin", phone="(512) 555-0177")
    session.add(lead); session.commit()
    actions = VenuesAgent().operate(session, "Austin", live=False)
    mine = [a for a in actions if a.args.get("lead_id") == lead.id]
    assert not mine  # no email (and SMS path removed)


# --- API endpoint ---------------------------------------------------------- #
def test_prospects_import_endpoint(client, admin_headers):
    r = client.post("/api/agents/prospects/import", headers=admin_headers, json={
        "city": "Austin",
        "venues": [{"name": "Canopy Studios", "venue_type": "studio",
                    "email": "hi@canopy.example"}],
        "providers": [{"name": "Frame Photo", "category": "photography"}],
        "creators": [{"name": "Ava", "handle": "avawell"}],
    })
    assert r.status_code == 200, r.text
    stats = r.json()["stats"]
    assert stats["venues"]["created"] == 1
    assert stats["providers"]["created"] == 1
    assert stats["creators"]["created"] == 1
