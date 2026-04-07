'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { paymentsAPI } from '@/lib/api';

export default function OnboardingReturnPage() {
  const router = useRouter();
  useEffect(() => {
    // Refresh status, then redirect to dashboard
    paymentsAPI.accountStatus().finally(() => router.push('/payouts'));
  }, [router]);

  return (
    <div className="max-w-md mx-auto p-12 text-center">
      <p>Finalizing your Stripe account...</p>
    </div>
  );
}
