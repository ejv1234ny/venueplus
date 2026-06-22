'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  Elements, PaymentElement, useStripe, useElements,
} from '@stripe/react-stripe-js';
import { paymentsAPI } from '@/lib/api';
import Alert from '@/components/Alert';
import { Skeleton } from '@/components/Skeleton';

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise: Promise<Stripe | null> | null = PUBLISHABLE_KEY
  ? loadStripe(PUBLISHABLE_KEY)
  : null;

function StripePaymentForm({ bookingId, total, onSuccess }:
  { bookingId: number; total: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true); setError('');
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/bookings/${bookingId}?paid=1`,
      },
      redirect: 'if_required',
    });
    if (error) {
      setError(error.message || 'Payment failed');
      setSubmitting(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button type="submit" disabled={!stripe || submitting}
        className="btn-primary w-full text-lg py-4">
        {submitting ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const id = Number(bookingId);
  const router = useRouter();
  const [breakdown, setBreakdown] = useState<any>(null);
  const [pi, setPi] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) paymentsAPI.breakdown(id).then(r => setBreakdown(r.data)).catch(e =>
      setError(e.response?.data?.detail || 'Failed to load'));
  }, [id]);

  const startCheckout = async () => {
    setLoading(true);
    try {
      const r = await paymentsAPI.checkout(id);
      setPi(r.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Checkout failed');
    } finally { setLoading(false); }
  };

  const simPay = async () => {
    setLoading(true);
    try {
      await paymentsAPI.simConfirm(id);
      router.push(`/bookings/${id}?paid=1`);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Sim payment failed');
    } finally { setLoading(false); }
  };

  if (error && !breakdown) return (
    <div className="max-w-2xl mx-auto p-6">
      <Alert variant="error" title="Couldn’t load checkout">{error}</Alert>
    </div>
  );
  if (!breakdown) return (
    <div className="max-w-2xl mx-auto p-6">
      <Skeleton className="h-9 w-48 mb-6" />
      <div className="bg-white border rounded-lg p-6 mb-6 space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-7 w-40 mt-2" />
      </div>
      <Skeleton className="h-14 w-full" />
    </div>
  );

  // The client_secret tells us if we're in real Stripe mode
  const isRealStripe = PUBLISHABLE_KEY && pi?.client_secret &&
                       !pi.client_secret.startsWith('pi_') === false &&
                       pi.client_secret.includes('_secret_') &&
                       pi.client_secret.startsWith('pi_') &&
                       PUBLISHABLE_KEY.startsWith('pk_');

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="font-bold mb-4">Order summary</h2>
        <ul className="divide-y">
          {breakdown.lines.map((l: any, i: number) => (
            <li key={i} className="py-2 flex justify-between">
              <span>{l.label} <span className="text-xs text-neutral-500">({l.type})</span></span>
              <strong>${l.gross.toFixed(2)}</strong>
            </li>
          ))}
        </ul>
        <hr className="my-4" />
        <div className="flex justify-between"><span>Subtotal</span><span>${breakdown.subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between text-sm text-neutral-600">
          <span>Stripe processing fee</span><span>+${breakdown.stripe_processing_fee.toFixed(2)}</span>
        </div>
        <hr className="my-2" />
        <div className="flex justify-between text-xl font-bold">
          <span>Total</span><span>${breakdown.total.toFixed(2)}</span>
        </div>
        <p className="text-xs text-neutral-500 mt-3">{breakdown.note}</p>
      </div>

      {!pi ? (
        <button onClick={startCheckout} disabled={loading}
          className="btn-primary w-full text-lg py-4">
          {loading ? 'Creating payment...' : `Continue to payment — $${breakdown.total.toFixed(2)}`}
        </button>
      ) : stripePromise && pi.client_secret && pi.client_secret.startsWith('pi_') && PUBLISHABLE_KEY ? (
        <Elements stripe={stripePromise}
          options={{ clientSecret: pi.client_secret, appearance: { theme: 'stripe' } }}>
          <StripePaymentForm bookingId={id} total={breakdown.total}
            onSuccess={() => router.push(`/bookings/${id}?paid=1`)} />
        </Elements>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="mb-3"><strong>Sim mode:</strong> No <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> configured.</p>
          <p className="text-sm mb-4">PaymentIntent <code>{pi.payment_intent_id}</code> created.
            Set the env var on Vercel to render the real Stripe Elements card form here.</p>
          <button onClick={simPay} disabled={loading} className="btn-primary w-full">
            {loading ? 'Simulating...' : 'Simulate successful payment'}
          </button>
        </div>
      )}
    </div>
  );
}
