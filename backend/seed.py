"""
Seed script for VenuePlus.
Run from the backend/ directory:  python seed.py
Works against whatever DATABASE_URL is set (SQLite by default).
Idempotent: clears existing rows in dev tables before inserting.
"""
from datetime import datetime, timedelta
from database import engine, SessionLocal, Base
from models import (
    User, UserRole, Venue, ServiceProvider, ServiceCategory,
    VenueRequirement, Event, Booking, BookingService, BookingStatus,
)
from auth import get_password_hash

PASSWORD = "password123"


def wipe(db):
    # Order matters due to FKs
    for model in [BookingService, Booking, Event, VenueRequirement,
                  ServiceProvider, Venue, User]:
        db.query(model).delete()
    db.commit()


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        wipe(db)
        pw = get_password_hash(PASSWORD)

        # ---------- USERS ----------
        renters = [
            User(email="alice@example.com", hashed_password=pw, first_name="Alice",
                 last_name="Nguyen", phone="555-0101", role=UserRole.RENTER, is_verified=True,
                 bio="Plans birthday parties and reunions."),
            User(email="bob@example.com", hashed_password=pw, first_name="Bob",
                 last_name="Garcia", phone="555-0102", role=UserRole.RENTER, is_verified=True,
                 bio="Wedding planner."),
        ]

        owners = [
            User(email="rooftop@example.com", hashed_password=pw, first_name="Maya",
                 last_name="Patel", phone="555-0201", role=UserRole.VENUE_OWNER, is_verified=True,
                 bio="Owns a downtown rooftop."),
            User(email="ranch@example.com", hashed_password=pw, first_name="Cole",
                 last_name="Reed", phone="555-0202", role=UserRole.VENUE_OWNER, is_verified=True,
                 bio="Family ranch with open fields."),
            User(email="loft@example.com", hashed_password=pw, first_name="Jordan",
                 last_name="Kim", phone="555-0203", role=UserRole.VENUE_OWNER, is_verified=True,
                 bio="Industrial loft for pop-ups."),
            User(email="poolhouse@example.com", hashed_password=pw, first_name="Sam",
                 last_name="Rivera", phone="555-0204", role=UserRole.VENUE_OWNER, is_verified=True,
                 bio="Modern pool house."),
            User(email="lot@example.com", hashed_password=pw, first_name="Taylor",
                 last_name="Brooks", phone="555-0205", role=UserRole.VENUE_OWNER, is_verified=True,
                 bio="Large parking lot for car shows."),
        ]

        providers = [
            ("clean1@example.com", "Rosa", "Mendez", ServiceCategory.CLEANING,
             "SparkleCrew Cleaning", "Post-event deep cleaning, 4-person crew.", 75.0),
            ("sec1@example.com", "Marcus", "Hill", ServiceCategory.SECURITY,
             "Iron Gate Security", "Licensed and insured event security guards.", 65.0),
            ("cater1@example.com", "Lin", "Chen", ServiceCategory.CATERING,
             "Lin's Kitchen Catering", "Asian fusion catering for 20-200 guests.", 120.0),
            ("bar1@example.com", "Drew", "Owens", ServiceCategory.BARTENDING,
             "Tap & Pour Bartending", "Mobile bartending with mixology menu.", 85.0),
            ("dj1@example.com", "Kai", "Walker", ServiceCategory.DJ,
             "DJ Kai", "Wedding & party DJ with full sound system.", 150.0),
            ("photo1@example.com", "Sky", "Bennett", ServiceCategory.PHOTOGRAPHY,
             "Bennett Photo", "Event photography with same-day previews.", 200.0),
            ("decor1@example.com", "Iris", "Fowler", ServiceCategory.DECORATION,
             "Bloom Decor Co", "Florals, balloons, full event styling.", 90.0),
            ("staff1@example.com", "Ren", "Park", ServiceCategory.STAFF,
             "Ren's Event Staff", "Servers, ushers, and coat check staff.", 45.0),
        ]
        provider_users = [
            User(email=e, hashed_password=pw, first_name=f, last_name=l,
                 phone=f"555-03{i:02d}", role=UserRole.SERVICE_PROVIDER, is_verified=True,
                 bio=desc)
            for i, (e, f, l, _, _, desc, _) in enumerate(providers, start=1)
        ]

        db.add_all(renters + owners + provider_users)
        db.commit()
        for u in renters + owners + provider_users:
            db.refresh(u)

        # ---------- SERVICE PROVIDERS ----------
        sp_objs = []
        for u, (_, _, _, cat, name, desc, rate) in zip(provider_users, providers):
            sp = ServiceProvider(
                user_id=u.id,
                service_category=cat,
                service_name=name,
                description=desc,
                hourly_rate=rate,
                minimum_hours=2,
                service_area_cities=["Austin", "Round Rock", "Cedar Park"],
                availability={"mon_fri": "09:00-23:00", "sat_sun": "08:00-02:00"},
                images=[],
                rating=4.7,
                total_reviews=23,
            )
            sp_objs.append(sp)
        db.add_all(sp_objs)
        db.commit()
        for sp in sp_objs:
            db.refresh(sp)

        sp_by_cat = {sp.service_category: sp for sp in sp_objs}

        # ---------- VENUES ----------
        venues_data = [
            dict(owner=owners[0], title="Skyline Rooftop Downtown",
                 description="360° city views, full bar, lounge seating for 80.",
                 venue_type="rooftop", address="500 Congress Ave", city="Austin",
                 state="TX", zip_code="78701", lat=30.2672, lon=-97.7431,
                 capacity=80, price=250.0,
                 amenities=["bar", "speakers", "string lights", "restrooms"],
                 rules="No open flames. Music off by midnight."),
            dict(owner=owners[1], title="Bluebonnet Ranch Field",
                 description="10-acre open field perfect for weddings and reunions.",
                 venue_type="field", address="1200 County Rd 12", city="Dripping Springs",
                 state="TX", zip_code="78620", lat=30.1902, lon=-98.0867,
                 capacity=300, price=180.0,
                 amenities=["parking", "restrooms", "power hookups", "tent space"],
                 rules="Cleanup required. Security mandatory for 100+ guests."),
            dict(owner=owners[2], title="East Side Industrial Loft",
                 description="3,000 sqft brick-and-beam loft, perfect for pop-ups and launches.",
                 venue_type="loft", address="2100 E 6th St", city="Austin",
                 state="TX", zip_code="78702", lat=30.2627, lon=-97.7220,
                 capacity=120, price=200.0,
                 amenities=["projector", "wifi", "kitchenette", "freight elevator"],
                 rules="No glitter or confetti."),
            dict(owner=owners[3], title="Hillside Pool House Retreat",
                 description="Modern pool house with cabana, hot tub, and lounge.",
                 venue_type="pool house", address="88 Hillside Dr", city="Westlake",
                 state="TX", zip_code="78746", lat=30.2999, lon=-97.8170,
                 capacity=40, price=300.0,
                 amenities=["pool", "hot tub", "grill", "sound system"],
                 rules="Cleaning service required."),
            dict(owner=owners[4], title="Northside Lot — Car Show Ready",
                 description="Paved 2-acre lot, great for car meets, food truck rallies.",
                 venue_type="parking lot", address="900 N Lamar", city="Austin",
                 state="TX", zip_code="78751", lat=30.3070, lon=-97.7430,
                 capacity=500, price=150.0,
                 amenities=["power", "lighting", "fenced", "restrooms nearby"],
                 rules="Security required. Insurance certificate required."),
        ]
        venue_objs = []
        for v in venues_data:
            ven = Venue(
                owner_id=v["owner"].id, title=v["title"], description=v["description"],
                venue_type=v["venue_type"], address=v["address"], city=v["city"],
                state=v["state"], zip_code=v["zip_code"], latitude=v["lat"],
                longitude=v["lon"], capacity=v["capacity"], price_per_hour=v["price"],
                minimum_hours=2, images=[], amenities=v["amenities"], rules=v["rules"],
            )
            venue_objs.append(ven)
        db.add_all(venue_objs)
        db.commit()
        for ven in venue_objs:
            db.refresh(ven)

        # ---------- VENUE REQUIREMENTS (mandatory services) ----------
        reqs = [
            # Ranch field — security mandatory
            VenueRequirement(venue_id=venue_objs[1].id,
                             service_provider_id=sp_by_cat[ServiceCategory.SECURITY].id,
                             service_category=ServiceCategory.SECURITY,
                             is_mandatory=True,
                             description="Licensed security required for 100+ guests."),
            # Pool house — cleaning mandatory
            VenueRequirement(venue_id=venue_objs[3].id,
                             service_provider_id=sp_by_cat[ServiceCategory.CLEANING].id,
                             service_category=ServiceCategory.CLEANING,
                             is_mandatory=True,
                             description="Post-event deep clean required."),
            # Parking lot — security mandatory
            VenueRequirement(venue_id=venue_objs[4].id,
                             service_provider_id=sp_by_cat[ServiceCategory.SECURITY].id,
                             service_category=ServiceCategory.SECURITY,
                             is_mandatory=True,
                             description="Security required for all events."),
        ]
        db.add_all(reqs)
        db.commit()

        # ---------- SAMPLE EVENT + BOOKING ----------
        evt = Event(host_id=renters[0].id, title="Alice's 30th Birthday",
                    description="Rooftop birthday with DJ and bar.",
                    event_type="birthday", expected_guests=60)
        db.add(evt); db.commit(); db.refresh(evt)

        start = datetime.utcnow() + timedelta(days=14, hours=19 - datetime.utcnow().hour)
        end = start + timedelta(hours=5)
        venue_cost = 5 * venue_objs[0].price_per_hour
        dj_cost = 5 * sp_by_cat[ServiceCategory.DJ].hourly_rate
        bar_cost = 5 * sp_by_cat[ServiceCategory.BARTENDING].hourly_rate
        total = venue_cost + dj_cost + bar_cost

        booking = Booking(
            renter_id=renters[0].id, venue_id=venue_objs[0].id, event_id=evt.id,
            start_datetime=start, end_datetime=end, total_hours=5,
            venue_cost=venue_cost, service_cost=dj_cost + bar_cost, total_cost=total,
            status=BookingStatus.CONFIRMED,
            special_requests="Hip-hop and afrobeats playlist preferred.",
        )
        db.add(booking); db.commit(); db.refresh(booking)

        db.add_all([
            BookingService(booking_id=booking.id,
                           service_provider_id=sp_by_cat[ServiceCategory.DJ].id,
                           hours=5, cost=dj_cost, is_mandatory=False, status="accepted"),
            BookingService(booking_id=booking.id,
                           service_provider_id=sp_by_cat[ServiceCategory.BARTENDING].id,
                           hours=5, cost=bar_cost, is_mandatory=False, status="accepted"),
        ])
        db.commit()

        print("Seed complete:")
        print(f"  users:             {db.query(User).count()}")
        print(f"  venues:            {db.query(Venue).count()}")
        print(f"  service_providers: {db.query(ServiceProvider).count()}")
        print(f"  requirements:      {db.query(VenueRequirement).count()}")
        print(f"  events:            {db.query(Event).count()}")
        print(f"  bookings:          {db.query(Booking).count()}")
        print(f"  booking_services:  {db.query(BookingService).count()}")
        print(f"\nLogin for any seeded user with password: {PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    run()
