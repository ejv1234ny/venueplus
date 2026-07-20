'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import Alert from '@/components/Alert';
import { Skeleton } from '@/components/Skeleton';
import { creatorEventsAPI } from '@/lib/api';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-neutral-100 text-neutral-700',
  published: 'bg-green-100 text-green-700',
  sold_out: 'bg-amber-100 text-amber-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
};

function fmtDate(s: string) {
  try {
    return new Date(s).toLocaleDateString(undefined,
      { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return s; }
}

function EventsList() {
  const [events, setEvents] = useState<any[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    creatorEventsAPI.mine()
      .then(r => setEvents(r.data))
      .catch(e => setError(e.response?.data?.detail || 'Failed to load events'));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Events</h1>
          <p className="text-neutral-500">Host ticketed gatherings for your audience.</p>
        </div>
        <Link href="/creator/events/new" className="btn-primary">+ New event</Link>
      </div>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      {!events ? (
        <div className="space-y-3">
          {[0, 1, 2].map(i => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center bg-white border rounded-xl p-12">
          <div className="text-5xl mb-4">🎤</div>
          <h2 className="text-xl font-semibold mb-2">No events yet</h2>
          <p className="text-neutral-500 mb-6">
            Create your first ticketed event and sell to your audience.
          </p>
          <Link href="/creator/events/new" className="btn-primary">Create an event</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(ev => (
            <Link key={ev.id} href={`/creator/events/${ev.id}`}
              className="block bg-white border rounded-xl p-5 hover:border-primary-300 transition">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{ev.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[ev.status] || 'bg-neutral-100'}`}>
                      {ev.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500">
                    {fmtDate(ev.start_datetime)} · {ev.tiers.length} tier{ev.tiers.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {ev.sales && (
                  <div className="text-right">
                    <p className="font-bold">${Number(ev.sales.gross_revenue).toFixed(0)}</p>
                    <p className="text-xs text-neutral-500">{ev.sales.tickets_sold} sold</p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CreatorEventsPage() {
  return (
    <AuthGuard requiredRole="creator">
      <EventsList />
    </AuthGuard>
  );
}
