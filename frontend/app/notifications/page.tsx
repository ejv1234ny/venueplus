'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { notificationsAPI } from '@/lib/api';

export default function NotificationsPage() {
  const [items, setItems] = useState<any[]>([]);

  const load = () => notificationsAPI.list().then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const markAll = async () => { await notificationsAPI.markAllRead(); load(); };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button onClick={markAll} className="btn-outline">Mark all read</button>
      </div>
      <ul className="border rounded-lg bg-white divide-y">
        {items.map((n) => (
          <li key={n.id} className={`p-4 ${n.read ? '' : 'bg-blue-50'}`}>
            <Link href={n.link || '#'}>
              <strong>{n.title}</strong>
              <p className="text-sm text-neutral-600">{n.body}</p>
              <p className="text-xs text-neutral-500">{new Date(n.created_at).toLocaleString()}</p>
            </Link>
          </li>
        ))}
        {items.length === 0 && <li className="p-4 text-neutral-500">No notifications.</li>}
      </ul>
    </div>
  );
}
