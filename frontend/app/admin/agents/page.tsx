'use client';
import { useState } from 'react';
import { dashboardAPI, agentsAPI } from '@/lib/api';
import { usePoll, StateBlock, fmtDateTime, errMsg } from '../_components/ui';

export default function AdminAgentsPage() {
  const { data, error, loading, reload } = usePoll(
    async () => (await dashboardAPI.agentsStatus()).data
  );
  const agents = (data as any[]) || [];

  const [goal, setGoal] = useState('');
  const [city, setCity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;
    setSubmitting(true);
    setResult(null);
    setFormError(null);
    try {
      const r = await agentsAPI.runGoal(goal.trim(), city.trim() || undefined);
      setResult(r.data);
      setGoal('');
      setCity('');
      await reload();
    } catch (e) {
      setFormError(errMsg(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Run a goal */}
      <section className="bg-white border rounded-lg p-4">
        <h2 className="font-bold mb-3">Run a goal</h2>
        <form onSubmit={submit} className="space-y-3">
          <input
            className="input-field"
            placeholder="e.g. Grow venue supply with paid ads in Austin"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="input-field sm:max-w-xs"
              placeholder="City (optional)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <button type="submit" className="btn-primary" disabled={submitting || !goal.trim()}>
              {submitting ? 'Dispatching…' : 'Run goal'}
            </button>
          </div>
        </form>

        {formError && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm">
            ⚠ {formError}
          </div>
        )}
        {result && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded px-3 py-2 text-sm">
            <p className="font-medium text-green-800">
              Run #{result.run_id} dispatched · {result.escalations_open} escalation
              {result.escalations_open === 1 ? '' : 's'} opened.
            </p>
            <p className="text-green-700 mt-1">
              {result.summary.actions_executed}/{result.summary.actions_total} actions auto-executed
              across {result.summary.jobs_planned} agents.
            </p>
          </div>
        )}
      </section>

      {/* Fleet status */}
      <StateBlock loading={loading} error={error} hasData={agents.length > 0}>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((a) => (
            <div key={a.agent} className="bg-white border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold capitalize">{a.agent}</h3>
                  <p className="text-sm text-neutral-500">{a.role}</p>
                </div>
                {a.open_escalations > 0 && (
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {a.open_escalations} pending
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-2">Last run: {fmtDateTime(a.last_run)}</p>
              <div className="flex gap-4 mt-3 text-sm">
                <span className="text-green-600">{a.jobs_done} done</span>
                <span className="text-amber-600">{a.jobs_needs_approval} need approval</span>
                <span className="text-red-600">{a.jobs_blocked} blocked</span>
              </div>
            </div>
          ))}
        </section>
      </StateBlock>
    </div>
  );
}
