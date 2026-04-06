'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const loadFromStorage = useAuthStore((state) => state.loadFromStorage);
  
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);
  
  return <>{children}</>;
}
