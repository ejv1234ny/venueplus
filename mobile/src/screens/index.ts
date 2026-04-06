import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuthStore } from '../store/authStore';

const COLORS = {
  primary: '#007db1',
  accent: '#ff6946',
  white: '#ffffff',
  neutral: '#6b7280',
  background: '#f9fafb',
};

// Register Screen
export function RegisterScreen({ navigation }: any) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.text}>Registration form coming soon...</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>Back to Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Venues Screen
export function VenuesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Browse Venues</Text>
      <Text style={styles.text}>Venue listings coming soon...</Text>
    </View>
  );
}

// Venue Detail Screen
export function VenueDetailScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Venue Details</Text>
      <Text style={styles.text}>Venue information and booking coming soon...</Text>
    </ScrollView>
  );
}

// Services Screen
export function ServicesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Services</Text>
      <Text style={styles.text}>Service provider listings coming soon...</Text>
    </View>
  );
}

// Bookings Screen
export function BookingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>
      <Text style={styles.text}>Your bookings will appear here...</Text>
    </View>
  );
}

// Profile Screen
export function ProfileScreen() {
  const { user, clearAuth } = useAuthStore();
  
  const handleLogout = async () => {
    await clearAuth();
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.text}>
        {user?.first_name} {user?.last_name}
      </Text>
      <Text style={styles.text}>{user?.email}</Text>
      <Text style={styles.text}>Role: {user?.role}</Text>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: COLORS.neutral,
    marginBottom: 8,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  logoutButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
