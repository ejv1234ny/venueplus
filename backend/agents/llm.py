"""LLM provider (Claude / sim).

The orchestrator plans deterministically today. This provider is the seam for
the next phase: replacing the hardcoded ``_plan`` with an LLM that proposes
tool calls per agent, while the rest of the pipeline (guardrails, escalation,
persistence) stays exactly as-is.

Same sim/real pattern as ``services/payments.py`` — it runs keyless in dev/CI
(returning an empty or scripted turn) and uses the Claude Messages API when
``ANTHROPIC_API_KEY`` is set. ``complete()`` returns a normalized turn::

    {"text": str, "tool_calls": [{"name": str, "input": dict}], "stop": str}
"""
from __future__ import annotations

import os
from typing import Optional


class LLMProvider:
    def __init__(self, model: str = "claude-sonnet-4-6",
                 scripted_turns: Optional[list[dict]] = None):
        self.model = model
        self._scripted = list(scripted_turns or [])

    @property
    def is_real(self) -> bool:
        return bool(os.getenv("ANTHROPIC_API_KEY"))

    def complete(self, system: str, messages: list[dict],
                 tools: Optional[list[dict]] = None) -> dict:
        if self.is_real:
            return self._complete_real(system, messages, tools)
        return self._complete_sim(system, messages, tools)

    def _complete_real(self, system, messages, tools) -> dict:
        import anthropic
        client = anthropic.Anthropic()
        resp = client.messages.create(
            model=self.model, max_tokens=1024, system=system,
            messages=messages, tools=tools or [],
        )
        text, tool_calls = "", []
        for block in resp.content:
            if block.type == "text":
                text += block.text
            elif block.type == "tool_use":
                tool_calls.append({"name": block.name, "input": block.input})
        return {"text": text, "tool_calls": tool_calls, "stop": resp.stop_reason}

    def _complete_sim(self, system, messages, tools) -> dict:
        if self._scripted:
            return self._scripted.pop(0)
        return {"text": "", "tool_calls": [], "stop": "end_turn"}
