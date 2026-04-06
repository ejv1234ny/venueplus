'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { messagesAPI } from '@/lib/api';

export default function MessagesPage() {
  const [convos, setConvos] = useState<any[]>([]);
  useEffect(() => { messagesAPI.conversations().then(r => setConvos(r.data)); }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <ul className="divide-y border rounded-lg bg-white">
        {convos.map((c) => (
          <li key={c.id}>
            <Link href={`/messages/${c.id}`} className="block p-4 hover:bg-neutral-50">
              <div className="flex justify-between">
                <strong>{c.title}</strong>
                {c.unread > 0 && (
                  <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                    {c.unread}
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-600 truncate">{c.last_message || 'No messages yet'}</p>
            </Link>
          </li>
        ))}
        {convos.length === 0 && <li className="p-4 text-neutral-500">No conversations yet.</li>}
      </ul>
    </div>
  );
}
