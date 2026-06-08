'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import LoadingSpinner from './LoadingSpinner';

/**
 * Gates the whole /admin area to users with role === 'admin'.
 * Non-authenticated -> /login, authenticated non-admins -> /.
 * Mirrors the existing AuthGuard pattern (which only covers non-admin roles).
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user?.role !== 'admin') {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return <LoadingSpinner message="Loading..." />;
  }
  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }
  return <>{children}</>;
}
