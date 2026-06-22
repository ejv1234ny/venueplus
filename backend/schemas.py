from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from models import UserRole, ServiceCategory, BookingStatus

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None
    role: UserRole
    bio: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    profile_image: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Venue schemas
class VenueBase(BaseModel):
    title: str
    description: str
    venue_type: str
    address: str
    city: str
    state: str
    zip_code: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity: int
    price_per_hour: float
    minimum_hours: int = 1
    amenities: Optional[List[str]] = []
    required_services: Optional[List[str]] = []
    rules: Optional[str] = None

class VenueCreate(VenueBase):
    images: Optional[List[str]] = []

class VenueUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price_per_hour: Optional[float] = None
    capacity: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_active: Optional[bool] = None
    images: Optional[List[str]] = None
    amenities: Optional[List[str]] = None
    required_services: Optional[List[str]] = None
    rules: Optional[str] = None

class VenueResponse(VenueBase):
    id: int
    owner_id: int
    images: Optional[List[str]] = []
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Service Provider schemas
class ServiceProviderBase(BaseModel):
    service_category: ServiceCategory
    service_name: str
    description: str
    hourly_rate: float
    minimum_hours: int = 1
    service_area_cities: List[str]

class ServiceProviderCreate(ServiceProviderBase):
    availability: Optional[dict] = {}
    images: Optional[List[str]] = []

class ServiceProviderUpdate(BaseModel):
    service_name: Optional[str] = None
    description: Optional[str] = None
    hourly_rate: Optional[float] = None
    availability: Optional[dict] = None
    service_area_cities: Optional[List[str]] = None
    is_active: Optional[bool] = None
    images: Optional[List[str]] = None

class ServiceProviderResponse(ServiceProviderBase):
    id: int
    user_id: int
    availability: dict
    images: Optional[List[str]] = []
    rating: float
    total_reviews: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Venue Requirement schemas
class VenueRequirementCreate(BaseModel):
    service_provider_id: int
    service_category: ServiceCategory
    is_mandatory: bool = True
    description: Optional[str] = None

class VenueRequirementResponse(BaseModel):
    id: int
    venue_id: int
    service_provider_id: int
    service_category: ServiceCategory
    is_mandatory: bool
    description: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Event schemas
class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_type: str
    expected_guests: int

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: int
    host_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Booking Service schemas
class BookingServiceCreate(BaseModel):
    service_provider_id: int
    hours: int
    is_mandatory: bool = False
    notes: Optional[str] = None

class BookingServiceResponse(BaseModel):
    id: int
    booking_id: int
    service_provider_id: int
    hours: int
    cost: float
    is_mandatory: bool
    status: str
    notes: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Booking schemas
class BookingCreate(BaseModel):
    venue_id: int
    event_id: Optional[int] = None
    start_datetime: datetime
    end_datetime: datetime
    special_requests: Optional[str] = None
    services: List[BookingServiceCreate] = []

class BookingUpdate(BaseModel):
    status: Optional[BookingStatus] = None
    special_requests: Optional[str] = None

class BookingResponse(BaseModel):
    id: int
    renter_id: int
    venue_id: int
    event_id: Optional[int] = None
    start_datetime: datetime
    end_datetime: datetime
    total_hours: int
    venue_cost: float
    service_cost: float
    total_cost: float
    status: BookingStatus
    special_requests: Optional[str] = None
    created_at: datetime
    booked_services: List[BookingServiceResponse] = []
    
    class Config:
        from_attributes = True

# Token schema
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
