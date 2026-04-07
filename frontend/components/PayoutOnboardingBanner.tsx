'use client';
import { useEffect, useState } from 'react';
import { paymentsAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

/**
 * Persistent banner shown to hosts and providers who haven't completed
 * Stripe Connect onboarding. Without it, they cannot receive payouts.
 *
 * Drop into any page or layout. Auto-hides if:
 *   - user is not logged in
 *   - user is a renter (no payouts to receive)
 *   - the user already has payouts_enabled
 */
export default function PayoutOnboardingBanner() {
  const { user } = useAuthStore();
  const [status, setStatus] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'venue_owner' && user.role !== 'service_provider') return;
    paymentsAPI.accountStatus()
      .then(r => setStatus(r.data))
      .catch(() => {});
  }, [user]);

  const onboard = async () => {
    setSubmitting(true);
    try {
      const r = await paymentsAPI.onboardingLink();
      if (r.data.url) {
        window.location.href = r.data.url;
      }
    } catch {
      setSubmitting(false);
    }
  };

  if (!user) return null;
  if (user.role !== 'venue_owner' && user.role !== 'service_provider') return null;
  if (!status) return null;
  if (status.payouts_enabled) return null;
  if (dismissed) return null;

  const label = user.role === 'venue_owner' ? 'list bookings' : 'accept jobs';

  return (
    <div className="bg-amber-50 border-b border-amber-300">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-amber-700 text-xl">⚠</span>
          <div>
            <p className="font-semibold text-amber-900">
              Connect your bank to get paid
            </p>
            <p className="text-sm text-amber-800">
              You can {label}, but you can't receive payouts until you finish Stripe Connect onboarding (~3 minutes).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onboard}
            disabled={submitting}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded-lg text-sm"
          >
            {submitting ? 'Loading...' : 'Set up payouts'}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-700 hover:text-amber-900 text-xl leading-none px-2"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
