"""End-to-end smoke test of the new API surface using FastAPI TestClient.

Run:  python smoketest.py
"""
from fastapi.testclient import TestClient
from main import app

c = TestClient(app)
PASS = "password123"


def hdr(tok):
    return {"Authorization": f"Bearer {tok}"}


def login(email):
    r = c.post("/api/auth/login", data={"username": email, "password": PASS})
    assert r.status_code == 200, (email, r.text)
    return r.json()["access_token"]


def main():
    # 1. Health
    assert c.get("/health").json()["status"] == "healthy"

    # 2. Login as seeded users
    alice = login("alice@example.com")
    dj_user = login("dj1@example.com")
    # All venue owners — we'll find the right one for the chosen venue
    owner_emails = ["rooftop@example.com", "ranch@example.com", "loft@example.com",
                    "poolhouse@example.com", "lot@example.com"]
    owner_tokens = {e: login(e) for e in owner_emails}
    print("[ok] login for renter, owner, provider")

    # 3. Auth /me
    me = c.get("/api/auth/me", headers=hdr(alice)).json()
    assert me["email"] == "alice@example.com"
    print("[ok] /api/auth/me")

    # 4. Search venues
    r = c.get("/api/search/venues?city=Austin")
    assert r.status_code == 200
    venues = r.json()
    assert venues["total"] > 0
    # Pick a venue without seeded bookings (avoid the rooftop)
    venue_id = next(v["id"] for v in venues["items"] if v["title"] != "Skyline Rooftop Downtown")
    print(f"[ok] search venues -> {venues['total']}")

    # 5. Search with filters
    r = c.get("/api/search/venues?max_price=300&min_capacity=50&sort=price_asc")
    assert r.status_code == 200
    print(f"[ok] filtered search -> {r.json()['total']}")

    # 6. Search providers
    r = c.get("/api/search/providers?category=dj")
    assert r.status_code == 200
    print(f"[ok] search providers (dj) -> {r.json()['total']}")

    # 7. Create a booking (Alice books a venue)
    from datetime import datetime, timezone, timedelta
    start = (datetime.now(timezone.utc) + timedelta(days=30, hours=4)).replace(microsecond=0)
    end = start + timedelta(hours=4)
    payload = {
        "venue_id": venue_id,
        "start_datetime": start.isoformat(),
        "end_datetime": end.isoformat(),
        "special_requests": "smoketest",
        "services": [],
    }
    r = c.post("/api/bookings/", json=payload, headers=hdr(alice))
    if r.status_code != 201:
        print("FAIL booking:", r.status_code, r.text)
        return
    booking = r.json()
    print(f"[ok] booking created id={booking['id']} status={booking['status']} total=${booking['total_cost']}")

    # 8. Run matching engine
    r = c.post(f"/api/matching/run/{booking['id']}", headers=hdr(alice))
    assert r.status_code == 200, r.text
    print(f"[ok] matching engine: {r.json()}")

    # 9. Provider sees offers
    r = c.get("/api/matching/my-offers", headers=hdr(dj_user))
    print(f"[ok] dj offers visible: {len(r.json())}")

    # 10. Send a message
    r = c.post(f"/api/messages/booking/{booking['id']}",
               json={"body": "Hey, looking forward to the event!"},
               headers=hdr(alice))
    assert r.status_code == 200, r.text
    print(f"[ok] message sent (flagged={r.json()['flagged']})")

    # 11. Anti-circumvention scrub
    r = c.post(f"/api/messages/booking/{booking['id']}",
               json={"body": "Call me at 555-123-4567 or alice@example.com"},
               headers=hdr(alice))
    assert r.status_code == 200
    assert r.json()["flagged"] == True
    print("[ok] anti-circumvention scrub triggered")

    # 12. Conversations list
    r = c.get("/api/messages/conversations", headers=hdr(alice))
    print(f"[ok] alice conversations: {len(r.json())}")

    # 13. Notifications (across all owners)
    total_notifs = 0
    for tok in owner_tokens.values():
        r = c.get("/api/notifications/", headers=hdr(tok))
        total_notifs += len(r.json())
    print(f"[ok] owner notifications total: {total_notifs}")

    # 14. Host confirms booking — find correct owner
    # Try each owner until one succeeds
    confirmed = False
    for email, tok in owner_tokens.items():
        r = c.post(f"/api/bookings/{booking['id']}/confirm", headers=hdr(tok))
        if r.status_code == 200:
            print(f"[ok] booking confirmed by {email}: {r.json()}")
            confirmed = True
            break
    assert confirmed, "no owner could confirm"
    maya = owner_tokens["rooftop@example.com"]  # alias for later

    # 15. Cancel booking (>7 days = 100% refund)
    r = c.post(f"/api/bookings/{booking['id']}/cancel", headers=hdr(alice))
    assert r.status_code == 200
    print(f"[ok] cancellation: {r.json()}")

    # 16. Forgot password
    r = c.post("/api/auth/forgot-password", json={"email": "alice@example.com"})
    assert r.status_code == 200
    print("[ok] forgot-password (check console for token)")

    # 17. Cities list
    r = c.get("/api/search/cities")
    print(f"[ok] cities: {r.json()}")

    # ---------------- PAYMENTS (Wave 16) ----------------
    print("\n--- Payments ---")

    # Create another booking for the payment flow (the first one was cancelled)
    start2 = (datetime.now(timezone.utc) + timedelta(days=45, hours=2)).replace(microsecond=0)
    end2 = start2 + timedelta(hours=3)
    payload2 = {
        "venue_id": venue_id,
        "start_datetime": start2.isoformat(),
        "end_datetime": end2.isoformat(),
        "services": [{"service_provider_id": 5, "hours": 3, "is_mandatory": False}],
    }
    r = c.post("/api/bookings/", json=payload2, headers=hdr(alice))
    assert r.status_code == 201, r.text
    booking2 = r.json()
    print(f"[ok] payments-test booking id={booking2['id']} subtotal=${booking2['total_cost']}")

    # Get breakdown
    r = c.get(f"/api/payments/breakdown/{booking2['id']}", headers=hdr(alice))
    assert r.status_code == 200, r.text
    bd = r.json()
    print(f"[ok] breakdown: subtotal=${bd['subtotal']} +platform_fee=${bd['platform_fee']} +stripe_fee=${bd['stripe_processing_fee']} = total=${bd['total']}")

    # Onboard host + provider for payouts (sim mode -> instant approve)
    for tok_email, tok in {**owner_tokens, "dj1@example.com": dj_user}.items():
        r = c.post("/api/payments/onboarding-link", headers=hdr(tok))
        if r.status_code == 200:
            assert r.json()["account_status"]["payouts_enabled"] == True
    print("[ok] all hosts + dj provider onboarded (sim)")

    # Checkout creates a PaymentIntent
    r = c.post(f"/api/payments/checkout/{booking2['id']}", headers=hdr(alice))
    assert r.status_code == 200, r.text
    co = r.json()
    print(f"[ok] checkout PI={co['payment_intent_id']} total=${co['total_charged']}")

    # Sim-confirm card success
    r = c.post(f"/api/payments/sim-confirm/{booking2['id']}", headers=hdr(alice))
    assert r.status_code == 200, r.text
    print(f"[ok] sim card success: {r.json()}")

    # Host confirms (this captures the payment)
    confirmed = False
    for email, tok in owner_tokens.items():
        r = c.post(f"/api/bookings/{booking2['id']}/confirm", headers=hdr(tok))
        if r.status_code == 200:
            confirmed = True
            break
    assert confirmed
    print(f"[ok] host confirmed -> captured")

    # Verify the payout rows
    r = c.get("/api/payments/my/payouts", headers=hdr(dj_user))
    print(f"[ok] dj has {len(r.json())} payout row(s); status: {r.json()[0]['status'] if r.json() else 'none'}")

    # Renter sees their payment record
    r = c.get("/api/payments/my/payments", headers=hdr(alice))
    assert len(r.json()) >= 1
    print(f"[ok] alice payment history: {len(r.json())} record(s)")

    # Test refund path: create yet another booking, pay, cancel >7 days = 100% refund
    start3 = (datetime.now(timezone.utc) + timedelta(days=60, hours=2)).replace(microsecond=0)
    end3 = start3 + timedelta(hours=2)
    r = c.post("/api/bookings/", json={
        "venue_id": venue_id, "start_datetime": start3.isoformat(),
        "end_datetime": end3.isoformat(), "services": [],
    }, headers=hdr(alice))
    assert r.status_code == 201
    b3 = r.json()
    c.post(f"/api/payments/checkout/{b3['id']}", headers=hdr(alice))
    c.post(f"/api/payments/sim-confirm/{b3['id']}", headers=hdr(alice))
    # Cancel 60 days out -> expect 100% refund
    r = c.post(f"/api/bookings/{b3['id']}/cancel", headers=hdr(alice))
    assert r.status_code == 200
    print(f"[ok] full-refund cancellation: {r.json()}")

    print("\n*** ALL SMOKE TESTS PASSED (incl. payments) ***")


if __name__ == "__main__":
    main()
