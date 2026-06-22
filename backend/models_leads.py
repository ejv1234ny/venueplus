"""Provider-lead sidecar.

A ProviderLead is the first-class representation of a scraped/ingested service
provider: provenance (for dedup), real contact channels (for outreach), and
lifecycle state (enrichment + outreach + claim). It is 1:1 with an *inactive*
ServiceProvider (is_active=False) and is never live supply until the real owner
claims and onboards. Kept in its own module (like models_agents / models_creator)
so the marketplace model stays clean and the whole lead apparatus is droppable.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class ProviderLead(Base):
    __tablename__ = "provider_leads"

    id = Column(Integer, primary_key=True, index=True)
    service_provider_id = Column(Integer, ForeignKey("service_providers.id"),
                                 unique=True, nullable=False, index=True)

    # Provenance — dedup key is (source, source_id)
    source = Column(String, index=True)        # osm | google | yelp
    source_id = Column(String, index=True)
    website = Column(String)

    # Contact channels for marketing outreach
    contact_phone = Column(String)
    contact_email = Column(String)             # a *discovered* real email, not the synthetic placeholder

    # Provenance signals (help scoring)
    rating = Column(Float)
    review_count = Column(Integer)

    # Lifecycle
    lead_score = Column(Integer, default=0)
    enrichment_status = Column(String, default="new")   # new | described | photographed | enriched
    # new | queued | sent | opened | replied | claimed | onboarded | dead | suppressed
    outreach_status = Column(String, default="new")
    last_contacted_at = Column(DateTime(timezone=True))
    claim_token = Column(String, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    service_provider = relationship("ServiceProvider")
