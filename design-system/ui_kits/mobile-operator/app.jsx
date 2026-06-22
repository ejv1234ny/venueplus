/* Mobile operator — on-the-go approval queue. Clears escalations from a phone.
   Reuses MC_DATA (shared with the desktop console) + the Badge component. */
const { useState: useMobState, useEffect: useMobEffect } = React;

const RISK_LABEL = { read: 'Read', internal_write: 'Internal', outbound: 'Outbound', financial: 'Financial', money_movement: 'Money', legal: 'Legal' };

function Icon({ name, size = 22, color = 'currentColor' }) {
  const p = {
    home: <path d="M3 10.5 12 3l9 7.5M5 9.5V20h5v-6h4v6h5V9.5" />,
    inbox: <path d="M3 13h4l2 3h6l2-3h4M5 5h14l2 8v6H3v-6L5 5Z" />,
    pulse: <path d="M3 12h4l3 8 4-16 3 8h4" />,
    sliders: <path d="M4 8h10M18 8h2M4 16h2M10 16h10M14 6v4M8 14v4" />,
  }[name];
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{p}</svg>;
}

function TopBar({ fleetEnabled }) {
  return (
    <div style={{ padding: '52px 18px 12px', display: 'flex', alignItems: 'center', gap: 10, background: '#fff' }}>
      <img src="../../assets/venueplus-logo-mark.png" alt="" style={{ height: 30 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--neutral-900)', lineHeight: 1 }}>Mission Control</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Avery Stone · solo operator</div>
      </div>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, padding: '4px 9px', borderRadius: 999, background: fleetEnabled ? 'var(--status-success-bg)' : 'var(--status-error-bg)', color: fleetEnabled ? 'var(--status-success-fg)' : 'var(--status-error-fg)' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor' }} />{fleetEnabled ? 'Live' : 'Halted'}
      </span>
    </div>
  );
}

/* ---------------- Queue ---------------- */
function Queue({ escalations, onResolve }) {
  const { Badge } = window.VenuePlusDesignSystem_17f1a7;
  const [open, setOpen] = useMobState(null);
  const HARD = new Set(['money_movement', 'legal']);

  if (!escalations.length) {
    return (
      <div style={{ padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--status-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 30, color: 'var(--status-success-fg)' }}>✓</div>
        <h2 style={{ margin: '0 0 6px', fontSize: 19, fontWeight: 700 }}>Queue clear</h2>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>Nothing needs you right now. The fleet keeps running.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '4px 14px 20px' }}>
      <h2 style={{ margin: '8px 4px 12px', fontSize: 17, fontWeight: 700 }}>Approval queue · {escalations.length}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {escalations.map((e) => {
          const gated = HARD.has(e.risk);
          const isOpen = open === e.id;
          return (
            <div key={e.id} style={{ background: '#fff', border: `1px solid ${gated ? '#fecaca' : 'var(--border-default)'}`, borderRadius: 16, padding: 14, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 8 }}>
                <Badge risk={e.risk} />
                <span style={{ fontSize: 12, color: 'var(--text-subtle)', textTransform: 'capitalize' }}>{e.agent}</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-subtle)' }}>{e.created_at}</span>
              </div>
              <code style={{ fontSize: 12.5, fontFamily: 'ui-monospace, monospace', color: 'var(--neutral-800)' }}>{e.tool}</code>
              <p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.45, color: 'var(--neutral-700)' }}>{e.reason}</p>
              {gated && <p style={{ margin: '8px 0 0', fontSize: 12, fontWeight: 600, color: 'var(--status-error-fg)' }}>⚠ Hard-gated {RISK_LABEL[e.risk]} action</p>}

              {e.args && (
                <button onClick={() => setOpen(isOpen ? null : e.id)} style={{ marginTop: 8, border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: 'var(--primary-600)', fontSize: 12.5, fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
                  {isOpen ? 'Hide details' : 'View details'}
                </button>
              )}
              {isOpen && e.args && (
                <pre style={{ margin: '8px 0 0', background: 'var(--neutral-50)', border: '1px solid var(--border-hairline)', borderRadius: 8, padding: 10, fontSize: 11, overflowX: 'auto', color: 'var(--neutral-700)' }}>{JSON.stringify(e.args, null, 2)}</pre>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => onResolve(e.id, true)} style={{ flex: 1, border: 'none', cursor: 'pointer', borderRadius: 10, padding: '11px 0', fontSize: 14, fontWeight: 600, color: '#fff', background: 'var(--status-success-fg)', fontFamily: 'var(--font-sans)' }}>Approve</button>
                <button onClick={() => onResolve(e.id, false)} style={{ flex: 1, cursor: 'pointer', borderRadius: 10, padding: '11px 0', fontSize: 14, fontWeight: 600, color: 'var(--status-error-fg)', background: '#fff', border: '1px solid #fecaca', fontFamily: 'var(--font-sans)' }}>Reject</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Home ---------------- */
function Home({ metrics, openEsc, fleetEnabled, onToggleFleet, onGoQueue }) {
  const money = (n) => '$' + n.toLocaleString('en-US');
  const tile = (label, value, accent) => (
    <div style={{ background: '#fff', border: '1px solid var(--border-default)', borderRadius: 14, padding: 14 }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: accent || 'var(--neutral-900)', marginTop: 2, lineHeight: 1.1 }}>{value}</div>
    </div>
  );
  return (
    <div style={{ padding: '4px 14px 20px' }}>
      {openEsc > 0 && (
        <button onClick={onGoQueue} style={{ width: '100%', textAlign: 'left', cursor: 'pointer', border: '1px solid var(--alert-border)', background: 'var(--alert-bg)', color: 'var(--alert-fg)', borderRadius: 14, padding: '13px 16px', fontFamily: 'var(--font-sans)', fontSize: 14, margin: '8px 0 14px' }}>
          <strong>{openEsc}</strong> awaiting your approval&nbsp;→
        </button>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {tile('Open escalations', openEsc, openEsc > 0 ? 'var(--status-pending-fg)' : 'var(--status-success-fg)')}
        {tile('Fleet', fleetEnabled ? 'Live' : 'Halted', fleetEnabled ? 'var(--status-success-fg)' : 'var(--status-error-fg)')}
        {tile('GMV (30d)', money(metrics.gmv))}
        {tile('Bookings (30d)', metrics.bookings_30d)}
        {tile('Active venues', metrics.active_venues)}
        {tile('Providers', metrics.active_providers)}
      </div>
      <div style={{ background: '#fff', border: '1px solid var(--border-default)', borderRadius: 14, padding: 16, marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 700 }}>Fleet kill switch</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{fleetEnabled ? 'Halt all new runs' : 'Re-enable the fleet'}</div>
        </div>
        <button onClick={onToggleFleet} style={{ border: 'none', cursor: 'pointer', borderRadius: 10, padding: '9px 16px', fontSize: 13.5, fontWeight: 600, color: '#fff', background: fleetEnabled ? 'var(--status-error-fg)' : 'var(--status-success-fg)', fontFamily: 'var(--font-sans)' }}>{fleetEnabled ? 'Disable' : 'Enable'}</button>
      </div>
    </div>
  );
}

/* ---------------- Fleet ---------------- */
function FleetList({ agents }) {
  const { Badge } = window.VenuePlusDesignSystem_17f1a7;
  const FACETS = window.MC_DATA.FACETS;
  return (
    <div style={{ padding: '4px 14px 20px' }}>
      <h2 style={{ margin: '8px 4px 12px', fontSize: 17, fontWeight: 700 }}>Fleet · {agents.length} agents</h2>
      {FACETS.map((f) => {
        const rows = agents.filter((a) => a.facet === f.id);
        return (
          <div key={f.id} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--text-subtle)', margin: '0 4px 7px' }}>{f.name}</div>
            <div style={{ background: '#fff', border: '1px solid var(--border-default)', borderRadius: 14, overflow: 'hidden' }}>
              {rows.map((a, i) => (
                <div key={a.agent} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', borderTop: i ? '1px solid var(--border-hairline)' : 'none' }}>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontSize: 14, fontWeight: 600, textTransform: 'capitalize' }}>{a.agent}</span>
                    <span style={{ display: 'block', fontSize: 11.5, color: 'var(--text-subtle)' }}>{a.done} done · last {a.last_run}</span>
                  </span>
                  {a.needs_approval > 0 ? <Badge status="needs_approval">{a.needs_approval}</Badge> : <span style={{ fontSize: 12, color: 'var(--status-success-fg)' }}>✓</span>}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- App ---------------- */
function MobileApp() {
  const seed = window.MC_DATA;
  const [tab, setTab] = useMobState('queue');
  const [escalations, setEscalations] = useMobState(seed.ESCALATIONS);
  const [fleetEnabled, setFleetEnabled] = useMobState(true);
  const [toast, setToast] = useMobState(null);

  const flash = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2200); };
  const resolve = (id, approve) => { setEscalations((l) => l.filter((e) => e.id !== id)); flash(`${approve ? 'Approved' : 'Rejected'} #${id}`, approve); };
  const toggleFleet = () => setFleetEnabled((v) => { flash(`Fleet ${v ? 'disabled' : 'enabled'}`, !v); return !v; });

  const NAV = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'queue', label: 'Queue', icon: 'inbox', badge: escalations.length },
    { id: 'fleet', label: 'Fleet', icon: 'pulse' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--surface-console)', fontFamily: 'var(--font-sans)' }}>
      <TopBar fleetEnabled={fleetEnabled} />
      <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid var(--border-default)' }}>
        {tab === 'home' && <Home metrics={seed.METRICS} openEsc={escalations.length} fleetEnabled={fleetEnabled} onToggleFleet={toggleFleet} onGoQueue={() => setTab('queue')} />}
        {tab === 'queue' && <Queue escalations={escalations} onResolve={resolve} />}
        {tab === 'fleet' && <FleetList agents={seed.AGENTS} />}
      </div>

      {/* bottom tab bar */}
      <div style={{ display: 'flex', borderTop: '1px solid var(--border-default)', background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(12px)', paddingBottom: 22, paddingTop: 8 }}>
        {NAV.map((n) => {
          const on = tab === n.id;
          return (
            <button key={n.id} onClick={() => setTab(n.id)} style={{ flex: 1, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, position: 'relative', color: on ? 'var(--primary-600)' : 'var(--neutral-400)' }}>
              <Icon name={n.icon} size={23} />
              <span style={{ fontSize: 10.5, fontWeight: on ? 600 : 500 }}>{n.label}</span>
              {n.badge > 0 && <span style={{ position: 'absolute', top: -3, right: '50%', marginRight: -22, background: 'var(--accent-500)', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 999, minWidth: 17, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{n.badge}</span>}
            </button>
          );
        })}
      </div>

      {toast && (
        <div style={{ position: 'absolute', bottom: 96, left: '50%', transform: 'translateX(-50%)', zIndex: 80, background: toast.ok ? 'var(--status-success-fg)' : 'var(--status-error-fg)', color: '#fff', padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: 'var(--shadow-lg)', whiteSpace: 'nowrap' }}>{toast.msg}</div>
      )}
    </div>
  );
}

function Root() {
  const { IOSDevice } = window;
  const [scale, setScale] = useMobState(1);
  useMobEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerHeight - 40) / 874, (window.innerWidth - 40) / 402));
    fit(); window.addEventListener('resize', fit); return () => window.removeEventListener('resize', fit);
  }, []);
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--neutral-100)', padding: 20 }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
        <IOSDevice>
          <MobileApp />
        </IOSDevice>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
