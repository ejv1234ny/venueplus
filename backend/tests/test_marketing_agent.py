"""Tests for the third real worker agent (Marketing): its Claude planning loop,
the read-before-spend market-metrics tool, dry-run marketing handlers, and the
preserved /api/agents contract. Mirrors the venues/providers agent tests.
"""
from agents import tools, guardrails
from agents.tools import ToolContext
from agents.llm import LLMProvider
from agents.types import RiskLevel, Decision, AutonomyConfig
from agents.specialists import MarketingAgent, build_agent


def test_marketing_fallback_full_goal_is_five_actions():
    goal = "Grow with paid ads, a referral payout, and a partnership agreement"
    plan = MarketingAgent(llm=LLMProvider()).propose_actions(goal, "Austin TX")
    assert [(a.tool, a.risk) for a in plan] == [
        ("generate_seo_content", RiskLevel.INTERNAL_WRITE),
        ("publish_social_post", RiskLevel.OUTBOUND),
        ("launch_paid_ad_campaign", RiskLevel.FINANCIAL),
        ("issue_referral_payout", RiskLevel.MONEY_MOVEMENT),
        ("sign_partnership_agreement", RiskLevel.LEGAL),
    ]


def test_marketing_fallback_plain_goal_is_two_actions():
    plan = MarketingAgent(llm=LLMProvider()).propose_actions("Expand into Austin", "Austin TX")
    assert [a.tool for a in plan] == ["generate_seo_content", "publish_social_post"]


def test_marketing_exposes_market_metrics_read():
    assert "read_market_metrics" in MarketingAgent.tool_names


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


def test_marketing_real_loop_reads_then_promotes():
    turns = [
        {"text": "", "stop": "tool_use", "tool_calls": [
            {"name": "read_market_metrics", "input": {"city": "Austin TX", "reason": "check supply"}},
        ]},
        {"text": "", "stop": "end_turn", "tool_calls": [
            {"name": "generate_seo_content", "input": {"city": "Austin TX", "reason": "organic first"}},
            {"name": "publish_social_post", "input": {"city": "Austin TX", "reason": "announce"}},
        ]},
    ]
    plan = MarketingAgent(llm=_FakeLLM(turns)).propose_actions("g", "Austin TX")
    assert [a.tool for a in plan] == ["read_market_metrics", "generate_seo_content", "publish_social_post"]
    assert plan[0].risk == RiskLevel.READ


def test_market_metrics_sim_reports_no_supply():
    r = tools.execute("read_market_metrics", {"city": "Austin TX"},
                      ToolContext(db=None, live=False, dry_run=True))
    assert r["ok"] and r["has_supply"] is False and r["venues"] == 0


def test_marketing_writes_are_dry_run_and_hard_gates_safe():
    ctx = ToolContext(db=None, live=False, dry_run=True)
    assert tools.execute("generate_seo_content", {"city": "X"}, ctx).get("dry_run") is True
    assert tools.execute("launch_paid_ad_campaign", {"city": "X"}, ctx).get("dry_run") is True
    # hard-gated tools, if ever executed post-approval, stay dry-run
    assert tools.execute("issue_referral_payout", {"amount_usd": 50}, ctx).get("dry_run") is True
    assert tools.execute("sign_partnership_agreement", {"partner": "x"}, ctx).get("dry_run") is True
