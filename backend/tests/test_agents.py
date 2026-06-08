"""Deterministic tests for the agent framework (no LLM, no DB).

Run from backend/:  python -m pytest tests/test_agents.py  (or: python tests/test_agents.py)
"""
from agents import (default_registry, GuardrailEngine, UsageTracker,
                    AutonomyConfig, Decision, RiskLevel)
from agents.orchestrator import COO, build_system
from agents.types import JobStatus

PASS = []
def check(label, cond):
    PASS.append(cond)
    print(f"  [{'PASS' if cond else 'FAIL'}] {label}")


print("== Guardrail policy ==")
reg = default_registry()
g = GuardrailEngine(AutonomyConfig(), UsageTracker())

def decide(agent, tool_name, **args):
    return g.evaluate(agent, reg.get(tool_name), args)[0]

check("read -> AUTO", decide("venues", "search_market") == Decision.AUTO)
check("internal_write -> AUTO", decide("venues", "draft_venue_listing") == Decision.AUTO)
check("outbound within cap -> AUTO", decide("venues", "send_outreach", count=10) == Decision.AUTO)
check("financial within cap -> AUTO", decide("marketing", "spend_ad_budget", amount_cents=10_000) == Decision.AUTO)
check("money_movement -> APPROVAL (hard gate)",
      decide("venues", "issue_payout", amount_cents=100) == Decision.REQUIRE_APPROVAL)
check("legal -> APPROVAL (hard gate)", decide("venues", "sign_agreement") == Decision.REQUIRE_APPROVAL)

g2 = GuardrailEngine(AutonomyConfig(), UsageTracker())
def decide2(agent, tool_name, **args):
    return g2.evaluate(agent, reg.get(tool_name), args)[0]
check("outbound over cap -> APPROVAL", decide2("marketing", "send_outreach", count=500) == Decision.REQUIRE_APPROVAL)
check("financial over cap -> APPROVAL", decide2("marketing", "spend_ad_budget", amount_cents=75_000) == Decision.REQUIRE_APPROVAL)
check("unauthorized tool -> DENY", decide2("providers", "set_price", amount_cents=0) == Decision.DENY)

g3 = GuardrailEngine(AutonomyConfig(enabled=False), UsageTracker())
check("kill switch -> DENY", g3.evaluate("venues", reg.get("search_market"), {})[0] == Decision.DENY)


print("\n== COO decomposition ==")
coo = build_system()
jobs = coo.decompose("Launch the marketplace in Austin")
check("launch -> 3 jobs", len(jobs) == 3)
check("supply before demand order",
      [j.agent for j in jobs] == ["venues", "providers", "marketing"])
check("city extracted", all(j.city == "Austin" for j in jobs))

jobs2 = coo.decompose("Recruit rooftop venue owners in Denver")
check("venue-only goal -> venues job present", any(j.agent == "venues" for j in jobs2))


print("\n== End-to-end run (fully sequenced) ==")
coo = build_system()
report = coo.run_goal("Reach booking liquidity in Austin")
agents_run = [a for a, _ in report["statuses"]]
check("all three agents ran", set(["venues", "providers", "marketing"]) <= set(agents_run))
check("actions executed > 0", report["actions_executed"] > 0)
check("financial over-cap escalated", report["needs_approval"] >= 1)
esc_tools = [e.action.tool for r in report["results"] for e in r.escalations]
check("the escalated action is the ad spend", "spend_ad_budget" in esc_tools)
venue_res = [r for r in report["results"] if r.agent == "venues"][0]
check("venues auto-executed its listing draft",
      any(a.tool == "draft_venue_listing" and a.executed for a in venue_res.actions))


print("\n== COO reroute on blocked demand ==")
coo = build_system()
rep = coo.run_goal("Promote creator events in Reno")
ran = [a for a, _ in rep["statuses"]]
check("COO injected a providers job to fix coverage", "providers" in ran)
check("marketing eventually proceeded (needs approval on spend)", rep["needs_approval"] >= 1)


print("\n========================================")
print(f"RESULT: {sum(PASS)}/{len(PASS)} checks passed")
print("========================================")
import sys
sys.exit(0 if all(PASS) else 1)
