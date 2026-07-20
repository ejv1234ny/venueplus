from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Enum, Table, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

# User roles
class UserRole(str, enum.Enum):
    RENTER = "renter"
    VENUE_OWNER = "venue_owner"
    SERVICE_PROVIDER = "service_provider"
    CREATOR = "creator"
    ADMIN = "admin"

# Service categories
class ServiceCategory(str, enum.Enum):
    CLEANING = "cleaning"
    SECURITY = "security"
    CATERING = "catering"
    BARTENDING = "bartending"
    DJ = "dj"
    PHOTOGRAPHY = "photography"
    DECORATION = "decoration"
    EQUIPMENT = "equipment"
    STAFF = "staff"
    OTHER = "other"

# Booking status
class BookingStatus(str, enum.Enum):
    DRAFT = "draft"                       # checkout in progress
    AWAITING_PAYMENT = "awaiting_payment" # checkout submitted, pre-Stripe
    PENDING = "pending"                   # awaiting host approval
    CONFIRMED = "confirmed"               # host confirmed (payment captured)
    IN_PROGRESS = "in_progress"           # event running
    COMPLETED = "completed"               # event finished
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    DISPUTED = "disputed"


class MatchStatus(str, enum.Enum):
    OFFERED = "offered"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class NotificationType(str, enum.Enum):
    BOOKING_CREATED = "booking_created"
    BOOKING_CONFIRMED = "booking_confirmed"
    BOOKING_CANCELLED = "booking_cancelled"
    MATCH_OFFERED = "match_offered"
    MATCH_ACCEPTED = "match_accepted"
    MESSAGE_RECEIVED = "message_received"
    REVIEW_REQUEST = "review_request"
    REVIEW_RECEIVED = "review_received"
    PAYOUT_SENT = "payout_sent"
    SYSTEM = "system"


class ReviewTargetType(str, enum.Enum):
    VENUE = "venue"
    PROVIDER = "provider"
    RENTER = "renter"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"               # PI created, awaiting card
    REQUIRES_ACTION = "requires_action"
    AUTHORIZED = "authorized"         # held but not captured
    CAPTURED = "captured"             # money in VenuePlus balance
    PARTIALLY_REFUNDED = "partially_refunded"
    REFUNDED = "refunded"
    FAILED = "failed"
    CANCELED = "canceled"


class PayoutStatus(str, enum.Enum):
    PENDING = "pending"               # waiting for event end + capture
    SCHEDULED = "scheduled"
    SENT = "sent"
    FAILED = "failed"
    REVERSED = "reversed"              # refund clawed it back
    SKIPPED = "skipped"                # provider no-show etc.

# User model
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String)
    role = Column(Enum(UserRole, native_enum=False), nullable=False)
    profile_image = Column(String)
    bio = Column(Text)
    stripe_customer_id = Column(String, index=True)  # for saved payment methods
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owned_venues = relationship("Venue", back_populates="owner", cascade="all, delete-orphan")
    service_profiles = relationship("ServiceProvider", back_populates="user", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="renter", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="host", cascade="all, delete-orphan")

# Venue model
class Venue(Base):
    __tablename__ = "venues"
    
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    venue_type = Column(String, nullable=False)  # rooftop, field, parking lot, etc.
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    zip_code = Column(String, nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    capacity = Column(Integer, nullable=False)
    price_per_hour = Column(Float, nullable=False)
    minimum_hours = Column(Integer, default=1)
    images = Column(JSON)  # Array of image URLs
    amenities = Column(JSON)  # Array of amenities
    required_services = Column(JSON)  # Array of ServiceCategory strings the renter must book via the platform
    ideal_for = Column(JSON)  # Array of event_type slugs this venue is well suited for
    rules = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="owned_venues")
    requirements = relationship("VenueRequirement", back_populates="venue", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="venue", cascade="all, delete-orphan")

# Service Provider model (gig workers)
class ServiceProvider(Base):
    __tablename__ = "service_providers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    service_category = Column(Enum(ServiceCategory, native_enum=False), nullable=False)
    service_name = Column(String, nullable=False)  # e.g., "Professional DJ", "Cleaning Crew"
    description = Column(Text, nullable=False)
    hourly_rate = Column(Float, nullable=False)
    minimum_hours = Column(Integer, default=1)
    service_area_cities = Column(JSON)  # Array of cities they serve
    availability = Column(JSON)  # Store availability schedule
    images = Column(JSON)  # Portfolio images
    rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    is_claimed = Column(Boolean, default=True, nullable=False)  # false = unclaimed seeded directory listing
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="service_profiles")
    booked_services = relationship("BookingService", back_populates="service_provider")
    venue_requirements = relationship("VenueRequirement", back_populates="service_provider")

