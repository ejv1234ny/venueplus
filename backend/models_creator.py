"""Creator Events — data model.

The "influencer plugin": a creator (host) runs a ticketed gathering. The
underlying venue+services Booking is the COST side (existing flow); ticket
sales are the REVENUE side. Money is settled after the event:

    platform fee (PLATFORM_FEE_PCT of ticket subtotal) is kept by VenuePlus,
    venue owner + providers are paid their costs, and the creator nets the
    remainder. A deposit hold covers the gap if tickets undersell.

These models live in their own module but share the same declarative Base,
so `Base.metadata.create_all` picks them up automatically (no Alembic).
"""
import enum

from sqlalchemy import (Column, Integer, String, Boolean, DateTime, Text,
                        ForeignKey, Enum)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base
# Reuse the existing payment/payout status enums so creator-event money
# states stay consistent with the booking flow.
from models import PaymentStatus, PayoutStatus


# --------------------------------------------------------------------------
# Enums
# --------------------------------------------------------------------------
class FundingModel(str, enum.Enum):
    REVENUE_FUNDED = "revenue_funded"   # sell first, costs paid from ticket revenue
    CREATOR_PREPAID = "creator_prepaid" # creator pays booking upfront (future)


class CreatorEventStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    SOLD_OUT = "sold_out"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class EventVisibility(str, enum.Enum):
    PUBLIC = "public"
    UNLISTED = "unlisted"   # reachable by link only


class SettlementStatus(str, enum.Enum):
    PENDING = "pending"
    SETTLED = "settled"
    FAILED = "failed"


class TicketStatus(str, enum.Enum):
    RESERVED = "reserved"     # PI created, awaiting capture
    PAID = "paid"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"
    CHECKED_IN = "checked_in"


class DepositStatus(str, enum.Enum):
    HELD = "held"             # authorize-only PI
    CAPTURED = "captured"     # platform took (part of) it to cover shortfall
    RELEASED = "released"     # event covered its costs, hold cancelled
    FORFEITED = "forfeited"   # creator no-showed / cancelled in penalty window


class CreatorLeadStatus(str, enum.Enum):
    NEW = "new"               # imported, not yet contacted
    CONTACTED = "contacted"   # outreach sent
    COMMITTED = "committed"   # agreed to host an event
    CONVERTED = "converted"   # signed up / event went live
    DECLINED = "declined"     # passed


