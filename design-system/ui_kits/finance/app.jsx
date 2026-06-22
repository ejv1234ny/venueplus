/* Finance & Payouts — role-switchable dashboards (operator / host / provider)
   built around the escrow flow. */
const { useState: useFinState } = React;
const F = window.FIN;

const STATUS = {
  held: { bg: 'var(--run-running-bg)', fg: 'var(--run-running-fg)', label: 'In escrow' },
  releasable: { bg: 'var(--run-approval-bg)', fg: 'var(--run-approval-fg)', label: 'Releasable' },
  disputed: { bg: 'var(--status-error-bg)', fg: 'var(--status-error-fg)', label: 'Disputed' },
  released: { bg: 'var(--status-success-bg)', fg: 'var(--status-success-fg)', label: 'Released' },
};
function Pill({ status }) {
  const s = STATUS[status] || STATUS.held;
  return <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 999, background: s.bg, color: s.fg }}>{s.label}</span>;
}

function Bars({ data, labels, accent }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: 11, color: 'var(--text-subtle)', fontWeight: 600 }}>{F.money(v).replace('.00', '')}</div>
          <div style={{ width: '100%', height: `${(v / max) * 80}px`, background: accent, borderRadius: '4px 4px 0 0' }} />
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{labels[i]}</div>
        </div>
      ))}
    </div>
  );
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