# Venue Requirements (mandatory services)
class VenueRequirement(Base):
    __tablename__ = "venue_requirements"
    
    id = Column(Integer, primary_key=True, index=True)
    venue_id = Column(Integer, ForeignKey("venues.id"), nullable=False)
    service_provider_id = Column(Integer, ForeignKey("service_providers.id"), nullable=False)
    service_category = Column(Enum(ServiceCategory, native_enum=False), nullable=False)
    is_mandatory = Column(Boolean, default=True)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    venue = relationship("Venue", back_populates="requirements")
    service_provider = relationship("ServiceProvider", back_populates="venue_requirements")

# Event model
class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    event_type = Column(String, nullable=False)  # birthday, wedding, corporate, etc.
    expected_guests = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    host = relationship("User", back_populates="events")
    bookings = relationship("Booking", back_populates="event")

# Booking model
class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    renter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    venue_id = Column(Integer, ForeignKey("venues.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    start_datetime = Column(DateTime(timezone=True), nullable=False)
    end_datetime = Column(DateTime(timezone=True), nullable=False)
    total_hours = Column(Integer, nullable=False)
    venue_cost = Column(Float, nullable=False)
    service_cost = Column(Float, default=0.0)
    total_cost = Column(Float, nullable=False)
    status = Column(Enum(BookingStatus, native_enum=False), default=BookingStatus.PENDING)
    special_requests = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    renter = relationship("User", back_populates="bookings")
    venue = relationship("Venue", back_populates="bookings")
    event = relationship("Event", back_populates="bookings")
    booked_services = relationship("BookingService", back_populates="booking", cascade="all, delete-orphan")

# BookingService (many-to-many for services in a booking)
class BookingService(Base):
    __tablename__ = "booking_services"
    
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    service_provider_id = Column(Integer, ForeignKey("service_providers.id"), nullable=False)
    hours = Column(Integer, nullable=False)
    cost = Column(Float, nullable=False)
    is_mandatory = Column(Boolean, default=False)
    status = Column(String, default="pending")  # pending, accepted, declined, completed
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    booking = relationship("Booking", back_populates="booked_services")
    service_provider = relationship("ServiceProvider", back_populates="booked_services")


# ---------------------------------------------------------------------------
# Auth: verification + password reset tokens
# ---------------------------------------------------------------------------
class VerificationToken(Base):
    __tablename__ = "verification_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    purpose = Column(String, nullable=False)  # "email_verify" | "password_reset"
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ---------------------------------------------------------------------------
# File uploads (images, documents)
# ---------------------------------------------------------------------------
class FileUpload(Base):
    __tablename__ = "file_uploads"

    id = Column(Integer, primary_key=True, index=True)
    uploader_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    kind = Column(String, nullable=False)  # "venue_photo" | "provider_photo" | "profile" | "document"
    filename = Column(String, nullable=False)
    content_type = Column(String)
    size_bytes = Column(Integer)
    backend = Column(String, default="local")  # "local" | "s3"
    url = Column(String, nullable=False)       # public URL or local path
    venue_id = Column(Integer, ForeignKey("venues.id"))
    provider_id = Column(Integer, ForeignKey("service_providers.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ---------------------------------------------------------------------------
# Provider availability (recurring weekly + blackout dates)
# ---------------------------------------------------------------------------
class ProviderBlackout(Base):
    __tablename__ = "provider_blackouts"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("service_providers.id"), nullable=False)
    start_datetime = Column(DateTime(timezone=True), nullable=False)
    end_datetime = Column(DateTime(timezone=True), nullable=False)
    reason = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ---------------------------------------------------------------------------
# Match offers (matching engine)
# ---------------------------------------------------------------------------
class MatchOffer(Base):
    __tablename__ = "match_offers"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    booking_service_id = Column(Integer, ForeignKey("booking_services.id"), nullable=True)
    service_provider_id = Column(Integer, ForeignKey("service_providers.id"), nullable=False)
    service_category = Column(Enum(ServiceCategory, native_enum=False), nullable=False)
    status = Column(Enum(MatchStatus, native_enum=False), default=MatchStatus.OFFERED)
    offered_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True))
    responded_at = Column(DateTime(timezone=True))
    rank = Column(Integer, default=0)  # offer order in fallback rotation


# ---------------------------------------------------------------------------
# Messaging
# ---------------------------------------------------------------------------
class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"))
    title = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    participants = relationship("ConversationParticipant", back_populates="conversation",
                                cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="conversation",
                            cascade="all, delete-orphan", order_by="Message.created_at")


class ConversationParticipant(Base):
    __tablename__ = "conversation_participants"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    last_read_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    conversation = relationship("Conversation", back_populates="participants")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    body = Column(Text, nullable=False)
    flagged = Column(Boolean, default=False)
    flagged_reason = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    conversation = relationship("Conversation", back_populates="messages")


# ---------------------------------------------------------------------------
# Reviews (three-way)
# ---------------------------------------------------------------------------
class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_type = Column(Enum(ReviewTargetType, native_enum=False), nullable=False)
    target_id = Column(Integer, nullable=False)  # venue.id | provider.id | user.id
    rating = Column(Integer, nullable=False)     # 1-5
    body = Column(Text)
    is_public = Column(Boolean, default=True)
    is_flagged = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(NotificationType, native_enum=False), nullable=False)
    title = Column(String, nullable=False)
    body = Column(Text)
    link = Column(String)              # frontend route
    payload = Column(JSON)             # arbitrary structured data
    read_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ---------------------------------------------------------------------------
