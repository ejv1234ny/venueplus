# VenuePlus Backend API

FastAPI backend for VenuePlus event venue and service marketplace.

## Features

- User authentication with JWT tokens
- Venue listing and management
- Service provider profiles
- Event creation
- Booking system with service integration
- Mandatory service requirements for venues
- PostgreSQL database with SQLAlchemy ORM

## Setup

### Prerequisites

- Python 3.9+
- PostgreSQL database

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up PostgreSQL database:
```sql
CREATE DATABASE venueplus;
CREATE USER venueplus WITH PASSWORD 'venueplus';
GRANT ALL PRIVILEGES ON DATABASE venueplus TO venueplus;
```

3. Configure environment variables (optional):
```bash
export DATABASE_URL="postgresql://venueplus:venueplus@localhost:5432/venueplus"
export SECRET_KEY="your-secret-key-here"
```

### Running the Application

```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Documentation

Interactive API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `GET /api/users/{user_id}` - Get user by ID

### Venues
- `POST /api/venues/` - Create venue (venue owners only)
- `GET /api/venues/` - Search venues
- `GET /api/venues/{venue_id}` - Get venue details
- `PUT /api/venues/{venue_id}` - Update venue
- `DELETE /api/venues/{venue_id}` - Delete venue
- `GET /api/venues/my/venues` - Get my venues
- `POST /api/venues/{venue_id}/requirements` - Add service requirement
- `GET /api/venues/{venue_id}/requirements` - Get venue requirements

### Services
- `POST /api/services/` - Create service profile (service providers only)
- `GET /api/services/` - Search service providers
- `GET /api/services/{service_id}` - Get service details
- `PUT /api/services/{service_id}` - Update service profile
- `DELETE /api/services/{service_id}` - Delete service profile
- `GET /api/services/my/services` - Get my service profiles
- `GET /api/services/categories/list` - Get service categories

### Events
- `POST /api/events/` - Create event
- `GET /api/events/` - Get my events
- `GET /api/events/{event_id}` - Get event details
- `PUT /api/events/{event_id}` - Update event
- `DELETE /api/events/{event_id}` - Delete event

### Bookings
- `POST /api/bookings/` - Create booking
- `GET /api/bookings/` - Get my bookings
- `GET /api/bookings/{booking_id}` - Get booking details
- `PUT /api/bookings/{booking_id}` - Update booking
- `DELETE /api/bookings/{booking_id}` - Cancel booking
- `GET /api/bookings/services/my-jobs` - Get service provider jobs
- `PUT /api/bookings/services/{booking_service_id}/accept` - Accept job
- `PUT /api/bookings/services/{booking_service_id}/decline` - Decline job

## User Roles

- **RENTER** - Books venues and services
- **VENUE_OWNER** - Lists and manages venues
- **SERVICE_PROVIDER** - Offers services (cleaning, catering, etc.)
- **ADMIN** - Platform administration

## Service Categories

- CLEANING
- SECURITY
- CATERING
- BARTENDING
- DJ
- PHOTOGRAPHY
- DECORATION
- EQUIPMENT
- STAFF
- OTHER

## Database Schema

Key models:
- **User** - User accounts with roles
- **Venue** - Event venues
- **ServiceProvider** - Service provider profiles
- **VenueRequirement** - Mandatory services for venues
- **Event** - Event details
- **Booking** - Venue bookings
- **BookingService** - Services attached to bookings
