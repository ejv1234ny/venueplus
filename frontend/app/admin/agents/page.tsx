'use client';
import { useState } from 'react';
import { dashboardAPI, agentsAPI } from '@/lib/api';
import { usePoll, StateBlock, fmtDateTime, errMsg } from '../_components/ui';

export default function AdminAgentsPage() {
  const { data, error, loading, reload } = usePoll(
    async () => (await dashboardAPI.agentsStatus()).data
  );
  const agents = (data as any[]) || [];

  // --- Run a goal (planning) ---
  const [goal, setGoal] = useState('');
  const [goalCity, setGoalCity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // --- Seed a market + readiness ---
  const [market, setMarket] = useState('Austin');
  const [seedBusy, setSeedBusy] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);
  const [readiness, setReadiness] = useState<any>(null);
  const [seedError, setSeedError] = useState<string | null>(null);

  // --- Recruit creators (import) ---
  const [creatorCity, setCreatorCity] = useState('Austin');
  const [creatorText, setCreatorText] = useState('');
  const [creatorBusy, setCreatorBusy] = useState(false);
  const [creatorResult, setCreatorResult] = useState<any>(null);
  const [creatorError, setCreatorError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;
    setSubmitting(true); setResult(null); setFormError(null);
    try {
      const r = await agentsAPI.runGoal(goal.trim(), goalCity.trim() || undefined);
      setResult(r.data); setGoal(''); setGoalCity('');
      await reload();
    } catch (e) { setFormError(errMsg(e)); }
    finally { setSubmitting(false); }
  };

  const loadReadiness = async (city: string) => {
    try { setReadiness((await agentsAPI.readiness(city)).data); }
    catch (e) { /* readiness is best-effort */ }
  };

  const seedMarket = async () => {
    if (!market.trim()) return;
    setSeedBusy(true); setSeedResult(null); setSeedError(null);
    try {
      const r = await agentsAPI.seed(market.trim());
      setSeedResult(r.data);
      await loadReadiness(market.trim());
      await reload();
    } catch (e) { setSeedError(errMsg(e)); }
    finally { setSeedBusy(false); }
  };

  const parseCreators = (text: string) =>
    text.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
      const [name, handle, niche, followers, email, phone] =
        line.split(',').map((s) => s.trim());
      return {
        name, handle: handle || undefined, niche: niche || undefined,
        followers: followers ? Number(followers) || 0 : 0,
        email: email || undefined, phone: phone || undefined,
      };
    }).filter((c) => c.name);

  const importCreators = async () => {
    const leads = parseCreators(creatorText);
    if (!creatorCity.trim() || leads.length === 0) return;
    setCreatorBusy(true); setCreatorResult(null); setCreatorError(null);
    try {
      const r = await agentsAPI.importCreatorLeads(creatorCity.trim(), leads);
      setCreatorResult(r.data); setCreatorText('');
    } catch (e) { setCreatorError(errMsg(e)); }
    finally { setCreatorBusy(false); }
  };

  return (
    <div className="space-y-8">
      {/* Seed a market */}
      <section className="bg-white border rounded-lg p-4">
        <h2 className="font-bold mb-1">Seed a market</h2>
        <p className="text-sm text-neutral-500 mb-3">
          Run the fleet’s real operating loop: scout live public sources and create
          inactive venue/provider leads + creator outreach. Outreach escalates for approval.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input className="input-field sm:max-w-xs" placeholder="City (e.g. Austin)"
            value={market} onChange={(e) => setMarket(e.target.value)} />
          <button className="btn-primary" disabled={seedBusy || !market.trim()}
            onClick={seedMarket}>
            {seedBusy ? 'Seeding…' : 'Seed now'}
          </button>
          <button className="px-4 py-2 rounded-lg border hover:bg-neutral-50 text-sm"
            disabled={!market.trim()} onClick={() => loadReadiness(market.trim())}>
            Check readiness
          </button>
        </div>

        {seedError && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm">⚠ {seedError}</div>
        )}
        {seedResult && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded px-3 py-2 text-sm text-green-800">
            Seed run #{seedResult.run_id}: {seedResult.summary.actions_executed}/{seedResult.summary.actions_total} actions
            executed across {seedResult.summary.jobs_planned} agents · {seedResult.escalations_open} awaiting approval.
          </div>
        )}

        {readiness && (
          <div className="mt-4 border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">Readiness — {readiness.city}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                readiness.ready_for_public ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {readiness.ready_for_public ? 'Ready for public' : 'Not ready'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-3">
              <div><span className="text-neutral-500">Active venues</span><p className="font-bold text-lg">{readiness.active_venues}</p></div>
              <div><span className="text-neutral-500">Lead venues</span><p className="font-bold text-lg">{readiness.lead_venues}</p></div>
              <div><span className="text-neutral-500">Provider leads</span><p className="font-bold text-lg">{readiness.lead_providers}</p></div>
              <div><span className="text-neutral-500">Creator leads</span><p className="font-bold text-lg">{readiness.creator_leads}</p></div>
            </div>
            {readiness.missing_categories?.length > 0 && (
              <p className="text-sm text-amber-700 mb-1">Missing provider categories: {readiness.missing_categories.join(', ')}</p>
            )}
            <p className="text-sm text-neutral-600">{readiness.recommendation}</p>
          </div>
        )}
      </section>

      {/* Recruit creators */}
      <section className="bg-white border rounded-lg p-4">
        <h2 className="font-bold mb-1">Recruit creators (import list)</h2>
        <p className="text-sm text-neutral-500 mb-3">
          One creator per line: <code>name, @handle, niche, followers, email, phone</code>.
          The Creator agent drafts outreach for them on the next seed run.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <input className="input-field sm:max-w-xs" placeholder="City"
            value={creatorCity} onChange={(e) => setCreatorCity(e.target.value)} />
        </div>
        <textarea className="input-field w-full min-h-[110px] font-mono text-sm"
          placeholder={"Ava Wellness, @avawell, wellness, 8000, ava@example.com\nTaco Trailblazer, @tacotrail, food, 5000"}
          value={creatorText} onChange={(e) => setCreatorText(e.target.value)} />
        <div className="mt-3">
          <button className="btn-primary" disabled={creatorBusy || !creatorText.trim() || !creatorCity.trim()}
            onClick={importCreators}>
            {creatorBusy ? 'Importing…' : 'Import creators'}
          </button>
        </div>
        {creatorError && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm">⚠ {creatorError}</div>
        )}
        {creatorResult && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded px-3 py-2 text-sm text-green-800">
            Imported {creatorResult.stats.created} new creator(s), skipped {creatorResult.stats.skipped}.
            Pipeline total: {creatorResult.pipeline.total}.
          </div>
        )}
      </section>

      {/* Run a goal */}
      <section className="bg-white border rounded-lg p-4">
        <h2 className="font-bold mb-3">Run a goal (planning)</h2>
        <form onSubmit={submit} className="space-y-3">
          <input className="input-field" placeholder="e.g. Grow venue supply with paid ads in Austin"
            value={goal} onChange={(e) => setGoal(e.target.value)} />
          <div className="flex flex-col sm:flex-row gap-3">
            <input className="input-field sm:max-w-xs" placeholder="City (optional)"
              value={goalCity} onChange={(e) => setGoalCity(e.target.value)} />
            <button type="submit" className="btn-primary" disabled={submitting || !goal.trim()}>
              {submitting ? 'Dispatching…' : 'Run goal'}
            </button>
          </div>
        </form>
        {formError && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm">⚠ {formError}</div>
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
