'use client';
import { useEffect, useState } from 'react';
import { matchingAPI } from '@/lib/api';

export default function ProviderOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);

  const load = () => matchingAPI.myOffers().then(r => setOffers(r.data));
  useEffect(() => { load(); }, []);

  const accept = async (id: number) => { await matchingAPI.accept(id); load(); };
  const decline = async (id: number) => { await matchingAPI.decline(id); load(); };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Job offers</h1>
      <ul className="border rounded-lg bg-white divide-y">
        {offers.map((o) => (
          <li key={o.id} className="p-4 flex justify-between items-center">
            <div>
              <strong className="capitalize">{o.category}</strong> — Booking #{o.booking_id}
              <p className="text-sm text-neutral-500">
                Expires {new Date(o.expires_at).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => accept(o.id)} className="btn-primary">Accept</button>
              <button onClick={() => decline(o.id)} className="btn-outline">Decline</button>
            </div>
          </li>
        ))}
        {offers.length === 0 && <li className="p-4 text-neutral-500">No open offers.</li>}
      </ul>
    </div>
  );
}
