import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#007db1',
  accent: '#ff6946',
  white: '#ffffff',
  neutral: '#6b7280',
  background: '#f9fafb',
};

const venueTypes = [
  { name: 'Rooftops', icon: 'business', count: '150+' },
  { name: 'Fields', icon: 'leaf', count: '200+' },
  { name: 'Pool Houses', icon: 'water', count: '80+' },
  { name: 'Parking Lots', icon: 'car', count: '120+' },
];

const serviceCategories = [
  { name: 'Cleaning', icon: 'broom', color: COLORS.primary },
  { name: 'Catering', icon: 'restaurant', color: COLORS.accent },
  { name: 'Security', icon: 'shield-checkmark', color: COLORS.primary },
  { name: 'DJ Services', icon: 'musical-notes', color: COLORS.accent },
  { name: 'Bartending', icon: 'wine', color: COLORS.primary },
  { name: 'Photography', icon: 'camera', color: COLORS.accent },
];

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuthStore();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.greeting}>
          Hello, {user?.first_name} 👋
        </Text>
        <Text style={styles.heroTitle}>
          Find Your Perfect Event Space
        </Text>
        <Text style={styles.heroSubtitle}>
          Book unique venues and services in one place
        </Text>
        
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => navigation.navigate('Venues')}
        >
          <Ionicons name="search" size={20} color={COLORS.neutral} />
          <Text style={styles.searchText}>Search venues...</Text>
        </TouchableOpacity>
      </View>

      {/* Venue Types */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Explore Unique Spaces</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
        >
          {venueTypes.map((type, index) => (
            <TouchableOpacity
              key={index}
              style={styles.categoryCard}
              onPress={() => navigation.navigate('Venues', { type: type.name })}
            >
              <View style={styles.categoryIcon}>
                <Ionicons name={type.icon as any} size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.categoryName}>{type.name}</Text>
              <Text style={styles.categoryCount}>{type.count} venues</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Essential Services</Text>
        <View style={styles.servicesGrid}>
          {serviceCategories.map((service, index) => (
            <TouchableOpacity
              key={index}
              style={styles.serviceCard}
              onPress={() => navigation.navigate('Services', { category: service.name })}
            >
              <View style={[styles.serviceIcon, { backgroundColor: service.color + '20' }]}>
                <Ionicons name={service.icon as any} size={24} color={service.color} />
              </View>
              <Text style={styles.serviceName}>{service.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Ready to Host?</Text>
        <Text style={styles.ctaText}>
          Browse venues and book services for your next event
        </Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate('Venues')}
        >
          <Text style={styles.ctaButtonText}>Browse Venues</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  hero: {
    backgroundColor: COLORS.white,
    padding: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.neutral,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.neutral,
    marginBottom: 24,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchText: {
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.neutral,
  },
  section: {
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  horizontalScroll: {
    paddingLeft: 24,
  },
  categoryCard: {
    width: 140,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 14,
    color: COLORS.neutral,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 18,
  },
  serviceCard: {
    width: (width - 60) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    margin: 6,
    alignItems: 'center',
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  ctaSection: {
    backgroundColor: COLORS.primary,
    margin: 24,
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  ctaText: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 24,
  },
  ctaButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  ctaButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
