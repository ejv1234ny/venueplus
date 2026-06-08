"""VenuePlus agent system.

Layers:
  types       — shared dataclasses/enums (Job, JobResult, RiskLevel, Decision)
  tools       — Tool abstraction + registry (risk-tagged wrappers over the API)
  guardrails  — policy engine (auto / approve / deny, spend + outbound caps)
  llm         — Claude / sim provider
  base        — BaseAgent (the shared run(job) contract)
  specialists — Venues / Providers / Marketing agents
  orchestrator— COO (decompose, sequence, dispatch, report)

Quick start:
    from agents.orchestrator import build_system
    coo = build_system()
    report = coo.run_goal("Reach booking liquidity in Austin")
"""
from .types import (RiskLevel, Decision, JobStatus, Job, JobResult,
                    ActionRecord, Escalation, AutonomyConfig)
from .tools import Tool, ToolRegistry, default_registry
from .guardrails import GuardrailEngine, UsageTracker
from .llm import LLMProvider
from .base import BaseAgent
from .orchestrator import COO, build_system

__all__ = [
    "RiskLevel", "Decision", "JobStatus", "Job", "JobResult", "ActionRecord",
    "Escalation", "AutonomyConfig", "Tool", "ToolRegistry", "default_registry",
    "GuardrailEngine", "UsageTracker", "LLMProvider", "BaseAgent", "COO",
    "build_system",
]
