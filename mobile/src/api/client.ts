import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: any) => apiClient.post('/api/auth/register', data),
  login: (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    return apiClient.post('/api/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Users API
export const usersAPI = {
  getMe: () => apiClient.get('/api/users/me'),
  updateMe: (data: any) => apiClient.put('/api/users/me', data),
};

// Venues API
export const venuesAPI = {
  search: (params?: any) => apiClient.get('/api/venues/', { params }),
  getById: (venueId: number) => apiClient.get(`/api/venues/${venueId}`),
  getRequirements: (venueId: number) => apiClient.get(`/api/venues/${venueId}/requirements`),
};

// Services API
export const servicesAPI = {
  search: (params?: any) => apiClient.get('/api/services/', { params }),
  getById: (serviceId: number) => apiClient.get(`/api/services/${serviceId}`),
  getMy: () => apiClient.get('/api/services/my/services'),
  getCategories: () => apiClient.get('/api/services/categories/list'),
};

// Events API
export const eventsAPI = {
  create: (data: any) => apiClient.post('/api/events/', data),
  getMy: () => apiClient.get('/api/events/'),
};

// Bookings API
export const bookingsAPI = {
  create: (data: any) => apiClient.post('/api/bookings/', data),
  getMy: () => apiClient.get('/api/bookings/'),
  getById: (bookingId: number) => apiClient.get(`/api/bookings/${bookingId}`),
  getMyJobs: () => apiClient.get('/api/bookings/services/my-jobs'),
  acceptJob: (bookingServiceId: number) => 
    apiClient.put(`/api/bookings/services/${bookingServiceId}/accept`),
  declineJob: (bookingServiceId: number) => 
    apiClient.put(`/api/bookings/services/${bookingServiceId}/decline`),
};
