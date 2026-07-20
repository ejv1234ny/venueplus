'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  Elements, PaymentElement, useStripe, useElements,
} from '@stripe/react-stripe-js';
import { creatorEventsAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import Alert from '@/components/Alert';
import { Skeleton } from '@/components/Skeleton';

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise: Promise<Stripe | null> | null = PUBLISHABLE_KEY
  ? loadStripe(PUBLISHABLE_KEY)
  : null;

interface Tier {
  id: number; name: string; price: number; price_cents: number;
  quantity: number; sold: number; available: number; max_per_buyer: number;
  sales_end_datetime: string | null;
}

function fmtDate(s: string) {
  try {
    return new Date(s).toLocaleString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  } catch { return s; }
}

function StripeTicketForm({ total, onSuccess }:
  { total: number; onSuccess: () => void }) {
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
      confirmParams: { return_url: `${window.location.href}?bought=1` },
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
        {submitting ? 'Processing…' : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function PublicEventPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [ev, setEv] = useState<any>(null);
  const [error, setError] = useState('');
  const [tierId, setTierId] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [order, setOrder] = useState<any>(null);   // purchase response
  const [purchasing, setPurchasing] = useState(false);
  const [done, setDone] = useState<any>(null);      // finalized ticket

  const load = () => {
    creatorEventsAPI.public(slug)
      .then(r => setEv(r.data))
      .catch(e => setError(e.response?.data?.detail || 'Event not found'));
  };
  useEffect(() => { if (slug) load(); }, [slug]);

  const selectedTier: Tier | undefined = useMemo(
    () => ev?.tiers?.find((t: Tier) => t.id === tierId), [ev, tierId]);

  const startPurchase = async () => {
    if (!isAuthenticated) {
      router.push(`/login?next=/e/${slug}`);
      return;
    }
    if (!selectedTier) return;
    setPurchasing(true); setError('');
    try {
      const r = await creatorEventsAPI.purchase(slug, selectedTier.id, qty);
      if (r.data.free) {
        setDone({ free: true, qr_code: r.data.qr_code });
      } else {
        setOrder(r.data);
      }
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Could not reserve tickets');
    } finally { setPurchasing(false); }
  };

  const simConfirm = async () => {
    setPurchasing(true); setError('');
    try {
      const r = await creatorEventsAPI.confirmTicket(order.ticket_id);
      setDone({ qr_code: r.data.qr_code });
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Could not finalize purchase');
    } finally { setPurchasing(false); }
  };

  if (error && !ev) return (
    <div className="max-w-2xl mx-auto p-6">
      <Alert variant="error" title="This event isn’t available">{error}</Alert>
      <Link href="/" className="text-primary-600 mt-4 inline-block">← Back home</Link>
    </div>
  );

  if (!ev) return (
    <div className="max-w-3xl mx-auto p-6">
      <Skeleton className="h-64 w-full rounded-xl mb-6" />
      <Skeleton className="h-9 w-2/3 mb-3" />
      <Skeleton className="h-4 w-40 mb-6" />
      <Skeleton className="h-24 w-full" />
    </div>
  );

  // ---- Success state ----
  if (done) return (
    <div className="max-w-lg mx-auto p-6 text-center">
      <div className="bg-white border rounded-xl p-8">
        <div className="text-5xl mb-4">🎟️</div>
        <h1 className="text-2xl font-bold mb-2">You’re going!</h1>
        <p className="text-neutral-600 mb-4">
          Your ticket{qty > 1 ? 's' : ''} for <strong>{ev.title}</strong> {qty > 1 ? 'are' : 'is'} confirmed.
        </p>
        <div className="bg-neutral-50 border rounded-lg p-4 mb-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">Check-in code</p>
          <p className="font-mono text-lg break-all">{done.qr_code}</p>
        </div>
        <p className="text-sm text-neutral-500">Show this code at the door. A confirmation was sent to your email.</p>
      </div>
    </div>
  );

  const soldOut = ev.status === 'sold_out';

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Cover */}
      {ev.cover_image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ev.cover_image} alt={ev.title}
          className="w-full h-64 object-cover rounded-xl mb-6" />
      ) : (
        <div className="w-full h-48 rounded-xl mb-6 bg-gradient-to-br from-primary-400 to-accent-400" />
      )}

      <h1 className="text-3xl font-bold mb-2">{ev.title}</h1>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-neutral-600 mb-4">
        <span>📅 {fmtDate(ev.start_datetime)}</span>
        {ev.venue && <span>📍 {ev.venue.title}, {ev.venue.city}{ev.venue.state ? `, ${ev.venue.state}` : ''}</span>}
        {ev.creator?.name && <span>Hosted by <strong>{ev.creator.name}</strong></span>}
      </div>

      {soldOut && <Alert variant="warning" className="mb-4">This event is sold out.</Alert>}
      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      {ev.description && (
        <p className="text-neutral-700 whitespace-pre-wrap mb-8">{ev.description}</p>
      )}

      {/* Ticketing */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-bold text-lg mb-4">Get tickets</h2>

        {!order ? (
          <>
            <div className="space-y-3">
              {ev.tiers.map((t: Tier) => {
                const out = t.available <= 0;
                const active = tierId === t.id;
                return (
                  <button key={t.id} type="button" disabled={out || soldOut}
                    onClick={() => { setTierId(t.id); setQty(1); }}
                    className={`w-full text-left border rounded-lg p-4 flex justify-between items-center transition
                      ${active ? 'border-primary-500 ring-2 ring-primary-200' : 'border-neutral-200 hover:border-neutral-300'}
                      ${out ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <div>
                      <p className="font-semibold">{t.name}</p>
                      <p className="text-sm text-neutral-500">
                        {out ? 'Sold out' : `${t.available} left`}
                      </p>
                    </div>
                    <span className="text-lg font-bold">
                      {t.price_cents === 0 ? 'Free' : `$${t.price.toFixed(2)}`}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedTier && (
              <div className="mt-5 flex items-center gap-4">
                <label className="text-sm font-medium">Quantity</label>
                <select value={qty} onChange={e => setQty(Number(e.target.value))}
                  className="border rounded-lg px-3 py-2">
                  {Array.from({ length: Math.min(selectedTier.max_per_buyer, selectedTier.available) },
                    (_, i) => i + 1).map(n =>
                    <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="ml-auto text-lg font-bold">
                  {selectedTier.price_cents === 0
                    ? 'Free'
                    : `$${(selectedTier.price * qty).toFixed(2)}`}
                </span>
              </div>
            )}

            <button onClick={startPurchase}
              disabled={!selectedTier || purchasing || soldOut}
              className="btn-primary w-full text-lg py-4 mt-6 disabled:opacity-50">
              {purchasing ? 'Reserving…'
                : !isAuthenticated ? 'Log in to get tickets'
                : selectedTier?.price_cents === 0 ? 'Reserve free ticket'
                : 'Continue to payment'}
            </button>
            {!isAuthenticated && !authLoading && (
              <p className="text-xs text-neutral-500 text-center mt-2">
                You’ll be asked to sign in first.
              </p>
            )}
          </>
        ) : (
          // ---- Payment step ----
          <div>
            <div className="mb-4 pb-4 border-b">
              <div className="flex justify-between"><span>Subtotal</span><span>${Number(order.subtotal).toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-neutral-500">
                <span>Processing fee</span><span>+${Number(order.processing_fee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-1">
                <span>Total</span><span>${Number(order.total).toFixed(2)}</span>
              </div>
            </div>

            {stripePromise && order.client_secret
              && String(order.client_secret).startsWith('pi_') && PUBLISHABLE_KEY ? (
              <Elements stripe={stripePromise}
                options={{ clientSecret: order.client_secret, appearance: { theme: 'stripe' } }}>
                <StripeTicketForm total={Number(order.total)}
                  onSuccess={() => setDone({ qr_code: null })} />
              </Elements>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
                <p className="mb-3 text-sm">
                  <strong>Sim mode:</strong> no Stripe publishable key configured.
                  Reservation <code>#{order.ticket_id}</code> created.
                </p>
                <button onClick={simConfirm} disabled={purchasing} className="btn-primary w-full">
                  {purchasing ? 'Finalizing…' : 'Simulate successful payment'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
