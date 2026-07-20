'use client';
import { useState } from 'react';
import Link from 'next/link';
import { dashboardAPI, agentsAPI } from '@/lib/api';
import { usePoll, StateBlock, KpiCard, fmtMoney, errMsg } from './_components/ui';

export default function AdminOverviewPage() {
  const { data, error, loading, reload } = usePoll(async () => (await dashboardAPI.metrics()).data);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  const m = data as any;
  const fleetEnabled = m?.agents?.fleet_enabled;
  const openEsc = m?.agents?.open_escalations ?? 0;

  const toggleFleet = async () => {
    const next = !fleetEnabled;
    const verb = next ? 'RE-ENABLE' : 'DISABLE (kill switch)';
    if (!window.confirm(`${verb} the agent fleet?\n\n${next ? 'Agents will be able to run goals again.' : 'This halts all new agent runs immediately.'}`)) {
      return;
    }
    setBusy(true);
    setToast(null);
    try {
      const r = await agentsAPI.kill(next);
      setToast({ ok: true, msg: `Fleet ${r.data.fleet_enabled ? 'enabled' : 'disabled'}.` });
      await reload();
    } catch (e) {
      setToast({ ok: false, msg: `Failed: ${errMsg(e)}` });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      {toast && (
        <div className={`rounded-lg px-4 py-2 text-sm ${toast.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {toast.msg}
        </div>
      )}

      {openEsc > 0 && (
        <Link
          href="/admin/escalations"
          className="block bg-amber-50 border border-amber-300 text-amber-900 rounded-lg p-4 hover:bg-amber-100 transition-colors"
        >
          <span className="font-bold">{openEsc}</span> escalation{openEsc === 1 ? '' : 's'} awaiting your approval →
        </Link>
      )}

      <StateBlock loading={loading} error={error} hasData={!!m}>
        {m && (
          <>
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard label="Active venues" value={m.supply.active_venues} />
              <KpiCard label="Active providers" value={m.supply.active_providers} />
              <KpiCard label="Bookings (30d)" value={m.demand.bookings_30d} />
              <KpiCard label="GMV (captured)" value={fmtMoney(m.demand.gmv_usd)} />
              <KpiCard label="Platform fees" value={fmtMoney(m.demand.platform_fees_usd)} />
              <KpiCard label="Total bookings" value={m.demand.total_bookings} />
              <KpiCard
                label="Open escalations"
                value={openEsc}
                accent={openEsc > 0 ? 'text-amber-600' : 'text-green-600'}
              />
              <KpiCard
                label="Fleet status"
                value={fleetEnabled ? 'ENABLED' : 'DISABLED'}
                accent={fleetEnabled ? 'text-green-600' : 'text-red-600'}
              />
            </section>

            {/* Kill switch */}
            <section className="bg-white border rounded-lg p-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-bold">Fleet kill switch</h2>
                <p className="text-sm text-neutral-500">
                  {fleetEnabled
                    ? 'Agents can plan and run goals. Disable to halt all new runs.'
                    : 'Agents are halted. New runs are rejected until re-enabled.'}
                </p>
              </div>
              <button
                onClick={toggleFleet}
                disabled={busy}
                className={`px-5 py-2.5 rounded-lg font-medium text-white disabled:opacity-50 ${
                  fleetEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {busy ? 'Working…' : fleetEnabled ? 'Disable fleet' : 'Enable fleet'}
              </button>
            </section>

            {/* Supply / demand / liquidity summary */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-bold mb-2">Supply</h3>
                <ul className="text-sm space-y-1 text-neutral-700">
                  <li>{m.supply.active_venues} active venues</li>
                  <li>{m.supply.active_providers} active providers</li>
                  <li>{Object.keys(m.supply.providers_by_category).length} service categories covered</li>
                  <li>{Object.keys(m.supply.providers_by_city).length} cities served</li>
                </ul>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-bold mb-2">Demand</h3>
                <ul className="text-sm space-y-1 text-neutral-700">
                  <li>{m.demand.total_bookings} total bookings</li>
                  <li>{m.demand.bookings_30d} in the last 30 days</li>
                  <li>{m.demand.events_total} creator events</li>
                  <li>{fmtMoney(m.demand.gmv_usd)} GMV · {fmtMoney(m.demand.platform_fees_usd)} fees</li>
                </ul>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-bold mb-2">Liquidity</h3>
                <ul className="text-sm space-y-1 text-neutral-700">
                  <li>{m.liquidity.fully_serviced_pct}% bookings fully serviced</li>
                  <li className={m.liquidity.unserviceable_bookings > 0 ? 'text-red-600' : ''}>
                    {m.liquidity.unserviceable_bookings} unserviceable bookings
                  </li>
                  <li>{m.liquidity.bookings_per_active_venue} bookings / active venue</li>
                  <li className="text-neutral-400">search→book: not yet tracked</li>
                </ul>
              </div>
            </section>

            {/* Agent lead pipeline */}
            {m.leads && (
              <section className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <h3 className="font-bold">Agent lead pipeline</h3>
                  <div className="flex gap-2">
                    <Link href="/admin/agents" className="text-sm text-primary-600 hover:underline">Seed / manage →</Link>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <KpiCard label="Venue leads" value={m.leads.venue_leads} />
                  <KpiCard label="Provider leads" value={m.leads.provider_leads} />
                  <KpiCard label="Creator leads" value={m.leads.creator_leads} />
                  <KpiCard
                    label="Outreach awaiting approval"
                    value={m.leads.outreach_queued}
                    accent={m.leads.outreach_queued > 0 ? 'text-amber-600' : 'text-green-600'}
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-3">
                  Leads are prospects the agents discovered/imported (not live supply until claimed).
                  Approve queued outreach in <Link href="/admin/escalations" className="text-primary-600 hover:underline">Escalations</Link>.
                </p>
              </section>
            )}
          </>
        )}
      </StateBlock>
    </div>
  );
}
