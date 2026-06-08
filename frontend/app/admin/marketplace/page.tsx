'use client';
import { dashboardAPI } from '@/lib/api';
import { usePoll, StateBlock, KpiCard, BarChart, fmtMoney } from '../_components/ui';

export default function AdminMarketplacePage() {
  const { data, error, loading } = usePoll(async () => {
    const [metrics, bookings, gmv, venues, providers] = await Promise.all([
      dashboardAPI.metrics(),
      dashboardAPI.timeseries('bookings', 30),
      dashboardAPI.timeseries('gmv', 30),
      dashboardAPI.timeseries('new_venues', 30),
      dashboardAPI.timeseries('new_providers', 30),
    ]);
    return {
      m: metrics.data,
      bookings: bookings.data,
      gmv: gmv.data,
      venues: venues.data,
      providers: providers.data,
    };
  });
  const d = data as any;

  return (
    <div className="space-y-8">
      <StateBlock loading={loading} error={error} hasData={!!d}>
        {d && (
          <>
            {/* Liquidity callouts */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard label="Fully serviced" value={`${d.m.liquidity.fully_serviced_pct}%`} accent="text-green-600" />
              <KpiCard
                label="Unserviceable bookings"
                value={d.m.liquidity.unserviceable_bookings}
                accent={d.m.liquidity.unserviceable_bookings > 0 ? 'text-red-600' : 'text-green-600'}
              />
              <KpiCard label="Bookings / venue" value={d.m.liquidity.bookings_per_active_venue} />
              <KpiCard label="GMV (captured)" value={fmtMoney(d.m.demand.gmv_usd)} />
            </section>

            {/* Charts */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-bold mb-3">Bookings · last 30 days</h3>
                <BarChart points={d.bookings.points} />
              </div>
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-bold mb-3">GMV · last 30 days</h3>
                <BarChart points={d.gmv.points} format={fmtMoney} />
              </div>
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-bold mb-3">New venues · last 30 days</h3>
                <BarChart points={d.venues.points} />
              </div>
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-bold mb-3">New providers · last 30 days</h3>
                <BarChart points={d.providers.points} />
              </div>
            </section>

            {/* Coverage tables */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Coverage title="Providers by category" rows={d.m.supply.providers_by_category} />
              <Coverage title="Providers by city" rows={d.m.supply.providers_by_city} />
            </section>
          </>
        )}
      </StateBlock>
    </div>
  );
}

function Coverage({ title, rows }: { title: string; rows: Record<string, number> }) {
  const entries = Object.entries(rows).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, n]) => n));
  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="font-bold mb-3">{title}</h3>
      {entries.length === 0 ? (
        <p className="text-sm text-neutral-500">No data yet.</p>
      ) : (
        <div className="space-y-2">
          {entries.map(([k, n]) => (
            <div key={k} className="flex items-center gap-2 text-sm">
              <span className="w-32 truncate capitalize">{k}</span>
              <div className="flex-1 bg-neutral-100 rounded h-4 overflow-hidden">
                <div
                  className="bg-primary-500 h-full rounded"
                  style={{ width: `${(n / max) * 100}%` }}
                />
              </div>
              <span className="w-8 text-right font-medium">{n}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
