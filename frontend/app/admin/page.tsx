'use client';
import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    adminAPI.stats().then(r => setStats(r.data)).catch(() => {});
    adminAPI.users({ limit: 50 }).then(r => setUsers(r.data)).catch(() => {});
    adminAPI.bookings({ limit: 50 }).then(r => setBookings(r.data)).catch(() => {});
  }, []);

  if (!stats) return <div className="p-6">Loading admin... (must be admin role)</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Admin</h1>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries({
          users: stats.users, venues: stats.venues, providers: stats.providers,
          bookings: stats.bookings, gmv: `$${(stats.gmv || 0).toFixed(0)}`,
          reviews: stats.reviews, messages: stats.messages,
        }).map(([k, v]) => (
          <div key={k} className="bg-white border rounded-lg p-4">
            <p className="text-sm text-neutral-500 capitalize">{k}</p>
            <p className="text-2xl font-bold">{String(v)}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">Bookings by status</h2>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {Object.entries(stats.by_status || {}).map(([s, n]) => (
            <div key={s} className="bg-white border rounded p-2 text-sm">
              <strong>{n as any}</strong> {s}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">Recent users</h2>
        <table className="w-full bg-white border rounded text-sm">
          <thead><tr className="border-b">
            <th className="p-2 text-left">Email</th><th>Role</th><th>Verified</th><th>Active</th><th>Action</th>
          </tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="p-2">{u.email}</td>
                <td className="text-center">{u.role}</td>
                <td className="text-center">{u.verified ? '✓' : '✗'}</td>
                <td className="text-center">{u.active ? '✓' : '✗'}</td>
                <td className="text-center">
                  <button onClick={() => adminAPI.suspendUser(u.id)} className="text-red-600 text-xs">
                    Suspend
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">Recent bookings</h2>
        <table className="w-full bg-white border rounded text-sm">
          <thead><tr className="border-b">
            <th className="p-2 text-left">ID</th><th>Status</th><th>Total</th><th>Start</th>
          </tr></thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b">
                <td className="p-2">{b.id}</td>
                <td className="text-center">{b.status}</td>
                <td className="text-center">${b.total}</td>
                <td className="text-center">{new Date(b.start).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
