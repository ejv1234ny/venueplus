"""Tests for the first real worker agent (Venues) + its Claude planning loop,
the dry-run tool handlers, and the COO delegating to it.

The agent-logic tests need no DB or network. The end-to-end test drives the
existing /api/agents control plane to confirm the COO still produces the
documented trace once the venues job is planned by VenuesAgent instead of a
hardcoded plan.
"""
import pytest

from agents import tools, guardrails
from agents.tools import ToolContext
from agents.llm import LLMProvider
from agents.types import RiskLevel, Decision, AutonomyConfig
from agents.specialists import (VenuesAgent, ProvidersAgent, MarketingAgent,
                                build_agent, SPECIALISTS)


# --------------------------------------------------------------------------- #
# Deterministic fallback (no ANTHROPIC_API_KEY -> reproducible plan)          #
# --------------------------------------------------------------------------- #
def test_venues_fallback_is_canonical_plan():
    plan = VenuesAgent(llm=LLMProvider()).propose_actions("Grow supply", "Austin TX")
    assert [(a.tool, a.risk) for a in plan] == [
        ("search_osm_venues", RiskLevel.READ),
        ("draft_venue_listing", RiskLevel.INTERNAL_WRITE),
        ("send_venue_outreach_email", RiskLevel.OUTBOUND),
    ]
    assert all(a.args.get("city") == "Austin TX" for a in plan)


def test_planner_and_registry_agree_on_risk():
    for name, cls in SPECIALISTS.items():
        for a in cls(llm=LLMProvider()).fallback_plan("g", "City", {}):
            assert tools.risk_for(a.tool) == a.risk, (name, a.tool)


# --------------------------------------------------------------------------- #
# Real Claude tool-calling loop (scripted fake provider)                      #
# --------------------------------------------------------------------------- #
class _FakeLLM(LLMProvider):
    """is_real=True, returns scripted turns instead of calling the API."""
    def __init__(self, turns):
        super().__init__()
        self._turns = list(turns)

    @property
    def is_real(self):
        return True

    def complete(self, system, messages, tools=None):
        return self._turns.pop(0) if self._turns else {
            "text": "", "tool_calls": [], "stop": "end_turn"}


def test_real_loop_parses_tool_calls_and_looks_up_risk():
    turns = [
        {"text": "read first", "stop": "tool_use", "tool_calls": [
            {"name": "list_existing_venues", "input": {"city": "Austin TX", "reason": "dedupe"}},
            {"name": "search_osm_venues", "input": {"city": "Austin TX", "reason": "scout"}},
        ]},
        {"text": "now writes", "stop": "end_turn", "tool_calls": [
            {"name": "draft_venue_listing", "input": {"city": "Austin TX", "reason": "draft"}},
            {"name": "send_venue_outreach_email", "input": {"city": "Austin TX", "reason": "invite"}},
        ]},
    ]
    plan = VenuesAgent(llm=_FakeLLM(turns)).propose_actions("Grow supply", "Austin TX")
    assert [a.tool for a in plan] == ["list_existing_venues", "search_osm_venues",
                                      "draft_venue_listing", "send_venue_outreach_email"]
    assert [a.risk for a in plan] == [RiskLevel.READ, RiskLevel.READ,
                                      RiskLevel.INTERNAL_WRITE, RiskLevel.OUTBOUND]
    assert plan[0].reason == "dedupe"


def test_real_loop_ignores_hallucinated_tool():
    turns = [{"text": "", "stop": "end_turn", "tool_calls": [
        {"name": "made_up_tool", "input": {}},
        {"name": "search_osm_venues", "input": {"city": "X"}},
    ]}]
    plan = VenuesAgent(llm=_FakeLLM(turns)).propose_actions("g", "X")
    assert [a.tool for a in plan] == ["search_osm_venues"]


def test_loop_respects_max_steps():
    # A provider that always wants another tool must still terminate.
    forever = [{"text": "", "stop": "tool_use",
                "tool_calls": [{"name": "search_osm_venues", "input": {}}]}] * 50
    agent = VenuesAgent(llm=_FakeLLM(forever))
    plan = agent.propose_actions("g", "X")
    assert len(plan) <= agent.max_steps


# --------------------------------------------------------------------------- #
# Dry-run / sim tool handlers                                                 #
# --------------------------------------------------------------------------- #
def test_sim_read_returns_sample_without_network():
    r = tools.execute("search_osm_venues", {"city": "Austin TX"},
                      ToolContext(db=None, live=False, dry_run=True))
    assert r["ok"] and r["live"] is False and len(r["candidates"]) >= 1


def test_dry_run_write_and_outbound_have_no_side_effect():
    ctx = ToolContext(db=None, live=False, dry_run=True)
    draft = tools.execute("draft_venue_listing", {"city": "X"}, ctx)
    email = tools.execute("send_venue_outreach_email", {"city": "X"}, ctx)
    assert draft.get("dry_run") is True
    assert email.get("dry_run") is True


def test_unknown_tool_returns_error_not_raise():
    r = tools.execute("definitely_not_a_tool", {}, ToolContext())
    assert r["ok"] is False and "unknown tool" in r["error"]


# --------------------------------------------------------------------------- #
# COO delegates to VenuesAgent; documented trace is preserved (end-to-end)    #
# --------------------------------------------------------------------------- #
def test_run_goal_trace_after_delegation(client, admin_headers):
    body = {"goal": "Grow supply with paid ads, a referral payout, and a "
                    "partnership agreement", "city": "Austin TX"}
    r = client.post("/api/agents/goals", json=body, headers=admin_headers)
    assert r.status_code == 200, r.text
    summary = r.json()["summary"]
    # venues(3) + providers(3) + marketing(5) = 11; auto = 5; escalations = 6.
    assert summary["jobs_planned"] == 3
    assert summary["actions_total"] == 11
    assert summary["actions_executed"] == 5
    assert summary["needs_approval"] == 6

    trace = client.get(f"/api/agents/runs/{r.json()['run_id']}",
                       headers=admin_headers).json()
    venues = next(j for j in trace["jobs"] if j["agent"] == "venues")
    by_tool = {a["tool"]: a for a in venues["actions"]}
    # venues job is now produced by VenuesAgent's plan and executed (dry-run)
    assert by_tool["search_osm_venues"]["decision"] == "auto"
    assert by_tool["search_osm_venues"]["executed"] is True
    assert by_tool["draft_venue_listing"]["executed"] is True       # internal_write auto
    assert by_tool["send_venue_outreach_email"]["decision"] == "require_approval"
    assert by_tool["send_venue_outreach_email"]["executed"] is False