function Kpi({ label, value, sub, accent }) {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
      <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ fontSize: 23, fontWeight: 800, color: accent || 'var(--neutral-900)', lineHeight: 1.1, marginTop: 3 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: 'var(--text-subtle)', marginTop: 3 }}>{sub}</div>}
    </div>
  );
}
function Panel({ title, children, right }) {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{title}</h3>{right}
      </div>
      {children}
    </div>
  );
}
const th = { textAlign: 'left', padding: '8px 10px', fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.03em' };
const td = { padding: '11px 10px', fontSize: 13.5, borderTop: '1px solid var(--border-hairline)' };

/* ---------- Escrow flow diagram ---------- */
function EscrowFlow() {
  const { Badge } = window.VenuePlusDesignSystem_17f1a7;
  const s = F.SAMPLE;
  const venue = s.venueRate * s.hours;
  const svc = s.services.map((x) => ({ ...x, amt: x.rate * s.hours }));
  const subtotal = venue + svc.reduce((a, b) => a + b.amt, 0);
  const fee = +(subtotal * s.feePct / 100).toFixed(2);
  const total = +(subtotal + fee).toFixed(2);

  const Node = ({ children, tone }) => (
    <div style={{ background: tone === 'dark' ? 'var(--neutral-900)' : '#fff', color: tone === 'dark' ? '#fff' : 'var(--neutral-900)', border: tone === 'dark' ? 'none' : '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 14, minWidth: 0 }}>{children}</div>
  );
  const Arrow = ({ label }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--neutral-300)', flexShrink: 0, padding: '0 4px' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
      {label && <span style={{ fontSize: 10, color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>{label}</span>}
    </div>
  );

  return (
    <div style={{ background: '#fff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 18, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Escrow flow · booking #{s.id}</h3>
        <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{s.venue} · {s.event}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr auto 0.9fr auto 1.4fr', gap: 8, alignItems: 'center' }}>
        {/* renter pays */}
        <Node>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Renter pays · {s.renter}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary-600)' }}>{F.money(total)}</div>
          <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 4, lineHeight: 1.5 }}>
            Venue {F.money(venue)}<br />{svc.map((x) => `${x.name.split(' ')[0]} ${F.money(x.amt)}`).join(' · ')}<br />Fee {F.money(fee)}
          </div>
        </Node>
        <Arrow label="on booking" />
        {/* escrow */}
        <Node tone="dark">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
            <span style={{ fontSize: 12.5, fontWeight: 600 }}>Held in escrow</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>{F.money(total)}</div>
          <div style={{ fontSize: 10.5, color: 'var(--neutral-400)', marginTop: 4 }}>Released {s.releaseOn}, after the event &amp; dispute window</div>
        </Node>
        <Arrow label="after event" />
        {/* split */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <SplitRow label={`Host · ${s.host}`} amt={venue} accent="var(--primary-500)" />
          {svc.map((x) => <SplitRow key={x.cat} label={x.name} amt={x.amt} badge={<Badge category={x.cat} />} />)}
          <SplitRow label="Platform fee" amt={fee} accent="var(--accent-500)" muted />
        </div>
      </div>
    </div>
  );
}
function SplitRow({ label, amt, accent, badge, muted }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: muted ? 'var(--neutral-50)' : '#fff', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '7px 10px' }}>
      {accent && <span style={{ width: 7, height: 7, borderRadius: '50%', background: accent, flexShrink: 0 }} />}
      {badge}
      <span style={{ flex: 1, fontSize: 12.5, color: 'var(--neutral-700)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--neutral-900)' }}>{F.money(amt)}</span>
    </div>
  );
}

/* ---------- Operator ---------- */
function Operator() {
  const { Button, Badge } = window.VenuePlusDesignSystem_17f1a7;
  const o = F.OPERATOR_YTD;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        <Kpi label="In escrow now" value={F.money(o.inEscrow)} accent="var(--run-running-fg)" />
        <Kpi label="Releasable now" value={F.money(o.releasable)} accent="var(--run-approval-fg)" sub="ready to pay out" />
        <Kpi label="Released YTD" value={F.money(o.releasedYtd).replace('.00', '')} accent="var(--status-success-fg)" />
        <Kpi label="Platform fees YTD" value={F.money(o.fees).replace('.00', '')} />
        <Kpi label="Open disputes" value={o.disputes} accent={o.disputes ? 'var(--status-error-fg)' : 'var(--status-success-fg)'} />
      </div>
      <EscrowFlow />
      <Panel title="Escrow ledger" right={<span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>GMV YTD {F.money(o.gmv).replace('.00', '')}</span>}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={th}>Booking</th><th style={th}>Venue</th><th style={th}>Event</th><th style={{ ...th, textAlign: 'right' }}>Held</th><th style={{ ...th, textAlign: 'right' }}>Host</th><th style={{ ...th, textAlign: 'right' }}>Services</th><th style={{ ...th, textAlign: 'right' }}>Fee</th><th style={th}>Status</th><th style={th}></th></tr></thead>
          <tbody>
            {F.LEDGER.map((b) => {
              const svc = b.services.reduce((a, s) => a + s[1], 0);
              return (
                <tr key={b.id}>
                  <td style={{ ...td, fontWeight: 600, color: 'var(--primary-600)' }}>#{b.id}</td>
                  <td style={td}>{b.venue}</td>
                  <td style={{ ...td, color: 'var(--text-muted)' }}>{b.event}</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 600 }}>{F.money(b.total)}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{F.money(b.host)}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{F.money(svc)}</td>
                  <td style={{ ...td, textAlign: 'right', color: 'var(--accent-600)' }}>{F.money(b.fee)}</td>
                  <td style={td}><Pill status={b.status} /></td>
                  <td style={{ ...td, textAlign: 'right' }}>{b.status === 'releasable' ? <Button size="sm" variant="primary">Release</Button> : b.status === 'disputed' ? <span style={{ fontSize: 12, color: 'var(--status-error-fg)' }}>review</span> : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

/* ---------- Host ---------- */
function Host() {
  const h = F.HOST, y = h.ytd;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        <Kpi label="Earnings YTD" value={F.money(y.earnings).replace('.00', '')} accent="var(--primary-600)" />
        <Kpi label="Bookings YTD" value={y.bookings} />
        <Kpi label="Avg / booking" value={F.money(y.avg).replace('.00', '')} />
        <Kpi label="Next payout" value={F.money(y.nextPayout).replace('.00', '')} sub={y.nextDate} accent="var(--status-success-fg)" />
        <Kpi label="In escrow" value={F.money(y.inEscrow).replace('.00', '')} accent="var(--run-running-fg)" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16 }}>
        <Panel title="Earnings by month"><Bars data={h.monthly} labels={MONTHS} accent="var(--primary-500)" /></Panel>
        <Panel title="Occupancy">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 120 }}>
            <div style={{ fontSize: 44, fontWeight: 800, color: 'var(--primary-600)' }}>{y.occupancy}%</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>of available hours booked</div>
          </div>
        </Panel>
      </div>
      <Panel title={`Your bookings · ${h.venue}`}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={th}>Booking</th><th style={th}>Event</th><th style={th}>Renter</th><th style={{ ...th, textAlign: 'right' }}>Gross</th><th style={{ ...th, textAlign: 'right' }}>Your payout</th><th style={th}>Status</th></tr></thead>
          <tbody>{h.bookings.map((b) => (
            <tr key={b.id}><td style={{ ...td, fontWeight: 600, color: 'var(--primary-600)' }}>#{b.id}</td><td style={{ ...td, color: 'var(--text-muted)' }}>{b.event}</td><td style={td}>{b.renter}</td><td style={{ ...td, textAlign: 'right' }}>{F.money(b.gross)}</td><td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{F.money(b.payout)}</td><td style={td}><Pill status={b.status} /></td></tr>
          ))}</tbody>
        </table>
      </Panel>
    </div>
  );
}

