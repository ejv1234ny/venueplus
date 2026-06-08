"""Tests for the agent control plane (/api/agents) + guardrails."""
from agents.types import AutonomyConfig, RiskLevel, Decision
from agents import guardrails


# --------------------------------------------------------------------------- #
# Guardrail policy unit tests                                                 #
# --------------------------------------------------------------------------- #
def test_default_policy_auto_for_low_risk():
    cfg = AutonomyConfig()
    assert guardrails.evaluate(RiskLevel.READ, cfg) == Decision.AUTO
    assert guardrails.evaluate(RiskLevel.INTERNAL_WRITE, cfg) == Decision.AUTO
    assert guardrails.evaluate(RiskLevel.OUTBOUND, cfg) == Decision.REQUIRE_APPROVAL
    assert guardrails.evaluate(RiskLevel.FINANCIAL, cfg) == Decision.REQUIRE_APPROVAL


def test_money_movement_and_legal_are_hard_gated():
    # Even if a caller tries to set them to AUTO, they clamp to approval.
    cfg = AutonomyConfig({RiskLevel.MONEY_MOVEMENT: Decision.AUTO,
                          RiskLevel.LEGAL: Decision.AUTO})
    assert cfg.decision_for(RiskLevel.MONEY_MOVEMENT) == Decision.REQUIRE_APPROVAL
    assert cfg.decision_for(RiskLevel.LEGAL) == Decision.REQUIRE_APPROVAL
    assert guardrails.evaluate(RiskLevel.MONEY_MOVEMENT, cfg) == Decision.REQUIRE_APPROVAL
    assert guardrails.evaluate(RiskLevel.LEGAL, cfg) == Decision.REQUIRE_APPROVAL


# --------------------------------------------------------------------------- #
# Endpoint auth                                                               #
# --------------------------------------------------------------------------- #
def test_agents_endpoints_require_admin(client, renter_headers):
    assert client.get("/api/agents/runs").status_code == 401  # no token
    assert client.get("/api/agents/runs", headers=renter_headers).status_code == 403


# --------------------------------------------------------------------------- #
# Run a goal end-to-end                                                       #
# --------------------------------------------------------------------------- #
def test_run_goal_creates_trace_and_escalations(client, admin_headers):
    body = {"goal": "Grow supply with paid ads, a referral payout, and a "
                    "partnership agreement", "city": "Austin TX"}
    r = client.post("/api/agents/goals", json=body, headers=admin_headers)
    assert r.status_code == 200, r.text
    data = r.json()
    run_id = data["run_id"]
    summary = data["summary"]

    # documented summary shape
    assert set(summary) == {"jobs_planned", "statuses", "actions_total",
                            "actions_executed", "needs_approval", "blocked"}
    assert summary["jobs_planned"] == 3
    # venues(3) + providers(3) + marketing(5: write, outbound, financial,
    # money_movement, legal) = 11 actions
    assert summary["actions_total"] == 11
    # auto-executed: venues read+write, providers read+write, marketing write
    assert summary["actions_executed"] == 5
    # outbound x3 + financial + money_movement + legal = 6 escalations
    assert summary["needs_approval"] == 6
    assert data["escalations_open"] == 6

    # full trace
    trace = client.get(f"/api/agents/runs/{run_id}", headers=admin_headers).json()
    agents_seen = {j["agent"] for j in trace["jobs"]}
    assert agents_seen == {"venues", "providers", "marketing"}

    marketing = next(j for j in trace["jobs"] if j["agent"] == "marketing")
    by_risk = {a["risk"]: a for a in marketing["actions"]}
    assert by_risk["money_movement"]["decision"] == "require_approval"
    assert by_risk["money_movement"]["executed"] is False
    assert by_risk["legal"]["decision"] == "require_approval"
    assert by_risk["internal_write"]["decision"] == "auto"
    assert by_risk["internal_write"]["executed"] is True


def test_approve_and_reject_escalations(client, admin_headers):
    client.post("/api/agents/goals",
                json={"goal": "Expand into Austin", "city": "Austin TX"},
                headers=admin_headers)
    escs = client.get("/api/agents/escalations", headers=admin_headers).json()
    assert len(escs) == 3  # one outbound per agent
    for e in escs:
        assert set(e) >= {"id", "agent", "tool", "risk", "args", "reason", "run_id"}

    approve = client.post(f"/api/agents/escalations/{escs[0]['id']}/approve",
                          headers=admin_headers).json()
    assert approve == {"ok": True, "status": "approved"}

    reject = client.post(f"/api/agents/escalations/{escs[1]['id']}/reject",
                         headers=admin_headers).json()
    assert reject["status"] == "rejected"

    # re-resolving a closed escalation is a conflict
    again = client.post(f"/api/agents/escalations/{escs[0]['id']}/approve",
                        headers=admin_headers)
    assert again.status_code == 409

    # one escalation remains open
    remaining = client.get("/api/agents/escalations", headers=admin_headers).json()
    assert len(remaining) == 1


def test_kill_switch_blocks_new_runs(client, admin_headers):
    off = client.post("/api/agents/kill", json={"enabled": False},
                      headers=admin_headers).json()
    assert off == {"fleet_enabled": False}

    blocked = client.post("/api/agents/goals", json={"goal": "anything"},
                          headers=admin_headers)
    assert blocked.status_code == 409

    on = client.post("/api/agents/kill", json={"enabled": True},
                     headers=admin_headers).json()
    assert on == {"fleet_enabled": True}
    ok = client.post("/api/agents/goals", json={"goal": "anything"},
                     headers=admin_headers)
    assert ok.status_code == 200
