'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import Alert from '@/components/Alert';
import { Skeleton } from '@/components/Skeleton';
import { creatorEventsAPI } from '@/lib/api';

function fmtDate(s: string) {
  try { return new Date(s).toLocaleString(undefined,
    { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }); }
  catch { return s; }
}

function ManageEvent() {
  const { id } = useParams<{ id: string }>();
  const eventId = Number(id);
  const [ev, setEv] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[] | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(() => {
    creatorEventsAPI.get(eventId)
      .then(r => setEv(r.data))
      .catch(e => setError(e.response?.data?.detail || 'Failed to load event'));
  }, [eventId]);

  useEffect(() => { if (eventId) load(); }, [eventId, load]);

  const isPublished = ev && ['published', 'sold_out'].includes(ev.status);
  const isDraft = ev?.status === 'draft';
  const ended = ev && new Date(ev.end_datetime) < new Date();

  useEffect(() => {
    if (isPublished) {
      creatorEventsAPI.attendees(eventId)
        .then(r => setAttendees(r.data)).catch(() => setAttendees([]));
    }
  }, [isPublished, eventId]);

  const run = async (label: string, fn: () => Promise<any>, ok?: string) => {
    setBusy(label); setError(''); setNotice('');
    try {
      await fn();
      if (ok) setNotice(ok);
      load();
      if (isPublished) creatorEventsAPI.attendees(eventId).then(r => setAttendees(r.data)).catch(() => {});
    } catch (e: any) {
      setError(e.response?.data?.detail || `${label} failed`);
    } finally { setBusy(''); }
  };

  const publicUrl = ev ? `${typeof window !== 'undefined' ? window.location.origin : ''}/e/${ev.slug}` : '';

  if (error && !ev) return (
    <div className="max-w-3xl mx-auto p-6">
      <Alert variant="error" title="Couldn’t load event">{error}</Alert>
      <Link href="/creator/events" className="text-primary-600 mt-4 inline-block">← My events</Link>
    </div>
  );
  if (!ev) return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <Skeleton className="h-9 w-2/3" /><Skeleton className="h-32 w-full" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link href="/creator/events" className="text-sm text-neutral-500 hover:text-primary-600">← My events</Link>
      <div className="flex items-center gap-3 mt-2 mb-1">
        <h1 className="text-3xl font-bold">{ev.title}</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 capitalize">
          {ev.status.replace('_', ' ')}
        </span>
      </div>
      <p className="text-neutral-500 mb-6">{fmtDate(ev.start_datetime)} → {fmtDate(ev.end_datetime)}</p>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}
      {notice && <Alert variant="success" className="mb-4">{notice}</Alert>}

      {/* Public link */}
      {isPublished && (
        <div className="bg-white border rounded-xl p-5 mb-4">
          <p className="text-sm font-medium mb-2">Public event page</p>
          <div className="flex items-center gap-2">
            <input readOnly value={publicUrl}
              className="flex-1 border rounded-lg px-3 py-2 text-sm bg-neutral-50" />
            <button onClick={() => navigator.clipboard?.writeText(publicUrl).then(() => setNotice('Link copied'))}
              className="px-3 py-2 rounded-lg border hover:bg-neutral-50 text-sm">Copy</button>
            <a href={`/e/${ev.slug}`} target="_blank" rel="noreferrer"
              className="px-3 py-2 rounded-lg border hover:bg-neutral-50 text-sm">Open</a>
          </div>
        </div>
      )}

      {/* Sales */}
      {ev.sales && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{ev.sales.tickets_sold}</p>
            <p className="text-xs text-neutral-500">Tickets sold</p>
          </div>
          <div className="bg-white border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">${Number(ev.sales.gross_revenue).toFixed(0)}</p>
            <p className="text-xs text-neutral-500">Gross revenue</p>
          </div>
          <div className="bg-white border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">${Number(ev.sales.platform_fee).toFixed(0)}</p>
            <p className="text-xs text-neutral-500">Platform fee (12%)</p>
          </div>
        </div>
      )}

      {/* Tiers */}
      <div className="bg-white border rounded-xl p-5 mb-4">
        <h2 className="font-semibold mb-3">Ticket tiers</h2>
        <ul className="divide-y">
          {ev.tiers.map((t: any) => (
            <li key={t.id} className="py-2 flex justify-between text-sm">
              <span>{t.name}</span>
              <span className="text-neutral-600">
                {t.price_cents === 0 ? 'Free' : `$${t.price.toFixed(2)}`} · {t.sold}/{t.quantity} sold
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Draft: prepare + publish */}
      {isDraft && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-4">
          <h2 className="font-semibold mb-1">Publish checklist</h2>
          <p className="text-sm text-neutral-600 mb-4">
            To go live you need a payout-enabled Stripe account, and (if this event has venue/service
            costs) a no-show deposit on hold. Publishing makes the public page live.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/payouts" className="px-4 py-2 rounded-lg border hover:bg-white text-sm">
              Set up payouts
            </Link>
            <button disabled={!!busy}
              onClick={() => run('deposit', () => creatorEventsAPI.holdDeposit(eventId), 'No-show deposit placed')}
              className="px-4 py-2 rounded-lg border bg-white hover:bg-neutral-50 text-sm disabled:opacity-50">
              {busy === 'deposit' ? 'Placing…' : 'Place no-show deposit'}
            </button>
            <button disabled={!!busy}
              onClick={() => run('publish', () => creatorEventsAPI.publish(eventId), 'Event published — it’s live!')}
              className="btn-primary text-sm disabled:opacity-50">
              {busy === 'publish' ? 'Publishing…' : 'Publish event'}
            </button>
          </div>
        </div>
      )}

      {/* Attendees + check-in */}
      {isPublished && (
        <div className="bg-white border rounded-xl p-5 mb-4">
          <h2 className="font-semibold mb-3">Attendees</h2>
          {attendees === null ? (
            <Skeleton className="h-16 w-full" />
          ) : attendees.length === 0 ? (
            <p className="text-sm text-neutral-500">No tickets sold yet.</p>
          ) : (
            <ul className="divide-y">
              {attendees.map(a => (
                <li key={a.ticket_id} className="py-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{a.buyer_name || a.buyer_email}</p>
                    <p className="text-xs text-neutral-500">{a.quantity} ticket(s) · {a.status}</p>
                  </div>
                  {a.status === 'checked_in' ? (
                    <span className="text-green-600 text-sm font-medium">✓ Checked in</span>
                  ) : (
                    <button disabled={!!busy}
                      onClick={() => run(`checkin-${a.ticket_id}`, () => creatorEventsAPI.checkIn(a.ticket_id))}
                      className="px-3 py-1.5 rounded-lg border hover:bg-neutral-50 text-sm disabled:opacity-50">
                      {busy === `checkin-${a.ticket_id}` ? '…' : 'Check in'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Settle / cancel */}
      {(isPublished || isDraft) && (
        <div className="flex flex-wrap gap-3 mt-6">
          {isPublished && ended && (
            <button disabled={!!busy}
              onClick={() => run('settle', () => creatorEventsAPI.settle(eventId), 'Event settled — payouts sent')}
              className="btn-primary text-sm disabled:opacity-50">
              {busy === 'settle' ? 'Settling…' : 'Settle & pay out'}
            </button>
          )}
          <button disabled={!!busy}
            onClick={() => { if (confirm('Cancel this event? Buyers are refunded.')) run('cancel', () => creatorEventsAPI.cancel(eventId), 'Event cancelled'); }}
            className="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm disabled:opacity-50">
            {busy === 'cancel' ? 'Cancelling…' : 'Cancel event'}
          </button>
        </div>
      )}

      {ev.settlement_status === 'settled' && (
        <Alert variant="success" className="mt-4">This event has been settled and paid out.</Alert>
      )}
    </div>
  );
}

export default function ManageEventPage() {
  return (
    <AuthGuard requiredRole="creator">
      <ManageEvent />
    </AuthGuard>
  );
}
