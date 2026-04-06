import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'renter' | 'venue_owner' | 'service_provider' | 'admin';
  phone?: string;
  profile_image?: string;
  bio?: string;
  is_verified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setAuth: (user: User, token: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  
  setAuth: async (user, token) => {
    await AsyncStorage.setItem('user', JSON.stringify(user));
    await AsyncStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true, isLoading: false });
  },
  
  clearAuth: async () => {
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },
  
  updateUser: async (user) => {
    await AsyncStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
  
  loadFromStorage: async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      
      if (userStr && token) {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading auth from storage:', error);
      set({ isLoading: false });
    }
  },
}));
