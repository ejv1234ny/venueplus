"""Provider-lead service: backfill from ingested providers + upsert dedup."""
from models import User, UserRole, ServiceProvider, ServiceCategory
from models_leads import ProviderLead
from services import provider_leads


def _ingested_provider(session, name, source, source_id, phone, website):
    """Mimic scraper/normalize output: synthetic-email user + inactive provider."""
    slug = name.lower().replace(" ", "-")
    u = User(email=f"{slug}-{source}-{source_id}@providers.venueplus.local",
             hashed_password="x", first_name=name, last_name="Lead",
             role=UserRole.SERVICE_PROVIDER, phone=phone,
             bio=f"Imported from {source}. 123 Main St", is_active=True, is_verified=False)
    session.add(u); session.commit(); session.refresh(u)
    sp = ServiceProvider(
        user_id=u.id, service_category=ServiceCategory.SECURITY, service_name=name,
        description=f"{name} — security services in Austin. Website: {website}",
        hourly_rate=40.0, minimum_hours=1, service_area_cities=["Austin"],
        availability={}, images=[], is_active=False)
    session.add(sp); session.commit(); session.refresh(sp)
    return sp


def test_backfill_materializes_leads(session):
    sp = _ingested_provider(session, "Ace Security", "osm", "node12345",
                            "+15125551234", "https://ace.example")
    r = provider_leads.backfill_inactive(session)
    assert r["backfilled"] == 1
    lead = session.query(ProviderLead).filter(
        ProviderLead.service_provider_id == sp.id).first()
    assert lead is not None
    assert lead.source == "osm"
    assert lead.contact_phone == "+15125551234"
    assert lead.website == "https://ace.example"
    assert lead.outreach_status == "new" and lead.enrichment_status == "new"
    # idempotent — a second pass materializes nothing new
    assert provider_leads.backfill_inactive(session)["backfilled"] == 0


def test_upsert_dedup(session):
    sp = _ingested_provider(session, "Bolt DJ", "google", "places-abc",
                            "+15125550000", "https://bolt.example")
    a = provider_leads.upsert_lead(session, service_provider_id=sp.id,
                                   source="google", source_id="places-abc", phone="+15125550000")
    b = provider_leads.upsert_lead(session, service_provider_id=sp.id,
                                   source="google", source_id="places-abc", email="hi@bolt.example")
    assert a.id == b.id                       # updated, not duplicated
    assert b.contact_email == "hi@bolt.example"
    assert session.query(ProviderLead).count() == 1
