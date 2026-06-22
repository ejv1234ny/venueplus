/* Overview: the operator's at-a-glance command screen. */
function Overview({ metrics, openEsc, fleetEnabled, onToggleFleet, onGoEscalations }) {
  const { KpiCard, Button, Card } = window.VenuePlusDesignSystem_17f1a7;
  const money = (n) => '$' + n.toLocaleString('en-US');

  const Summary = ({ title, rows }) => (
    <Card padding="md" style={{ border: '1px solid var(--border-default)', boxShadow: 'none' }}>
      <h3 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 700, color: 'var(--neutral-900)' }}>{title}</h3>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows.map((r, i) => (
          <li key={i} style={{ fontSize: 13.5, color: r.alarm ? 'var(--status-error-fg)' : 'var(--neutral-700)' }}>{r.text}</li>
        ))}
      </ul>
    </Card>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {openEsc > 0 && (
        <button onClick={onGoEscalations} style={{
          textAlign: 'left', cursor: 'pointer', border: '1px solid var(--alert-border)',
          background: 'var(--alert-bg)', color: 'var(--alert-fg)', borderRadius: 'var(--radius-lg)',
          padding: '14px 18px', fontFamily: 'var(--font-sans)', fontSize: 14,
        }}>
          <strong>{openEsc}</strong> escalation{openEsc === 1 ? '' : 's'} awaiting your approval&nbsp;→
        </button>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <KpiCard label="Active venues" value={metrics.active_venues} />
        <KpiCard label="Active providers" value={metrics.active_providers} />
        <KpiCard label="Bookings (30d)" value={metrics.bookings_30d} delta="+12% vs prior 30d" deltaTone="up" />
        <KpiCard label="GMV (captured)" value={money(metrics.gmv)} delta="+9% vs prior 30d" deltaTone="up" />
        <KpiCard label="Platform fees" value={money(metrics.fees)} />
        <KpiCard label="Total bookings" value={metrics.total_bookings.toLocaleString()} />
        <KpiCard label="Open escalations" value={openEsc}
          accent={openEsc > 0 ? 'var(--status-pending-fg)' : 'var(--status-success-fg)'} />
        <KpiCard label="Fleet status" value={fleetEnabled ? 'ENABLED' : 'DISABLED'}
          accent={fleetEnabled ? 'var(--status-success-fg)' : 'var(--status-error-fg)'} />
      </div>

      {/* Kill switch */}
      <Card padding="md" style={{
        border: '1px solid var(--border-default)', boxShadow: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--neutral-900)' }}>Fleet kill switch</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--text-muted)' }}>
            {fleetEnabled
              ? 'Agents can plan and run goals autonomously. Disable to halt all new runs instantly.'
              : 'Agents are halted. New runs are rejected until you re-enable the fleet.'}
          </p>
        </div>
        <button onClick={onToggleFleet} style={{
          border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-md)',
          padding: '10px 20px', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: '#fff',
          background: fleetEnabled ? 'var(--status-error-fg)' : 'var(--status-success-fg)',
        }}>
          {fleetEnabled ? 'Disable fleet' : 'Enable fleet'}
        </button>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <Summary title="Supply" rows={[
          { text: `${metrics.active_venues} active venues` },
          { text: `${metrics.active_providers} active providers` },
          { text: `${metrics.categories} service categories covered` },
          { text: `${metrics.cities} launch cities` },
        ]} />
        <Summary title="Demand" rows={[
          { text: `${metrics.total_bookings.toLocaleString()} total bookings` },
          { text: `${metrics.bookings_30d} in the last 30 days` },
          { text: `${money(metrics.gmv)} GMV` },
          { text: `${money(metrics.fees)} platform fees` },
        ]} />
        <Summary title="Liquidity" rows={[
          { text: `${metrics.fully_serviced_pct}% bookings fully serviced` },
          { text: `${metrics.unserviceable} unserviceable bookings`, alarm: metrics.unserviceable > 0 },
          { text: `${metrics.bookings_per_venue} bookings / active venue` },
          { text: `Agents cleared ${metrics.active_venues + metrics.active_providers} listings to date` },
        ]} />
      </div>
    </div>
  );
}

Object.assign(window, { Overview });
