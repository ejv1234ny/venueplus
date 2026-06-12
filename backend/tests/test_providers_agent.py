"""Tests for the second real worker agent (Providers): its Claude planning
loop, the real/dry-run provider tool handlers, and the preserved /api/agents
contract. Mirrors test_venues_agent.py.
"""
from agents import tools, guardrails
from agents.tools import ToolContext
from agents.llm import LLMProvider
from agents.types import RiskLevel
from agents.specialists import ProvidersAgent


def test_providers_fallback_is_canonical_plan():
    plan = ProvidersAgent(llm=LLMProvider()).propose_actions("Grow supply", "Austin TX")
    assert [(a.tool, a.risk) for a in plan] == [
        ("search_providers", RiskLevel.READ),
        ("create_provider_invite", RiskLevel.INTERNAL_WRITE),
        ("send_provider_sms", RiskLevel.OUTBOUND),
    ]


def test_providers_exposes_coverage_read_to_real_loop():
    assert "list_existing_providers" in ProvidersAgent.tool_names


class _FakeLLM(LLMProvider):
    def __init__(self, turns):
        super().__init__()
        self._turns = list(turns)

    @property
    def is_real(self):
        return True

    def complete(self, system, messages, tools=None):
        return self._turns.pop(0) if self._turns else {
            "text": "", "tool_calls": [], "stop": "end_turn"}


def test_providers_real_loop_reads_then_recruits():
    turns = [
        {"text": "", "stop": "tool_use", "tool_calls": [
            {"name": "list_existing_providers", "input": {"city": "Austin TX", "reason": "gaps"}},
            {"name": "search_providers", "input": {"city": "Austin TX", "reason": "scout"}},
        ]},
        {"text": "", "stop": "end_turn", "tool_calls": [
            {"name": "create_provider_invite", "input": {"city": "Austin TX", "reason": "invite caterer"}},
            {"name": "send_provider_sms", "input": {"city": "Austin TX", "reason": "nudge"}},
        ]},
    ]
    plan = ProvidersAgent(llm=_FakeLLM(turns)).propose_actions("g", "Austin TX")
    assert [a.tool for a in plan] == ["list_existing_providers", "search_providers",
                                      "create_provider_invite", "send_provider_sms"]
    assert [a.risk for a in plan] == [RiskLevel.READ, RiskLevel.READ,
                                      RiskLevel.INTERNAL_WRITE, RiskLevel.OUTBOUND]


def test_provider_read_handlers_sim_and_coverage():
    ctx = ToolContext(db=None, live=False, dry_run=True)
    sp = tools.execute("search_providers", {"city": "Austin TX"}, ctx)
    assert sp["ok"] and sp["live"] is False and len(sp["candidates"]) >= 1
    lp = tools.execute("list_existing_providers", {"city": "Austin TX"}, ctx)
    assert lp["ok"] and lp["providers"] == [] and len(lp["missing_categories"]) >= 1


def test_provider_write_outbound_are_dry_run():
    ctx = ToolContext(db=None, live=False, dry_run=True)
    assert tools.execute("create_provider_invite", {"city": "X"}, ctx).get("dry_run") is True
    assert tools.execute("send_provider_sms", {"city": "X"}, ctx).get("dry_run") is True
