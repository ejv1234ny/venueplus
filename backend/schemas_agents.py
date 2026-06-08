"""Request models for the agent control plane."""
from typing import Optional
from pydantic import BaseModel, Field


class GoalInput(BaseModel):
    goal: str = Field(..., description="Company objective for the COO to execute")
    city: Optional[str] = None


class AutonomyOverride(BaseModel):
    outbound_daily_cap: Optional[int] = None
    spend_daily_cap_cents: Optional[int] = None
    enabled: Optional[bool] = None       # kill switch
