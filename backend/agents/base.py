"""Base agent: the shared contract every specialist implements.

run(job) executes the pipeline:
    propose_actions(job, state)   # what to do (LLM in prod, deterministic in sim)
      -> for each proposed tool call:
           guardrail.evaluate -> AUTO   : execute handler, record result
                              -> APPROVE : create Escalation, do NOT execute
                              -> DENY    : record, skip
      -> report() -> JobResult

Specialists override `propose_actions` (and declare their tool names + system
prompt). Because they all share this interface and the Job/JobResult contract,
the COO depends only on `run(job)` — so Venues/Providers/Marketing can be built
in parallel.
"""
from __future__ import annotations

from .guardrails import GuardrailEngine
from .llm import LLMProvider
from .tools import ToolRegistry
from .types import (ActionRecord, Decision, Escalation, Job, JobResult,
                    JobStatus, RiskLevel)


class BaseAgent:
    name: str = "base"
    role: str = ""
    system_prompt: str = ""
    tool_names: tuple = ()
    max_steps: int = 8

    def __init__(self, registry: ToolRegistry, guardrails: GuardrailEngine,
                 llm: LLMProvider | None = None):
        self.registry = registry
        self.guardrails = guardrails
        self.llm = llm or LLMProvider()

    # ---- specialists override this ----
    def propose_actions(self, job: Job, state: dict) -> list[dict]:
        """Return a list of {"tool": name, "args": {...}} to attempt this step.
        Default implementation asks the LLM; sim specialists override with
        deterministic plans for testing."""
        tools_spec = [{"name": t.name, "description": t.description,
                       "input_schema": {"type": "object", "properties": {}}}
                      for t in self.registry.for_agent(self.name)
                      if t.name in self.tool_names]
        turn = self.llm.complete(
            system=self.system_prompt,
            messages=[{"role": "user", "content": job.objective}],
            tools=tools_spec,
        )
        return [{"tool": c["name"], "args": c.get("input", {})}
                for c in turn.get("tool_calls", [])]

    def check_blockers(self, job: Job) -> list[str]:
        """Return cross-side dependencies that must be resolved before this job
        can proceed (e.g. demand work blocked by missing supply). The COO reads
        these to reroute work. Default: none."""
        return []

    # ---- shared pipeline ----
    def run(self, job: Job) -> JobResult:
        result = JobResult(job_id=job.id, agent=self.name,
                           status=JobStatus.IN_PROGRESS,
                           progress_target=job.target or 0.0)

        result.blockers = self.check_blockers(job)
        if result.blockers:
            result.status = JobStatus.BLOCKED
            return result

        proposals = self.propose_actions(job, state={})
        for prop in proposals:
            tool = self.registry.get(prop["tool"])
            args = prop.get("args", {})
            if tool is None:
                result.actions.append(ActionRecord(
                    self.name, prop["tool"], RiskLevel.READ, args,
                    Decision.DENY, reason="unknown tool"))
                continue
            decision, reason = self.guardrails.evaluate(self.name, tool, args)
            rec = ActionRecord(self.name, tool.name, tool.risk, args, decision, reason)
            if decision == Decision.AUTO:
                rec.result = tool.run(**args)
                rec.executed = True
                self.guardrails.commit_usage(self.name, tool, args)
            elif decision == Decision.REQUIRE_APPROVAL:
                esc = Escalation(self.name, job.id, rec)
                result.escalations.append(esc)
            # DENY: recorded, not executed
            result.actions.append(rec)

        if result.blockers:
            result.status = JobStatus.BLOCKED
        elif result.escalations:
            result.status = JobStatus.NEEDS_APPROVAL
        else:
            result.status = JobStatus.DONE
        return result
