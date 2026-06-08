'use client';
import { useState } from 'react';
import Link from 'next/link';
import { dashboardAPI, agentsAPI } from '@/lib/api';
import { usePoll, StateBlock, RiskBadge, fmtDateTime, errMsg } from '../_components/ui';

const HARD_GATED = new Set(['money_movement', 'legal']);

export default function AdminEscalationsPage() {
  const { data, error, loading, reload } = usePoll(
    async () => (await dashboardAPI.escalations('open')).data
  );
  const escalations = (data as any[]) || [];

  const [pending, setPending] = useState<Set<number>>(new Set());
  const [hidden, setHidden] = useState<Set<number>>(new Set()); // optimistic removal
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  const resolve = async (e: any, approve: boolean) => {
    const verb = approve ? 'Approve' : 'Reject';
    if (HARD_GATED.has(e.risk)) {
      if (!window.confirm(
        `${verb} a ${e.risk.replace('_', ' ').toUpperCase()} action?\n\nTool: ${e.tool}\n${e.reason}\n\nThis is a hard-gated, high-risk action.`
      )) return;
    }
    setPending((s) => new Set(s).add(e.id));
    setToast(null);
    // optimistic: hide immediately
    setHidden((s) => new Set(s).add(e.id));
    try {
      if (approve) await agentsAPI.approve(e.id);
      else await agentsAPI.reject(e.id);
      setToast({ ok: true, msg: `${verb}d ${e.tool} (run #${e.run_id}).` });
      await reload();
    } catch (err) {
      // rollback optimistic hide on failure
      setHidden((s) => {
        const n = new Set(s);
        n.delete(e.id);
        return n;
      });
      setToast({ ok: false, msg: `${verb} failed: ${errMsg(err)}` });
    } finally {
      setPending((s) => {
        const n = new Set(s);
        n.delete(e.id);
        return n;
      });
    }
  };

  const visible = escalations.filter((e) => !hidden.has(e.id));

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Approval queue</h2>

      {toast && (
        <div className={`rounded-lg px-4 py-2 text-sm ${toast.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {toast.msg}
        </div>
      )}

      <StateBlock loading={loading} error={error} hasData={escalations.length > 0}>
        {visible.length === 0 ? (
          <div className="bg-white border rounded-lg p-8 text-center text-neutral-500">
            🎉 No open escalations. The fleet is clear.
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((e) => (
              <div key={e.id} className="bg-white border rounded-lg p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm">{e.tool}</span>
                      <RiskBadge risk={e.risk} />
                      <span className="text-xs text-neutral-400 capitalize">{e.agent}</span>
                    </div>
                    <p className="text-sm text-neutral-700 mt-1">{e.reason}</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      <Link href={`/admin/runs/${e.run_id}`} className="text-primary-600">
                        run #{e.run_id}
                      </Link>
                      {e.run_goal ? ` · ${e.run_goal}` : ''} · {fmtDateTime(e.created_at)}
                    </p>
                    {e.args && Object.keys(e.args).length > 0 && (
                      <pre className="mt-2 bg-neutral-50 border rounded p-2 text-xs overflow-x-auto">
                        {JSON.stringify(e.args, null, 2)}
                      </pre>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => resolve(e, true)}
                      disabled={pending.has(e.id)}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => resolve(e, false)}
                      disabled={pending.has(e.id)}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
                {HARD_GATED.has(e.risk) && (
                  <p className="text-xs text-red-600 mt-2 font-medium">
                    ⚠ Hard-gated {e.risk.replace('_', ' ')} action — requires explicit confirmation.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </StateBlock>
    </div>
  );
}
