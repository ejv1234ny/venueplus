"""Worker-agent base class.

A worker agent (Venues / Providers / Marketing) turns a COO-assigned goal into
an ordered list of :class:`PlannedAction` -- the tool calls it *wants* to make.
It does NOT decide whether they run: every PlannedAction is handed back to the
orchestrator, which scores it through :mod:`agents.guardrails` and either
executes it (dry-run for write/outbound today) or opens an escalation. The
agent is the *planner*; the guardrail is the *chokepoint*. That split is what
keeps "mostly autonomous" safe.

Two planning backends, chosen by :class:`agents.llm.LLMProvider`:

* **Real Claude loop** (``ANTHROPIC_API_KEY`` set) -- the agent runs a short
  tool-calling loop. We expose its allowed tools (a subset of
  :data:`agents.tools.REGISTRY`) as Claude tool schemas; each ``tool_use`` the
  model emits becomes a PlannedAction, with its risk looked up from the
  registry (risk is defined once, in the registry -- the model can't pick it).
  Read results gathered beforehand are injected as grounding context.

* **Deterministic fallback** (no key -- dev / CI / the current pilot phase) --
  :meth:`fallback_plan`. This keeps runs reproducible and lets the whole
  pipeline be tested without a model or network. A specialist's fallback must
  reproduce its "known-good" plan so traces stay stable.

Subclasses set ``name`` / ``role`` / ``system_prompt`` / ``tool_names`` and
implement :meth:`fallback_plan`.
"""
from __future__ import annotations

from typing import Any

from agents import tools as tool_registry
from agents.llm import LLMProvider
from agents.types import PlannedAction, RiskLevel


class BaseAgent:
    #: short id, matches the AgentJob.agent string ("venues" | ...).
    name: str = "base"
    #: human-readable role, surfaced in the dashboard.
    role: str = "Worker Agent"
    #: the agent's operating instructions for the real Claude loop.
    system_prompt: str = ""
    #: tool names (keys of agents.tools.REGISTRY) this agent may call.
    tool_names: tuple[str, ...] = ()
    #: hard ceiling on planning turns, so a loop can never run away.
    max_steps: int = 3

    def __init__(self, llm: LLMProvider | None = None):
        self.llm = llm or LLMProvider()

    # ------------------------------------------------------------------ #
    # Claude tool schema (real backend only)                             #
    # ------------------------------------------------------------------ #
    def tool_schemas(self) -> list[dict]:
        """Anthropic tool schemas for this agent's allowed tools.

        The input schema is intentionally permissive (free-form object) -- the
        guardrail, not the schema, is what constrains what an action may do.
        Every tool description carries its risk tier so the model understands
        which calls will need a human.
        """
        schemas = []
        for n in self.tool_names:
            t = tool_registry.get(n)
            if not t:
                continue
            schemas.append({
                "name": t.name,
                "description": f"[{t.risk.value}] {t.description}",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "city": {"type": "string"},
                        "reason": {"type": "string",
                                   "description": "Why this action, in one line."},
                    },
                    "additionalProperties": True,
                },
            })
        return schemas

    # ------------------------------------------------------------------ #
    # Planning                                                           #
    # ------------------------------------------------------------------ #
    def propose_actions(self, goal: str, city: str | None = None,
                        context: dict[str, Any] | None = None
                        ) -> list[PlannedAction]:
        """Return the ordered PlannedActions this agent wants to take.

        Uses the real Claude tool-calling loop when a key is configured,
        otherwise the deterministic :meth:`fallback_plan`.
        """
        if not self.llm.is_real:
            return self.fallback_plan(goal, city, context or {})
        return self._claude_plan(goal, city, context or {})

    def _claude_plan(self, goal: str, city: str | None,
                     context: dict[str, Any]) -> list[PlannedAction]:
        where = city or "all markets"
        grounding = self._format_context(context)
        user = (
            f"Company goal: {goal}\n"
            f"Your market: {where}\n\n"
            f"{grounding}\n"
            "Plan the concrete tool calls you want to make to advance this "
            "goal in your market. Call the tools you intend to use, in the "
            "order you'd run them. Include a one-line `reason` per call. "
            "Do not invent tools; only use the tools provided."
        )
        messages: list[dict] = [{"role": "user", "content": user}]
        schemas = self.tool_schemas()
        planned: list[PlannedAction] = []
        seen = 0

        for _ in range(self.max_steps):
            turn = self.llm.complete(self.system_prompt, messages, tools=schemas)
            calls = turn.get("tool_calls") or []
            if not calls:
                break

            assistant_blocks: list[dict] = []
            result_blocks: list[dict] = []
            for tc in calls:
                tname = tc.get("name")
                tinput = tc.get("input") or {}
                risk = tool_registry.risk_for(tname)
                if risk is None:
                    continue  # model hallucinated a tool -- ignore it
                seen += 1
                use_id = tc.get("id") or f"call_{seen}"
                reason = (tinput.get("reason")
                          or (turn.get("text") or "").strip()[:200]
                          or f"{self.name}: {tname}")
                planned.append(PlannedAction(tool=tname, risk=risk,
                                             args=tinput, reason=reason))
                assistant_blocks.append({"type": "tool_use", "id": use_id,
                                         "name": tname, "input": tinput})
                result_blocks.append({
                    "type": "tool_result", "tool_use_id": use_id,
                    "content": "Accepted into the plan; pending guardrail "
                               "review before execution.",
                })

            # Feed the proposals back so the model can decide whether to add
            # more (e.g. read first, then propose writes) or stop.
            messages.append({"role": "assistant", "content": assistant_blocks})
            messages.append({"role": "user", "content": result_blocks})
            if turn.get("stop") == "end_turn":
                break

        return planned

    @staticmethod
    def _format_context(context: dict[str, Any]) -> str:
        if not context:
            return "Grounding data: (none gathered yet)."
        lines = ["Grounding data gathered from live sources:"]
        for key, val in context.items():
            if isinstance(val, list):
                lines.append(f"- {key}: {len(val)} item(s); sample={val[:3]}")
            else:
                lines.append(f"- {key}: {val}")
        return "\n".join(lines)

    # ------------------------------------------------------------------ #
    # Operating loop (data-threaded) -- the real seeding path            #
    # ------------------------------------------------------------------ #
    def operate(self, db: Any, city: str | None, live: bool = True,
                limit: int | None = None) -> list[PlannedAction] | None:
        """Run the agent's real read→dedupe→act loop and return PlannedActions
        that carry concrete, discovered data in their ``args`` (a real venue
        candidate, a real provider lead, ...).

        Unlike :meth:`propose_actions` — which plans *context-free* actions and
        so seeds nothing — this gathers live reads first and threads each
        discovered item into the write/outbound action that acts on it, so
        auto-approved actions actually create leads and reach real contacts.

        Returns ``None`` when an agent has no operate loop yet (the orchestrator
        then falls back to :meth:`propose_actions`). Returning ``[]`` means "ran,
        found nothing new to do" — the orchestrator honours that (no fallback).
        """
        return None

    # ------------------------------------------------------------------ #
    # Deterministic fallback -- subclasses must implement                #
    # ------------------------------------------------------------------ #
    def fallback_plan(self, goal: str, city: str | None,
                      context: dict[str, Any]) -> list[PlannedAction]:
        raise NotImplementedError
