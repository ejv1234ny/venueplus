"""COO / Orchestrator — the control plane.

Decomposes a company goal into specialist Jobs, sequences supply before demand,
dispatches via the shared `run(job)` contract, reroutes blocked demand work to
supply agents, and assembles a KPI/escalation report. Decomposition + routing
are deterministic code (testable, reliable); specialist reasoning is delegated.
"""
from __future__ import annotations

import re

from .guardrails import GuardrailEngine, UsageTracker
from .llm import LLMProvider
from .tools import ToolRegistry, default_registry
from .types import AutonomyConfig, Job, JobStatus


SUPPLY = ("venues", "providers")


class COO:
    def __init__(self, agents: dict, guardrails: GuardrailEngine,
                 llm: LLMProvider | None = None):
        self.agents = agents
        self.guardrails = guardrails
        self.llm = llm or LLMProvider()
        self.history: list[dict] = []

    # ---- planning ----
    @staticmethod
    def _extract_city(goal: str) -> str | None:
        m = re.search(r"\bin ([A-Z][a-zA-Z]+(?: [A-Z][a-zA-Z]+)?)", goal)
        return m.group(1) if m else None

    def decompose(self, goal: str, city: str | None = None) -> list[Job]:
        text = goal.lower()
        city = city or self._extract_city(goal)
        wants: list[str] = []
        if any(k in text for k in ("venue", "space", "property", "listing", "owner", "rooftop")):
            wants.append("venues")
        if any(k in text for k in ("provider", "service", "security", "dj", "staff", "gig", "catering")):
            wants.append("providers")
        if any(k in text for k in ("demand", "market", "influencer", "creator", "book", "ticket", "promote")):
            wants.append("marketing")
        if not wants or "launch" in text or "liquidity" in text:
            wants = ["venues", "providers", "marketing"]   # full market launch
        # de-dupe, keep supply-before-demand order
        order = [a for a in ("venues", "providers", "marketing") if a in wants]
        return [Job(agent=a, objective=f"{a} work for: {goal}", city=city,
                    metric="progress", target=1.0) for a in order]

    # ---- execution ----
    def run_goal(self, goal: str, city: str | None = None) -> dict:
        jobs = self.decompose(goal, city)
        results = []

        # 1) Supply first
        for job in [j for j in jobs if j.agent in SUPPLY]:
            results.append(self.agents[job.agent].run(job))

        coverage_ok = any(r.agent == "providers" and r.status == JobStatus.DONE
                          for r in results)

        # 2) Demand, with coverage flag; reroute if blocked
        for job in [j for j in jobs if j.agent == "marketing"]:
            job.context["coverage_ok"] = coverage_ok
            r = self.agents["marketing"].run(job)
            if r.status == JobStatus.BLOCKED:
                fix = Job(agent="providers", city=job.city,
                          objective=f"Remediate coverage blocking: {goal}")
                fr = self.agents["providers"].run(fix)
                results.append(fr)
                job.context["coverage_ok"] = (fr.status == JobStatus.DONE)
                r = self.agents["marketing"].run(job)
            results.append(r)

        report = self._report(goal, jobs, results)
        self.history.append(report)
        return report

    def _report(self, goal: str, jobs: list[Job], results: list) -> dict:
        escalations = [e for r in results for e in r.escalations]
        return {
            "goal": goal,
            "jobs_planned": len(jobs),
            "results": results,
            "statuses": [(r.agent, r.status.value) for r in results],
            "actions_total": sum(len(r.actions) for r in results),
            "actions_executed": sum(1 for r in results for a in r.actions if a.executed),
            "escalations": escalations,
            "needs_approval": len(escalations),
            "blocked": [b for r in results for b in r.blockers],
        }


def build_system(config: AutonomyConfig | None = None) -> COO:
    """Wire registry + guardrails + the three specialists + COO."""
    from .specialists import build_specialists
    registry = default_registry()
    guardrails = GuardrailEngine(config or AutonomyConfig(), UsageTracker())
    llm = LLMProvider()
    agents = build_specialists(registry, guardrails, llm)
    return COO(agents, guardrails, llm)
