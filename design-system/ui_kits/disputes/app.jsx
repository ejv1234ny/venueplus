/* Disputes & Resolutions — case queue, resolution detail, and policy reference. */
const { useState: useDispState } = React;
const D = window.DISPUTES;
const money = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const SEV = {
  high: { bg: 'var(--status-error-bg)', fg: 'var(--status-error-fg)' },
  medium: { bg: 'var(--status-pending-bg)', fg: 'var(--status-pending-fg)' },
  low: { bg: 'var(--neutral-100)', fg: 'var(--neutral-600)' },
};
const policyById = (id) => D.POLICIES.find((p) => p.id === id);

function CaseRow({ c, active, resolved, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer',
      border: 'none', borderLeft: `3px solid ${active ? 'var(--primary-500)' : 'transparent'}`,
      background: active ? 'var(--primary-50)' : 'transparent', padding: '12px 14px', fontFamily: 'var(--font-sans)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: SEV[c.severity].bg, color: SEV[c.severity].fg, textTransform: 'capitalize' }}>{c.severity}</span>
        <span style={{ fontSize: 11.5, color: 'var(--text-subtle)' }}>#{c.id}</span>
        {resolved && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: 'var(--status-success-fg)' }}>✓ Resolved</span>}
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: active ? 'var(--primary-700)' : 'var(--neutral-800)' }}>{c.label}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.venue} · {c.event}</div>
    </button>
  );
}

function PartyChips({ c }) {
  const items = [['Renter', c.renter], ['Host', c.host], c.provider && ['Provider', c.provider]].filter(Boolean);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {items.map(([role, name]) => (
        <span key={role} style={{ fontSize: 12.5, background: 'var(--neutral-50)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '5px 10px' }}>
          <span style={{ color: 'var(--text-subtle)' }}>{role}: </span><span style={{ fontWeight: 600 }}>{name}</span>
        </span>
      ))}
    </div>
  );
}

function CaseDetail({ c, resolved, onResolve }) {
  const { Badge, Button } = window.VenuePlusDesignSystem_17f1a7;
  const pol = policyById(c.policyId);
  return (
    <div style={{ padding: '22px 26px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: SEV[c.severity].bg, color: SEV[c.severity].fg, textTransform: 'capitalize' }}>{c.severity} severity</span>
        <span style={{ fontSize: 12.5, color: 'var(--text-subtle)' }}>{c.label} · case #{c.id}</span>
        {c.cat && <Badge category={c.cat} />}
      </div>
      <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800 }}>{c.title}</h2>
      <p style={{ margin: '0 0 14px', fontSize: 14.5, color: 'var(--neutral-600)', lineHeight: 1.5 }}>{c.reason}</p>
      <PartyChips c={c} />

      <div style={{ display: 'flex', gap: 14, margin: '16px 0', flexWrap: 'wrap' }}>
        <Stat label="In escrow" value={money(c.escrow)} accent="var(--run-running-fg)" />
        <Stat label="Event" value={c.event} />
        <Stat label="Venue" value={c.venue} />
      </div>

      {/* timeline */}
      <Section title="What happened">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {c.timeline.map(([t, ev], i) => (
            <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--primary-400)', marginTop: 4 }} />
                {i < c.timeline.length - 1 && <span style={{ flex: 1, width: 2, background: 'var(--border-default)' }} />}
              </div>
              <div style={{ marginTop: -2 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{t}</span>
                <div style={{ fontSize: 13.5, color: 'var(--neutral-700)' }}>{ev}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* policy */}
      <Section title="Applicable policy">
        <div style={{ background: 'var(--neutral-50)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: pol.tone }} />
            <span style={{ fontSize: 14, fontWeight: 700 }}>{pol.title}</span>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: pol.tone, marginLeft: 'auto' }}>{pol.fault}</span>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: 'var(--neutral-700)', lineHeight: 1.5 }}>{pol.rule}</p>
        </div>
      </Section>

      {/* recommended resolution */}
      <Section title="Recommended resolution" badge={<span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-700)', background: 'var(--primary-50)', borderRadius: 999, padding: '2px 9px' }}>✦ Bookings agent</span>}>
        <p style={{ margin: '0 0 10px', fontSize: 14, color: 'var(--neutral-700)', lineHeight: 1.5 }}>{c.recommendation.summary}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {c.recommendation.actions.map(([label, risk, amt], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '9px 12px' }}>
              <span style={{ flex: 1, fontSize: 13.5, color: 'var(--neutral-700)' }}>{label}</span>
              {amt != null && <span style={{ fontSize: 13.5, fontWeight: 700 }}>{money(amt)}</span>}
              <Badge risk={risk} />
            </div>
          ))}
        </div>
        {c.recommendation.actions.some(([, r]) => r === 'money_movement' || r === 'legal') && (
          <p style={{ margin: '8px 0 0', fontSize: 12, fontWeight: 600, color: 'var(--status-error-fg)' }}>⚠ Includes hard-gated money/legal actions — your explicit approval moves the funds.</p>
        )}
      </Section>

      {/* alternatives */}
      <Section title="Alternative options">
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
          {c.alternatives.map((a) => (
            <li key={a} style={{ display: 'flex', gap: 9, fontSize: 13.5, color: 'var(--neutral-700)' }}><span style={{ color: 'var(--accent-500)', fontWeight: 700 }}>↳</span>{a}</li>
          ))}
        </ul>
      </Section>

      {/* resolve */}
      <div style={{ display: 'flex', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-hairline)' }}>
        {resolved ? (
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--status-success-fg)' }}>✓ Resolved — recommended resolution applied.</span>
        ) : (
          <React.Fragment>
            <Button variant="primary" onClick={() => onResolve(c.id, 'recommended')}>Approve recommended</Button>
            <Button variant="outline" onClick={() => onResolve(c.id, 'alt')}>Choose alternative</Button>
            <Button variant="ghost" onClick={() => onResolve(c.id, 'deny')}>Deny dispute</Button>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '.03em' }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: accent || 'var(--neutral-900)', marginTop: 2 }}>{value}</div>
    </div>
  );
}
function Section({ title, badge, children }) {
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
        <h3 style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--text-subtle)' }}>{title}</h3>
        {badge}
      </div>
      {children}
    </div>
  );
}

