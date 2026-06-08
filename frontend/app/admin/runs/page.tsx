'use client';
import Link from 'next/link';
import { agentsAPI } from '@/lib/api';
import { usePoll, StateBlock, StatusBadge, fmtDateTime } from '../_components/ui';

export default function AdminRunsPage() {
  const { data, error, loading } = usePoll(async () => (await agentsAPI.runs()).data);
  const runs = (data as any[]) || [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Agent runs</h2>
      <StateBlock loading={loading} error={error} hasData={runs.length > 0}>
        <div className="bg-white border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-neutral-500">
                <th className="p-3">Run</th>
                <th className="p-3">Goal</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Actions</th>
                <th className="p-3 text-center">Pending</th>
                <th className="p-3">When</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.id} className="border-b hover:bg-neutral-50">
                  <td className="p-3">
                    <Link href={`/admin/runs/${r.id}`} className="text-primary-600 font-medium">
                      #{r.id}
                    </Link>
                  </td>
                  <td className="p-3 max-w-md truncate">
                    <Link href={`/admin/runs/${r.id}`} className="hover:underline">
                      {r.goal}
                    </Link>
                  </td>
                  <td className="p-3"><StatusBadge status={r.status} /></td>
                  <td className="p-3 text-center">
                    {r.summary?.actions_executed}/{r.summary?.actions_total}
                  </td>
                  <td className="p-3 text-center">
                    {r.summary?.needs_approval > 0 ? (
                      <span className="text-amber-600 font-medium">{r.summary.needs_approval}</span>
                    ) : (
                      <span className="text-neutral-400">0</span>
                    )}
                  </td>
                  <td className="p-3 text-neutral-500">{fmtDateTime(r.created_at)}</td>
                </tr>
              ))}
              {runs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-neutral-500">
                    No runs yet. Dispatch one from the Agents tab.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </StateBlock>
    </div>
  );
}
