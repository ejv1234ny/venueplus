'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import Alert from '@/components/Alert';
import { creatorEventsAPI } from '@/lib/api';

interface TierDraft { name: string; price: string; quantity: string; max_per_buyer: string; }

const emptyTier = (): TierDraft => ({ name: '', price: '', quantity: '', max_per_buyer: '4' });

function CreateForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [tiers, setTiers] = useState<TierDraft[]>([emptyTier()]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const setTier = (i: number, patch: Partial<TierDraft>) =>
    setTiers(ts => ts.map((t, j) => (j === i ? { ...t, ...patch } : t)));
  const addTier = () => setTiers(ts => [...ts, emptyTier()]);
  const removeTier = (i: number) => setTiers(ts => ts.filter((_, j) => j !== i));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) return setError('Give your event a title.');
    if (!start || !end) return setError('Set a start and end time.');
    if (new Date(end) <= new Date(start)) return setError('End time must be after the start time.');
    if (new Date(start) < new Date()) return setError('The start time is in the past.');

    const cleanTiers = tiers
      .filter(t => t.name.trim() && t.quantity)
      .map(t => ({
        name: t.name.trim(),
        price_cents: Math.round(parseFloat(t.price || '0') * 100),
        quantity: parseInt(t.quantity, 10),
        max_per_buyer: parseInt(t.max_per_buyer || '4', 10),
      }));
    if (cleanTiers.length === 0)
      return setError('Add at least one ticket tier with a name and quantity.');
    if (cleanTiers.some(t => !Number.isFinite(t.price_cents) || t.price_cents < 0))
      return setError('Ticket prices must be zero or more.');
    if (cleanTiers.some(t => !Number.isInteger(t.quantity) || t.quantity < 1))
      return setError('Each tier needs a quantity of at least 1.');

    setSaving(true);
    try {
      const r = await creatorEventsAPI.create({
        title: title.trim(),
        description: description.trim() || null,
        cover_image: coverImage.trim() || null,
        start_datetime: new Date(start).toISOString(),
        end_datetime: new Date(end).toISOString(),
        capacity: 0,
        booking_id: bookingId ? parseInt(bookingId, 10) : null,
        visibility: 'public',
        tiers: cleanTiers,
      });
      router.push(`/creator/events/${r.data.id}`);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Could not create the event.');
      setSaving(false);
    }
  };

  const input = 'w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200';

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Link href="/creator/events" className="text-sm text-neutral-500 hover:text-primary-600">← My events</Link>
      <h1 className="text-3xl font-bold mt-2 mb-6">New event</h1>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input className={input} value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Rooftop sunset mixer" maxLength={140} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea className={`${input} min-h-[110px]`} value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What's the event about? Who's it for?" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Cover image URL</label>
          <input className={input} value={coverImage} onChange={e => setCoverImage(e.target.value)}
            placeholder="https://…" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Starts *</label>
            <input type="datetime-local" className={input} value={start}
              onChange={e => setStart(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ends *</label>
            <input type="datetime-local" className={input} value={end}
              onChange={e => setEnd(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Linked booking ID (optional)</label>
          <input className={input} value={bookingId} onChange={e => setBookingId(e.target.value)}
            placeholder="Venue + services booking that covers this event" inputMode="numeric" />
          <p className="text-xs text-neutral-500 mt-1">
            Link the venue/services booking so costs are paid from ticket revenue at settlement.
          </p>
        </div>

        {/* Tiers */}
        <div>
          <label className="block text-sm font-medium mb-2">Ticket tiers *</label>
          <div className="space-y-3">
            {tiers.map((t, i) => (
              <div key={i} className="border rounded-lg p-3 grid grid-cols-12 gap-2 items-end">
                <div className="col-span-12 sm:col-span-4">
                  <span className="text-xs text-neutral-500">Name</span>
                  <input className={input} value={t.name}
                    onChange={e => setTier(i, { name: e.target.value })} placeholder="General" />
                </div>
                <div className="col-span-4 sm:col-span-3">
                  <span className="text-xs text-neutral-500">Price ($)</span>
                  <input className={input} value={t.price} inputMode="decimal"
                    onChange={e => setTier(i, { price: e.target.value })} placeholder="0" />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <span className="text-xs text-neutral-500">Qty</span>
                  <input className={input} value={t.quantity} inputMode="numeric"
                    onChange={e => setTier(i, { quantity: e.target.value })} placeholder="50" />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <span className="text-xs text-neutral-500">Max/buyer</span>
                  <input className={input} value={t.max_per_buyer} inputMode="numeric"
                    onChange={e => setTier(i, { max_per_buyer: e.target.value })} />
                </div>
                <div className="col-span-1 flex justify-end">
                  {tiers.length > 1 && (
                    <button type="button" onClick={() => removeTier(i)}
                      className="text-red-500 hover:text-red-700 text-xl leading-none pb-2"
                      aria-label="Remove tier">×</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addTier}
            className="text-sm text-primary-600 hover:text-primary-700 mt-2">
            + Add another tier
          </button>
          <p className="text-xs text-neutral-500 mt-1">Set price to 0 for a free RSVP tier.</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Creating…' : 'Create draft'}
          </button>
          <Link href="/creator/events" className="px-5 py-2.5 rounded-lg border hover:bg-neutral-50">
            Cancel
          </Link>
        </div>
        <p className="text-xs text-neutral-500">
          Your event is created as a draft. You’ll add a no-show deposit and publish it on the next screen.
        </p>
      </form>
    </div>
  );
}

export default function NewCreatorEventPage() {
  return (
    <AuthGuard requiredRole="creator">
      <CreateForm />
    </AuthGuard>
  );
}
