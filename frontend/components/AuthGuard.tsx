'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import LoadingSpinner from './LoadingSpinner';

export default function AuthGuard({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: 'renter' | 'venue_owner' | 'service_provider';
}) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (!isLoading && isAuthenticated && requiredRole && user?.role !== requiredRole) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, requiredRole, user, router]);

  if (isLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
