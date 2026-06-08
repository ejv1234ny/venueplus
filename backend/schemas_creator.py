"""Pydantic input models for Creator Events. Outputs are returned as plain
dicts (matching the payments router style)."""
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field


class TierInput(BaseModel):
    name: str
    price_cents: int = Field(0, ge=0)
    quantity: int = Field(..., ge=1)
    max_per_buyer: int = Field(4, ge=1)
    sales_end_datetime: Optional[datetime] = None


class CreatorEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    cover_image: Optional[str] = None
    start_datetime: datetime
    end_datetime: datetime
    capacity: int = Field(0, ge=0)          # 0 => derive from tier quantities
    booking_id: Optional[int] = None
    visibility: str = "public"
    tiers: List[TierInput] = []


class CreatorEventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    cover_image: Optional[str] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    capacity: Optional[int] = None
    visibility: Optional[str] = None


class PurchaseInput(BaseModel):
    tier_id: int
    quantity: int = Field(1, ge=1)
