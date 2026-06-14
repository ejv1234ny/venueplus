"""Free-mode money tests.

FREE_MODE (config.is_free_mode) makes the service free and ensures no money
moves: breakdowns/payouts/settlement are zero and no deposit is required. With
FREE_MODE off (the default), the paid 12%-fee behaviour is unchanged.

These are pure money-math tests (no DB/HTTP). is_free_mode() reads the env live,
so we toggle it with monkeypatch.
"""
import config
from services import payments as p
from services import creator_events as ce


# --------------------------- paid mode (default) --------------------------- #
def test_paid_mode_is_unchanged(monkeypatch):
    monkeypatch.delenv("FREE_MODE", raising=False)
    assert config.is_free_mode() is False
    bd = p.compute_breakdown(10000)              # $100 subtotal
    assert bd["platform_fee_cents"] == 1200      # 12%
    assert bd["total_charged_cents"] > 10000     # + stripe gross-up
    payouts = p.split_payouts(10000, [{"gross_cents": 10000, "recipient_type": "host"}])
    assert payouts[0]["net_cents"] == 8800
    assert ce.ticket_breakdown(5000, 2)["platform_fee_cents"] == 1200
    assert ce.suggested_deposit_cents([{"gross_cents": 30000}]) == 30000


# ------------------------------- free mode --------------------------------- #
def test_free_mode_zeroes_booking_breakdown(monkeypatch):
    monkeypatch.setenv("FREE_MODE", "true")
    bd = p.compute_breakdown(10000)
    assert bd["platform_fee_cents"] == 0
    assert bd["stripe_fee_cents"] == 0
    assert bd["total_charged_cents"] == 0
    assert bd["free_mode"] is True


def test_free_mode_no_payouts(monkeypatch):
    monkeypatch.setenv("FREE_MODE", "true")
    payouts = p.split_payouts(10000, [
        {"gross_cents": 10000, "recipient_type": "host"},
        {"gross_cents": 8000, "recipient_type": "provider"},
    ])
    assert all(po["net_cents"] == 0 and po["platform_fee_cents"] == 0 for po in payouts)


def test_free_mode_payment_intent_is_noop(monkeypatch):
    monkeypatch.setenv("FREE_MODE", "true")
    intent = p.create_payment_intent(0, "buyer@example.com", {"kind": "ticket"})
    assert intent["status"] == "free_mode" and intent["id"].startswith("free_")
    assert intent["client_secret"] is None


def test_free_mode_tickets_are_free(monkeypatch):
    monkeypatch.setenv("FREE_MODE", "true")
    tb = ce.ticket_breakdown(5000, 3)            # would be $150 paid
    # total 0 -> the purchase endpoint takes its free-RSVP path (no PaymentIntent)
    assert tb["total_charged_cents"] == 0 and tb["platform_fee_cents"] == 0


def test_free_mode_no_deposit_and_empty_settlement(monkeypatch):
    monkeypatch.setenv("FREE_MODE", "true")
    cost_lines = [
        {"recipient_user_id": 1, "recipient_type": "host", "gross_cents": 30000,
         "venue_id": 1, "booking_service_id": None},
        {"recipient_user_id": 2, "recipient_type": "provider", "gross_cents": 8000,
         "venue_id": None, "booking_service_id": 5},
    ]
    assert ce.suggested_deposit_cents(cost_lines) == 0          # no deposit held
    plan = ce.compute_settlement(0, cost_lines)
    assert plan["cost_payouts"] == []                          # nothing paid out
    assert plan["creator_net_cents"] == 0
    assert plan["deposit_shortfall_cents"] == 0
    assert plan["fully_funded"] is True
