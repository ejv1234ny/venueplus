'use client';
import { useCallback, useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { StateBlock, fmtDateTime, errMsg } from '../_components/ui';

const ROLE_STYLES: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  venue_owner: 'bg-sky-100 text-sky-800',
  service_provider: 'bg-teal-100 text-teal-800',
  creator: 'bg-orange-100 text-orange-800',
  renter: 'bg-neutral-100 text-neutral-700',
};

export default function AdminUsersPage() {
  const [q, setQ] = useState('');
  const [users, setUsers] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async (query = '') => {
    setLoading(true);
    try {
      const r = await adminAPI.users({ q: query || undefined, limit: 200 });
      setUsers(r.data);
      setError(null);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (id: number, fn: () => Promise<any>) => {
    setBusy(id);
    try { await fn(); await load(q); } catch (e) { setError(errMsg(e)); }
    finally { setBusy(null); }
  };

  const rows = users || [];
  const counts = rows.reduce((acc: Record<string, number>, u: any) => {
    acc[u.role] = (acc[u.role] || 0) + 1; return acc;
  }, {});

  return (
    <div className="space-y-5">
      <form
        onSubmit={(e) => { e.preventDefault(); load(q); }}
        className="flex gap-2"
      >
        <input
          className="input-field max-w-sm"
          placeholder="Search name or email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn-primary" type="submit">Search</button>
        {q && (
          <button type="button" className="px-4 py-2 rounded-lg border hover:bg-neutral-50"
            onClick={() => { setQ(''); load(''); }}>Clear</button>
        )}
      </form>

      {users && (
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="text-neutral-500">{rows.length} shown ·</span>
          {Object.entries(counts).map(([role, n]) => (
            <span key={role} className={`px-2 py-0.5 rounded-full text-xs ${ROLE_STYLES[role] || 'bg-neutral-100'}`}>
              {role.replace('_', ' ')}: {n as number}
            </span>
          ))}
        </div>
      )}

      <StateBlock loading={loading} error={error} hasData={!!users}>
        <div className="bg-white border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-500 border-b">
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Joined</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u: any) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-neutral-50">
                  <td className="p-3">
                    <p className="font-medium">{u.name}</p>
                    <p className="text-neutral-500 text-xs">{u.email}</p>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${ROLE_STYLES[u.role] || 'bg-neutral-100'}`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={u.active ? 'text-green-600' : 'text-red-600'}>
                      {u.active ? 'active' : 'suspended'}
                    </span>
                    {!u.verified && <span className="text-amber-600 text-xs ml-2">unverified</span>}
                  </td>
                  <td className="p-3 text-neutral-500">{fmtDateTime(u.created_at)}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    {!u.verified && (
                      <button disabled={busy === u.id}
                        onClick={() => act(u.id, () => adminAPI.verifyUser(u.id))}
                        className="text-xs px-2 py-1 rounded border hover:bg-neutral-50 mr-1 disabled:opacity-50">
                        Verify
                      </button>
                    )}
                    {u.active ? (
                      <button disabled={busy === u.id}
                        onClick={() => act(u.id, () => adminAPI.suspendUser(u.id))}
                        className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50">
                        Suspend
                      </button>
                    ) : (
                      <button disabled={busy === u.id}
                        onClick={() => act(u.id, () => adminAPI.reactivateUser(u.id))}
                        className="text-xs px-2 py-1 rounded border border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50">
                        Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-neutral-500">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </StateBlock>
    </div>
  );
}
