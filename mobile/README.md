# VenuePlus Mobile App

React Native mobile application for VenuePlus event venue and service marketplace.

## Features

- Native iOS and Android support
- User authentication (login/register)
- Browse venues and services
- View bookings
- Service provider job management
- Push notifications (coming soon)
- Offline support (coming soon)

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **Icons**: Expo Vector Icons

## Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Studio (for Android development)
- Expo Go app on your physical device (optional)

## Setup

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Configure API URL in `app.json`:
```json
{
  "extra": {
    "apiUrl": "http://your-backend-url:8000"
  }
}
```

For local development with a physical device:
- Use your computer's local IP address instead of `localhost`
- Example: `"apiUrl": "http://192.168.1.100:8000"`

3. Start the development server:
```bash
npm start
# or
expo start
```

## Running the App

### On iOS Simulator (Mac only)
```bash
npm run ios
# or
expo start --ios
```

### On Android Emulator
```bash
npm run android
# or
expo start --android
```

### On Physical Device
1. Install Expo Go from App Store or Play Store
2. Scan the QR code from the terminal
3. App will load on your device

## Project Structure

```
mobile/
├── App.tsx                # Main app entry with navigation
├── app.json              # Expo configuration
├── src/
│   ├── api/              # API client and endpoints
│   │   └── client.ts
│   ├── screens/          # Screen components
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── VenuesScreen.tsx
│   │   ├── ServicesScreen.tsx
│   │   ├── BookingsScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── index.ts
│   ├── components/       # Reusable components
│   ├── navigation/       # Navigation configuration
│   ├── store/            # Zustand stores
│   │   └── authStore.ts
│   └── utils/            # Helper functions
└── assets/              # Images, fonts, etc.
```

## Key Screens

### Authentication
- **LoginScreen**: User login with email/password
- **RegisterScreen**: User registration with role selection

### Main Tabs
- **HomeScreen**: Dashboard with venue types and services
- **VenuesScreen**: Browse and search venues
- **ServicesScreen**: Browse service providers
- **BookingsScreen**: User's bookings and history
- **ProfileScreen**: User profile and settings

### Detail Screens
- **VenueDetailScreen**: Venue information and booking

## Color Scheme

Consistent with web application:
- Primary: `#007db1` (Deep teal)
- Accent: `#ff6946` (Warm coral)
- Neutral: `#6b7280` (Gray)
- Background: `#f9fafb` (Light gray)

## API Integration

The mobile app connects to the FastAPI backend via:
- Base URL configured in `app.json`
- Automatic JWT token handling
- AsyncStorage for token persistence
- Error handling with user feedback

## State Management

Uses Zustand for lightweight state management:
- Auth state (user, token, loading)
- Persists to AsyncStorage
- Automatic token injection in API calls

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

Or use EAS Build (recommended):
```bash
eas build --platform ios
eas build --platform android
```

## Features by User Role

### Renters
- Browse venues and services
- Create events
- Book venues with services
- View booking history

### Service Providers
- View incoming job requests
- Accept/decline jobs
- Track upcoming work
- View earnings

### Venue Owners
- View venue bookings
- Manage venues (coming soon in mobile)
- Track earnings

## Upcoming Features

- [ ] Full venue management for owners
- [ ] Service provider profile creation
- [ ] Push notifications
- [ ] In-app messaging
- [ ] Photo upload
- [ ] Payment integration
- [ ] Calendar integration
- [ ] Offline support
- [ ] Dark mode

## Development Tips

### Testing API on Physical Device

1. Find your computer's local IP:
   - Mac/Linux: `ifconfig | grep inet`
   - Windows: `ipconfig`

2. Update `app.json`:
   ```json
   "extra": {
     "apiUrl": "http://192.168.1.XXX:8000"
   }
   ```

3. Make sure your device and computer are on the same network

### Debugging

- Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android) for dev menu
- Enable remote debugging in Chrome
- View logs in terminal or Expo Dev Tools

## Common Issues

### Cannot connect to API
- Check that backend is running
- Verify API URL is correct
- Ensure device and computer are on same network (for physical device)
- Try using IP address instead of localhost

### Build errors
- Clear cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Update Expo: `expo upgrade`

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
