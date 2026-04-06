from dataclasses import dataclass, field
from typing import Optional, List

# Internal canonical record produced by every source.
@dataclass
class RawProvider:
    source: str                       # "osm" | "yelp" | "google"
    source_id: str                    # stable id from the source
    name: str
    category: str                     # one of CATEGORIES below
    city: str
    state: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    tags: List[str] = field(default_factory=list)


# Canonical service categories (must match models.ServiceCategory)
CATEGORIES = [
    "cleaning", "security", "catering", "bartending",
    "dj", "photography", "decoration", "equipment", "staff",
]
