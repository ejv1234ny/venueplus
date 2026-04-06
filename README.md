# VenuePlus Platform

**VenuePlus** is a comprehensive event venue and service marketplace that connects event hosts with unique spaces and essential services. Think of it as "Airbnb for events + TaskRabbit for services."

## 🎯 Core Concept

VenuePlus lets anyone:
- **Rent unique spaces** (rooftops, fields, pool houses, parking lots) by the hour for events
- **Book essential services** (cleaning, security, catering, DJs, bartenders) in one transaction
- **Create seamless events** from intimate gatherings to large celebrations

### Key Innovations

1. **Bundled Services**: Book venue + services in one transaction
2. **Mandatory Requirements**: Venue owners can require specific services (e.g., security, cleaning)
3. **Service Provider Network**: Gig workers earn during downtime by accepting event jobs
4. **Diverse Use Cases**: From romantic picnics to classic car shows to 25-kid birthday parties

## 🏗️ Architecture

The platform consists of three integrated applications:

```
venueplus/
├── backend/        # FastAPI backend
├── frontend/       # Next.js web application  
└── mobile/         # React Native mobile app
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Backend** | Python + FastAPI | REST API, business logic, database |
| **Database** | PostgreSQL | Relational data storage |
| **Web Frontend** | Next.js 14 + React + TypeScript | Responsive web application |
| **Mobile App** | React Native + Expo | iOS/Android native experience |
| **State Management** | Zustand | Client-side state |
| **Styling** | Tailwind CSS | Web UI styling |
| **Authentication** | JWT | Secure token-based auth |

## 🎨 Design System

### Brand Colors

- **Primary (Deep Teal)**: `#007db1` - Trust, reliability, safety
- **Accent (Warm Coral)**: `#ff6946` - Celebration, versatility, warmth
- **Neutral Grays**: Backgrounds and text

### Design Philosophy

- **Trustworthy**: Professional, secure, reliable
- **Versatile**: Supports diverse event types
- **Welcoming**: Friendly, accessible, inclusive
- Inspired by Airbnb's clean aesthetic with unique VenuePlus personality

## 👥 User Roles

### 1. Renters (Event Hosts)
- Search and book venues
- Add services to bookings
- Create and manage events
- View booking history

**Use Cases**:
- Romantic rooftop picnic for 2
- 25-kid birthday party at campground
- Classic car show at airfield with food truck
- Corporate event at warehouse

### 2. Venue Owners
- List unique spaces (rooftops, fields, parking lots, etc.)
- Set hourly pricing and rules
- Define mandatory service requirements
- Manage bookings and availability
- Earn money from unused spaces

### 3. Service Providers (Gig Workers)
- Offer services: cleaning, catering, security, DJs, bartending, photography, etc.
- Set availability and hourly rates
- Accept/decline job requests
- Earn during downtime
- Build reputation through ratings

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL
- (Optional) Expo CLI for mobile development

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd venueplus
```

2. **Setup Backend**
```bash
cd backend
pip install -r requirements.txt
# Configure PostgreSQL database
python main.py
```
Backend runs on http://localhost:8000

3. **Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:3000

4. **Setup Mobile App** (Optional)
```bash
cd mobile
npm install
expo start
```

For detailed setup instructions, see individual README files:
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Mobile README](./mobile/README.md)

## 📱 Features

### Core Features

✅ **User Authentication**
- Email/password registration and login
- Role-based access control
- JWT token authentication

✅ **Venue Management**
- List and manage venues
- Set pricing, capacity, and rules
- Add photos and amenities
- Define mandatory service requirements
- Manage bookings

✅ **Service Provider Profiles**
- Create service offerings
- Set availability schedules
- Define service areas and rates
- Accept/decline job requests

✅ **Booking System**
- Search venues by location, type, capacity
- View venue requirements
- Select services during booking
- Calculate total costs
- Automatic availability checking
- Prevent double-bookings

✅ **Event Creation**
- Create event details
- Associate with bookings
- Track event information

✅ **Dashboard**
- Renters: View bookings and events
- Venue Owners: Manage venues and bookings
- Service Providers: View and manage jobs

### Coming Soon

🔜 Payment processing integration  
🔜 Reviews and ratings system  
🔜 Advanced search filters  
🔜 Calendar integrations  
🔜 Push notifications  
🔜 In-app messaging  
🔜 Photo upload and management  
🔜 Analytics and reporting  

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Venues
- `GET /api/venues/` - Search venues
- `POST /api/venues/` - Create venue
- `GET /api/venues/{id}` - Get venue details
- `PUT /api/venues/{id}` - Update venue
- `POST /api/venues/{id}/requirements` - Add service requirement

### Services
- `GET /api/services/` - Search service providers
- `POST /api/services/` - Create service profile
- `GET /api/services/{id}` - Get service details

### Bookings
- `POST /api/bookings/` - Create booking
- `GET /api/bookings/` - Get user's bookings
- `GET /api/bookings/services/my-jobs` - Get service provider's jobs
- `PUT /api/bookings/services/{id}/accept` - Accept job
- `PUT /api/bookings/services/{id}/decline` - Decline job

### Events
- `POST /api/events/` - Create event
- `GET /api/events/` - Get user's events

See full API documentation at `http://localhost:8000/docs`

## 🗄️ Database Schema

### Core Tables

- **users** - User accounts with roles
- **venues** - Event venue listings
- **service_providers** - Service provider profiles
- **venue_requirements** - Mandatory services for venues
- **events** - Event details
- **bookings** - Venue bookings
- **booking_services** - Services attached to bookings

## 🧪 Testing

```bash
# Backend tests (coming soon)
cd backend
pytest

# Frontend tests (coming soon)
cd frontend
npm test

# Mobile tests (coming soon)
cd mobile
npm test
```

## 📊 Service Categories

- **Cleaning** - Pre/post-event cleaning crews
- **Security** - Event security personnel
- **Catering** - Food and beverage services
- **Bartending** - Professional bartenders
- **DJ** - Music and entertainment
- **Photography** - Event photography
- **Decoration** - Event decorators
- **Equipment** - Rental equipment (tables, chairs, etc.)
- **Staff** - Event staff and coordinators

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## 📄 License

[Your License Here]

## 👨‍💻 Development Team

Built with ❤️ for event hosts, venue owners, and service providers

## 📞 Support

For questions or support:
- Email: support@venueplus.com
- Documentation: [docs.venueplus.com]
- Issues: GitHub Issues

## 🎯 Vision

VenuePlus aims to democratize event hosting by making unique spaces accessible and bundling all necessary services in one seamless platform. From intimate moments to grand celebrations, we're building the infrastructure for memorable events.

---

**VenuePlus** - *Where Every Space Becomes an Event Venue*
