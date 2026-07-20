"""Framework-layer tests added by the PR #2 -> PR #3 reconciliation.

Covers the pieces folded in from the agent-operations branch: spend/outbound
CAPS, the ``mostly_autonomous`` autonomy preset, the tool registry, and the
LLM sim provider. Self-contained (its own in-memory SQLite session), so it
needs no conftest fixtures and runs under pytest or directly.

It also re-asserts that the *default* posture and the hard gates are unchanged,
so the conservative behaviour the rest of the suite relies on is locked in.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base
import models, models_agents  # noqa: F401  (register tables on Base)
from agents import guardrails, orchestrator, tools, llm
from agents.types import AutonomyConfig, RiskLevel, Decision

BIG_GOAL = ("Grow supply with paid ads, a referral payout, and a "
            "partnership agreement")


def _session():
    eng = create_engine("sqlite://", connect_args={"check_same_thread": False})
    Base.metadata.create_all(eng)
    return sessionmaker(bind=eng)()


# --- default posture / hard gates unchanged -------------------------------- #
def test_default_posture_unchanged():
    cfg = AutonomyConfig()
    assert guardrails.evaluate(RiskLevel.READ, cfg) == Decision.AUTO
    assert guardrails.evaluate(RiskLevel.INTERNAL_WRITE, cfg) == Decision.AUTO
    assert guardrails.evaluate(RiskLevel.OUTBOUND, cfg) == Decision.REQUIRE_APPROVAL
    assert guardrails.evaluate(RiskLevel.FINANCIAL, cfg) == Decision.REQUIRE_APPROVAL


def test_hard_gates_clamped_even_if_set_auto():
    cfg = AutonomyConfig({RiskLevel.MONEY_MOVEMENT: Decision.AUTO,
                          RiskLevel.LEGAL: Decision.AUTO})
    assert guardrails.evaluate(RiskLevel.MONEY_MOVEMENT, cfg) == Decision.REQUIRE_APPROVAL
    assert guardrails.evaluate(RiskLevel.LEGAL, cfg) == Decision.REQUIRE_APPROVAL


def test_run_goal_trace_unchanged_under_default_config():
    db = _session()
    run = orchestrator.run_goal(db, BIG_GOAL, "Austin TX")
    s = run.summary
    assert s["jobs_planned"] == 3
    assert s["actions_total"] == 11
    assert s["actions_executed"] == 5
    assert s["needs_approval"] == 6


# --- mostly_autonomous preset ---------------------------------------------- #
def test_mostly_autonomous_preset():
    ma = AutonomyConfig.mostly_autonomous()
    assert guardrails.evaluate(RiskLevel.OUTBOUND, ma) == Decision.AUTO
    assert guardrails.evaluate(RiskLevel.FINANCIAL, ma) == Decision.AUTO
    # hard gates survive the looser preset
    assert guardrails.evaluate(RiskLevel.MONEY_MOVEMENT, ma) == Decision.REQUIRE_APPROVAL
    assert guardrails.evaluate(RiskLevel.LEGAL, ma) == Decision.REQUIRE_APPROVAL


def test_mostly_autonomous_end_to_end_keeps_hard_gates():
    db = _session()
    run = orchestrator.run_goal(db, BIG_GOAL, "Austin TX",
                                AutonomyConfig.mostly_autonomous())
    s = run.summary
    # outbound x3 + financial x1 now auto; only money_movement + legal escalate
    assert s["actions_executed"] == 9
    assert s["needs_approval"] == 2
    gated = {a.risk.value for j in run.jobs for a in j.actions
             if a.decision == Decision.REQUIRE_APPROVAL}
    assert gated == {"money_movement", "legal"}


# --- caps ------------------------------------------------------------------ #
def test_outbound_cap_downgrades_to_approval():
    cfg = AutonomyConfig.mostly_autonomous(outbound_daily_cap=5)
    u = guardrails.UsageTracker()
    assert guardrails.evaluate(RiskLevel.OUTBOUND, cfg, u, {"count": 3}) == Decision.AUTO
    u.record(RiskLevel.OUTBOUND, {"count": 3})
    assert guardrails.evaluate(RiskLevel.OUTBOUND, cfg, u, {"count": 3}) == Decision.REQUIRE_APPROVAL


def test_spend_cap_downgrades_to_approval():
    cfg = AutonomyConfig.mostly_autonomous(spend_daily_cap_cents=50_000)
    assert guardrails.evaluate(RiskLevel.FINANCIAL, cfg, guardrails.UsageTracker(),
                               {"budget_usd": 400}) == Decision.AUTO
    assert guardrails.evaluate(RiskLevel.FINANCIAL, cfg, guardrails.UsageTracker(),
                               {"budget_usd": 600}) == Decision.REQUIRE_APPROVAL


# --- tool registry / llm --------------------------------------------------- #
def test_tool_registry_agrees_with_planner():
    # Every action any specialist plans (deterministic fallback path) must carry
    # the same risk the tool registry assigns — risk is defined once, in the
    # registry, and the planner may never disagree.
    from agents.specialists import SPECIALISTS
    for name in SPECIALISTS:
        agent = orchestrator.build_agent(name)
        for a in agent.fallback_plan(BIG_GOAL, "Austin TX", {}):
            assert tools.risk_for(a.tool) == a.risk, a.tool


def test_llm_sim_provider():
    p = llm.LLMProvider()
    assert p.complete("s", [{"role": "user", "content": "x"}]) == {
        "text": "", "tool_calls": [], "stop": "end_turn"}
    p2 = llm.LLMProvider(scripted_turns=[
        {"text": "hi", "tool_calls": [{"name": "t", "input": {}}], "stop": "tool_use"}])
    assert p2.complete("s", [])["tool_calls"][0]["name"] == "t"
