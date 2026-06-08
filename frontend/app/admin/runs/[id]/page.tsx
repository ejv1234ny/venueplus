'use client';
import Link from 'next/link';
import { agentsAPI } from '@/lib/api';
import {
  usePoll, StateBlock, StatusBadge, RiskBadge, DecisionBadge, fmtDateTime,
} from '../../_components/ui';

export default function AdminRunDetailPage({ params }: { params: { id: string } }) {
  const runId = Number(params.id);
  const { data, error, loading } = usePoll(async () => (await agentsAPI.run(runId)).data);
  const run = data as any;

  return (
    <div className="space-y-4">
      <Link href="/admin/runs" className="text-sm text-primary-600">← All runs</Link>

      <StateBlock loading={loading} error={error} hasData={!!run}>
        {run && (
          <>
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-xl font-bold">Run #{run.id}</h2>
                <StatusBadge status={run.status} />
              </div>
              <p className="text-neutral-700 mt-1">{run.goal}</p>
              <p className="text-xs text-neutral-400 mt-1">{fmtDateTime(run.created_at)}</p>
              {run.summary && (
                <p className="text-sm text-neutral-600 mt-2">
                  {run.summary.actions_executed}/{run.summary.actions_total} actions executed ·{' '}
                  {run.summary.needs_approval} awaiting approval
                </p>
              )}
            </div>

            {/* Audit trace: jobs -> actions */}
            <div className="space-y-4">
              {run.jobs.map((job: any) => (
                <div key={job.agent} className="bg-white border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-neutral-50">
                    <h3 className="font-bold capitalize">{job.agent}</h3>
                    <StatusBadge status={job.status} />
                  </div>

                  {job.blockers?.length > 0 && (
                    <div className="px-4 py-2 bg-amber-50 text-amber-800 text-sm border-b">
                      <span className="font-medium">Blockers:</span> {job.blockers.join('; ')}
                    </div>
                  )}

                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-neutral-500 border-b">
                        <th className="px-4 py-2">Tool</th>
                        <th className="px-4 py-2">Risk</th>
                        <th className="px-4 py-2">Decision</th>
                        <th className="px-4 py-2 text-center">Executed</th>
                        <th className="px-4 py-2">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {job.actions.map((a: any, i: number) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="px-4 py-2 font-mono text-xs">{a.tool}</td>
                          <td className="px-4 py-2"><RiskBadge risk={a.risk} /></td>
                          <td className="px-4 py-2"><DecisionBadge decision={a.decision} /></td>
                          <td className="px-4 py-2 text-center">
                            {a.executed ? (
                              <span className="text-green-600">✓</span>
                            ) : (
                              <span className="text-neutral-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-neutral-600">{a.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </>
        )}
      </StateBlock>
    </div>
  );
}
