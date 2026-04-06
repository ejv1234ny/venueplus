# VenuePlus Frontend

Next.js 14 frontend for VenuePlus event venue and service marketplace.

## Features

- Modern, responsive UI built with React and Tailwind CSS
- Airbnb-inspired design with VenuePlus branding
- User authentication (login/register)
- Venue browsing and search
- Service provider discovery
- Booking system
- User dashboards for renters, venue owners, and service providers
- Mobile-responsive design

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Date Picker**: React Datepicker

## Color Scheme

- **Primary**: Deep teal (#007db1) - Trust and reliability
- **Accent**: Warm coral (#ff6946) - Celebration and versatility
- **Neutral**: Gray tones for backgrounds and text

## Setup

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Create `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Run development server:
```bash
npm run dev
# or
yarn dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with navbar and footer
│   ├── page.tsx           # Homepage
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── venues/            # Venues pages
│   ├── services/          # Services pages
│   └── bookings/          # Bookings pages
├── components/            # Reusable React components
│   ├── Navbar.tsx        # Navigation bar
│   ├── AuthProvider.tsx  # Auth state provider
│   └── ...
├── lib/                   # Utilities and configurations
│   ├── api.ts            # API client and endpoints
│   └── store.ts          # Zustand store for auth
└── utils/                # Helper functions
```

## Key Pages

### Public Pages
- `/` - Homepage with hero, venue types, and services
- `/login` - User login
- `/register` - User registration with role selection
- `/venues` - Browse and search venues
- `/venues/[id]` - Venue details
- `/services` - Browse service providers
- `/services/[id]` - Service provider details

### Protected Pages
- `/bookings` - User's bookings
- `/host/venues` - Manage your venues (venue owners)
- `/host/venues/create` - Create new venue
- `/services/my` - Manage your services (service providers)
- `/services/create` - Create service profile
- `/profile` - User profile

## User Roles

The platform supports three user roles:
1. **Renter**: Books venues and services
2. **Venue Owner**: Lists and manages venues
3. **Service Provider**: Offers services (cleaning, catering, DJ, etc.)

## API Integration

The frontend communicates with the FastAPI backend through the API client in `lib/api.ts`. All API calls include:
- Automatic JWT token injection
- Error handling and token refresh
- Type-safe request/response handling

## Styling Guidelines

### Colors
- Use `primary-*` classes for main actions and trust elements
- Use `accent-*` classes for secondary actions and celebrations
- Use `neutral-*` classes for backgrounds and text

### Components
- Use `btn-primary` for primary buttons
- Use `btn-accent` for accent buttons
- Use `btn-outline` for outline buttons
- Use `input-field` for form inputs
- Use `card` for content cards

### Typography
- Use `section-title` for section headings
- Use `section-subtitle` for section descriptions

## Building for Production

```bash
npm run build
npm start
```

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)

## Features by User Role

### Renters
- Search and browse venues
- View venue details and requirements
- Search and browse services
- Create events
- Book venues with services
- View booking history

### Venue Owners
- List new venues
- Set pricing and rules
- Add mandatory service requirements
- Manage bookings
- View earnings

### Service Providers
- Create service profiles
- Set availability and rates
- Accept/decline job requests
- View upcoming jobs
- Track earnings