# --------------------------------------------------------------------------
# Tables
# --------------------------------------------------------------------------
class CreatorEvent(Base):
    __tablename__ = "creator_events"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)

    slug = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    cover_image = Column(String)

    start_datetime = Column(DateTime(timezone=True), nullable=False)
    end_datetime = Column(DateTime(timezone=True), nullable=False)
    capacity = Column(Integer, nullable=False, default=0)

    funding_model = Column(Enum(FundingModel, native_enum=False),
                           default=FundingModel.REVENUE_FUNDED, nullable=False)
    status = Column(Enum(CreatorEventStatus, native_enum=False),
                    default=CreatorEventStatus.DRAFT, nullable=False)
    visibility = Column(Enum(EventVisibility, native_enum=False),
                        default=EventVisibility.PUBLIC, nullable=False)
    settlement_status = Column(Enum(SettlementStatus, native_enum=False),
                               default=SettlementStatus.PENDING, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    tiers = relationship("TicketTier", back_populates="event",
                         cascade="all, delete-orphan")
    tickets = relationship("Ticket", back_populates="event",
                           cascade="all, delete-orphan")
    deposit = relationship("EventDeposit", back_populates="event",
                           uselist=False, cascade="all, delete-orphan")


class TicketTier(Base):
    __tablename__ = "ticket_tiers"

    id = Column(Integer, primary_key=True, index=True)
    creator_event_id = Column(Integer, ForeignKey("creator_events.id"), nullable=False)
    name = Column(String, nullable=False)
    price_cents = Column(Integer, nullable=False, default=0)   # 0 = free RSVP tier
    quantity = Column(Integer, nullable=False)
    sold = Column(Integer, nullable=False, default=0)
    max_per_buyer = Column(Integer, nullable=False, default=4)
    sales_end_datetime = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    event = relationship("CreatorEvent", back_populates="tiers")
    tickets = relationship("Ticket", back_populates="tier")


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    tier_id = Column(Integer, ForeignKey("ticket_tiers.id"), nullable=False)
    creator_event_id = Column(Integer, ForeignKey("creator_events.id"),
                              nullable=False, index=True)
    buyer_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    buyer_email = Column(String, nullable=False)
    buyer_name = Column(String)

    quantity = Column(Integer, nullable=False, default=1)
    amount_cents = Column(Integer, nullable=False, default=0)        # subtotal (price*qty)
    platform_fee_cents = Column(Integer, nullable=False, default=0)  # 12% of subtotal
    stripe_fee_cents = Column(Integer, nullable=False, default=0)    # grossed-up onto buyer
    total_charged_cents = Column(Integer, nullable=False, default=0)

    # Payment state lives on the ticket (tickets aren't tied to a booking-
    # Payment, so we don't reuse the booking-only payments table).
    stripe_payment_intent_id = Column(String, index=True)
    payment_status = Column(Enum(PaymentStatus, native_enum=False),
                            default=PaymentStatus.PENDING, nullable=False)

    status = Column(Enum(TicketStatus, native_enum=False),
                    default=TicketStatus.RESERVED, nullable=False)
    qr_code = Column(String, unique=True, index=True)
    reserved_until = Column(DateTime(timezone=True))   # TTL for unpaid reservations
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    checked_in_at = Column(DateTime(timezone=True))

    tier = relationship("TicketTier", back_populates="tickets")
    event = relationship("CreatorEvent", back_populates="tickets")


class EventDeposit(Base):
    __tablename__ = "event_deposits"

    id = Column(Integer, primary_key=True, index=True)
    creator_event_id = Column(Integer, ForeignKey("creator_events.id"),
                              unique=True, nullable=False)
    payer_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount_cents = Column(Integer, nullable=False)
    captured_cents = Column(Integer, nullable=False, default=0)
    stripe_payment_intent_id = Column(String, index=True)
    status = Column(Enum(DepositStatus, native_enum=False),
                    default=DepositStatus.HELD, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True))

    event = relationship("CreatorEvent", back_populates="deposit")


class EventPayout(Base):
    """Settlement payout for a creator event — one row per recipient (venue
    owner, each provider, and the creator). Decoupled from the booking-only
    `payouts` table so we don't fight its NOT-NULL payment_id."""
    __tablename__ = "event_payouts"

    id = Column(Integer, primary_key=True, index=True)
    creator_event_id = Column(Integer, ForeignKey("creator_events.id"),
                              nullable=False, index=True)
    recipient_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipient_type = Column(String, nullable=False)   # "host" | "provider" | "creator"
    booking_service_id = Column(Integer, ForeignKey("booking_services.id"))
    venue_id = Column(Integer, ForeignKey("venues.id"))

    gross_cents = Column(Integer, nullable=False)
    platform_fee_cents = Column(Integer, nullable=False, default=0)
    net_cents = Column(Integer, nullable=False)

    stripe_transfer_id = Column(String, index=True)
    status = Column(Enum(PayoutStatus, native_enum=False),
                    default=PayoutStatus.PENDING, nullable=False)
    error_message = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    sent_at = Column(DateTime(timezone=True))


class CreatorLead(Base):
    """A prospective micro-creator/influencer to recruit into Creator Events.

    Managed pipeline: leads are IMPORTED (CSV/ops list; discovery via social
    APIs isn't automatable), then the Creator agent drafts outreach and, once a
    lead commits, drafts a ready-to-publish Creator Event under a placeholder
    creator account the real person can later claim. Not a live user until they
    sign up. Deduped by (handle or name) + city.
    """
    __tablename__ = "creator_leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    handle = Column(String, index=True)        # @handle on their platform
    platform = Column(String)                  # instagram | tiktok | youtube | ...
    niche = Column(String)                     # fitness | food | art | tech | ...
    followers = Column(Integer, default=0)
    email = Column(String)
    phone = Column(String)
    city = Column(String, index=True)

    status = Column(Enum(CreatorLeadStatus, native_enum=False),
                    default=CreatorLeadStatus.NEW, nullable=False)
    source = Column(String, default="import")
    notes = Column(Text)                       # drafted outreach / ops notes

    outreach_sent = Column(Boolean, default=False)
    event_drafted = Column(Boolean, default=False)
    draft_event_id = Column(Integer, ForeignKey("creator_events.id"),
                            nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