function Policies() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      {D.POLICIES.map((p) => (
        <div key={p.id} style={{ background: '#fff', border: '1px solid var(--border-default)', borderTop: `3px solid ${p.tone}`, borderRadius: 'var(--radius-lg)', padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{p.title}</h3>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: p.tone, whiteSpace: 'nowrap' }}>{p.fault}</span>
          </div>
          <p style={{ margin: '0 0 12px', fontSize: 13.5, color: 'var(--neutral-700)', lineHeight: 1.5, fontWeight: 500 }}>{p.rule}</p>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: 7 }}>Procedure</div>
          <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {p.procedure.map((s) => <li key={s} style={{ fontSize: 13, color: 'var(--neutral-700)', lineHeight: 1.45 }}>{s}</li>)}
          </ol>
        </div>
      ))}
    </div>
  );
}

function App() {
  const [tab, setTab] = useDispState('cases');
  const [sel, setSel] = useDispState(D.CASES[0].id);
  const [resolved, setResolved] = useDispState({});
  const [toast, setToast] = useDispState(null);
  const selected = D.CASES.find((c) => c.id === sel);

  const resolve = (id, mode) => {
    setResolved((r) => ({ ...r, [id]: mode }));
    setToast(mode === 'deny' ? `Dispute #${id} denied.` : `Dispute #${id} resolved.`);
    setTimeout(() => setToast(null), 2400);
  };
  const openCount = D.CASES.filter((c) => !resolved[c.id]).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-console)', fontFamily: 'var(--font-sans)' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid var(--border-default)', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="../../assets/venueplus-logo-mark.png" alt="VenuePlus" style={{ height: 34 }} />
        <div style={{ fontSize: 16, fontWeight: 700 }}>Disputes &amp; Resolutions</div>
        <div style={{ marginLeft: 'auto', display: 'flex', background: 'var(--neutral-100)', borderRadius: 999, padding: 3 }}>
          {[['cases', `Open cases · ${openCount}`], ['policies', 'Policies']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ border: 'none', cursor: 'pointer', borderRadius: 999, padding: '7px 16px', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-sans)', background: tab === id ? 'var(--primary-500)' : 'transparent', color: tab === id ? '#fff' : 'var(--text-muted)' }}>{label}</button>
          ))}
        </div>
      </header>

      {tab === 'cases' ? (
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: 20, display: 'grid', gridTemplateColumns: '270px 1fr', gap: 16, alignItems: 'start' }}>
          <aside style={{ background: '#fff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {D.CASES.map((c) => <CaseRow key={c.id} c={c} active={c.id === sel} resolved={!!resolved[c.id]} onClick={() => setSel(c.id)} />)}
          </aside>
          <main style={{ background: '#fff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)' }}>
            {selected && <CaseDetail c={selected} resolved={!!resolved[selected.id]} onResolve={resolve} />}
          </main>
        </div>
      ) : (
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: 20 }}>
          <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--text-muted)' }}>The standing rules the Bookings agent applies before anything reaches your queue. Money movement always requires your approval.</p>
          <Policies />
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 50, background: 'var(--status-success-fg)', color: '#fff', padding: '10px 18px', borderRadius: 'var(--radius-md)', fontSize: 13.5, fontWeight: 500, boxShadow: 'var(--shadow-lg)' }}>{toast}</div>
      )}
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