/* ---------- Provider ---------- */
function Provider() {
  const { Badge } = window.VenuePlusDesignSystem_17f1a7;
  const pr = F.PROVIDER, y = pr.ytd;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        <Kpi label="Earnings YTD" value={F.money(y.earnings).replace('.00', '')} accent="var(--primary-600)" />
        <Kpi label="Jobs YTD" value={y.jobs} />
        <Kpi label="Avg / job" value={F.money(y.avg).replace('.00', '')} />
        <Kpi label="Next payout" value={F.money(y.nextPayout).replace('.00', '')} sub={y.nextDate} accent="var(--status-success-fg)" />
        <Kpi label="Rating" value={`★ ${y.rating}`} accent="var(--accent-600)" />
      </div>
      <Panel title="Earnings by month" right={<Badge category={pr.cat} />}><Bars data={pr.monthly} labels={MONTHS} accent="var(--accent-500)" /></Panel>
      <Panel title="Your jobs">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={th}>Booking</th><th style={th}>Event</th><th style={th}>Venue</th><th style={{ ...th, textAlign: 'right' }}>Hours</th><th style={{ ...th, textAlign: 'right' }}>Payout</th><th style={th}>Status</th></tr></thead>
          <tbody>{pr.jobs.map((j) => (
            <tr key={j.id}><td style={{ ...td, fontWeight: 600, color: 'var(--primary-600)' }}>#{j.id}</td><td style={{ ...td, color: 'var(--text-muted)' }}>{j.event}</td><td style={td}>{j.venue}</td><td style={{ ...td, textAlign: 'right' }}>{j.hours}h</td><td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{F.money(j.payout)}</td><td style={td}><Pill status={j.status} /></td></tr>
          ))}</tbody>
        </table>
      </Panel>
    </div>
  );
}

function App() {
  const [role, setRole] = useFinState('operator');
  const roles = [['operator', 'Operator', 'Avery Stone'], ['host', 'Host', 'Marcus Reed'], ['provider', 'Provider', 'Lone Star Security']];
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-console)', fontFamily: 'var(--font-sans)' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid var(--border-default)', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="../../assets/venueplus-logo-mark.png" alt="VenuePlus" style={{ height: 34 }} />
        <div style={{ fontSize: 16, fontWeight: 700 }}>Finance &amp; Payouts</div>
        <div style={{ marginLeft: 'auto', display: 'flex', background: 'var(--neutral-100)', borderRadius: 999, padding: 3 }}>
          {roles.map(([id, label]) => (
            <button key={id} onClick={() => setRole(id)} style={{ border: 'none', cursor: 'pointer', borderRadius: 999, padding: '7px 16px', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-sans)', background: role === id ? 'var(--primary-500)' : 'transparent', color: role === id ? '#fff' : 'var(--text-muted)' }}>{label}</button>
          ))}
        </div>
      </header>
      <div style={{ padding: '12px 24px 6px', maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Viewing as</span>
        <span style={{ fontSize: 13.5, fontWeight: 600 }}>{roles.find((r) => r[0] === role)[2]}</span>
        <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>· year to date 2026</span>
      </div>
      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '8px 24px 64px' }}>
        {role === 'operator' && <Operator />}
        {role === 'host' && <Host />}
        {role === 'provider' && <Provider />}
      </main>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