# Stripe Connect: connected accounts (one per host or provider user)
# ---------------------------------------------------------------------------
class StripeAccount(Base):
    __tablename__ = "stripe_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    stripe_account_id = Column(String, unique=True, index=True, nullable=False)  # acct_xxx
    onboarding_complete = Column(Boolean, default=False)
    charges_enabled = Column(Boolean, default=False)
    payouts_enabled = Column(Boolean, default=False)
    details_submitted = Column(Boolean, default=False)
    requirements = Column(JSON)        # mirror of Stripe requirements_due
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


# ---------------------------------------------------------------------------
# Payments — one per booking
# ---------------------------------------------------------------------------
class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True, nullable=False)
    stripe_payment_intent_id = Column(String, unique=True, index=True)
    stripe_customer_id = Column(String)
    stripe_charge_id = Column(String)

    # Money (all in cents to avoid float drift)
    subtotal_cents = Column(Integer, nullable=False)        # venue + services
    platform_fee_cents = Column(Integer, nullable=False)    # 12% of subtotal
    stripe_fee_cents = Column(Integer, nullable=False)      # passed to customer (gross-up)
    total_charged_cents = Column(Integer, nullable=False)   # subtotal + stripe_fee_cents
    refunded_cents = Column(Integer, default=0)

    status = Column(Enum(PaymentStatus, native_enum=False), default=PaymentStatus.PENDING)
    refund_reason = Column(String)
    receipt_url = Column(String)
    error_message = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    captured_at = Column(DateTime(timezone=True))
    refunded_at = Column(DateTime(timezone=True))


# ---------------------------------------------------------------------------
# Payouts — one per recipient per booking (host + each provider)
# ---------------------------------------------------------------------------
class Payout(Base):
    __tablename__ = "payouts"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=False)
    recipient_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipient_type = Column(String, nullable=False)        # "host" | "provider"
    booking_service_id = Column(Integer, ForeignKey("booking_services.id"))  # nullable for host
    venue_id = Column(Integer, ForeignKey("venues.id"))                       # nullable for provider

    gross_cents = Column(Integer, nullable=False)        # before platform fee
    platform_fee_cents = Column(Integer, nullable=False) # 12%
    net_cents = Column(Integer, nullable=False)          # gross - fee

    stripe_transfer_id = Column(String, index=True)
    status = Column(Enum(PayoutStatus, native_enum=False), default=PayoutStatus.PENDING)
    error_message = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    sent_at = Column(DateTime(timezone=True))


# ---------------------------------------------------------------------------
# Admin audit log
# ---------------------------------------------------------------------------
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String, nullable=False)
    entity_type = Column(String)
    entity_id = Column(Integer)
    meta = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ---------------------------------------------------------------------------
# VenueLead — sidecar for scraped/imported venue PROSPECTS (Pool A/B).
#
# Mirrors CreatorLead: a prospect carries the real outreach data (contact,
# pitch angle, competitor status) the Venues agent needs, while an optional
# linked draft Venue (inactive) makes it show as lead supply. A prospect is NOT
# live supply — it becomes bookable only when a real owner claims the draft and
# completes the listing.
# ---------------------------------------------------------------------------
class VenueLeadStatus(str, enum.Enum):
    NEW = "new"               # scraped/imported, not yet contacted
    CONTACTED = "contacted"   # outreach sent
    INTERESTED = "interested" # replied / warm
    CLAIMED = "claimed"       # owner claimed the draft venue
    DECLINED = "declined"


class VenueLead(Base):
    __tablename__ = "venue_leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    venue_type = Column(String)
    city = Column(String, index=True)
    area = Column(String)                  # neighborhood / address blurb
    address = Column(String)
    website = Column(String)
    email = Column(String)
    phone = Column(String)
    indicative_pricing = Column(String)
    on_competitor = Column(String)         # "yes"/"unknown"/competitor name
    pitch_angle = Column(Text)
    notes = Column(Text)

    source = Column(String, default="import")   # import | osm | google | <site>
    source_id = Column(String, index=True)      # stable per-source id for dedup
    status = Column(Enum(VenueLeadStatus, native_enum=False),
                    default=VenueLeadStatus.NEW, nullable=False)
    outreach_sent = Column(Boolean, default=False)
    draft_venue_id = Column(Integer, ForeignKey("venues.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
