import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuthStore } from './src/store/authStore';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import { 
  RegisterScreen, 
  VenuesScreen, 
  VenueDetailScreen, 
  ServicesScreen, 
  BookingsScreen, 
  ProfileScreen 
} from './src/screens/index';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Colors
const COLORS = {
  primary: '#007db1',
  accent: '#ff6946',
  white: '#ffffff',
  neutral: '#6b7280',
  background: '#f9fafb',
};

function MainTabs() {
  const { user } = useAuthStore();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Venues') {
            iconName = focused ? 'location' : 'location-outline';
          } else if (route.name === 'Services') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.neutral,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: '#e5e7eb',
        },
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerTintColor: COLORS.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'VenuePlus' }}
      />
      <Tab.Screen 
        name="Venues" 
        component={VenuesScreen}
        options={{ title: 'Find Venues' }}
      />
      <Tab.Screen 
        name="Services" 
        component={ServicesScreen}
        options={{ title: 'Services' }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={BookingsScreen}
        options={{ title: 'My Bookings' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const { isAuthenticated, isLoading, loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, []);

  if (isLoading) {
    return null; // Could add a splash screen here
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen 
                name="VenueDetail" 
                component={VenueDetailScreen}
                options={{ 
                  headerShown: true,
                  title: 'Venue Details',
                  headerStyle: { backgroundColor: COLORS.white },
                  headerTintColor: COLORS.primary,
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
