/* Notifications — what pings the operator, and the delivery rules.
   Two phones: a lock screen with approval pings, and notification settings. */
const { useState: useNotifState } = React;

function AppIcon({ size = 26 }) {
  return <div style={{ width: size, height: size, borderRadius: size * 0.27, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.46, flexShrink: 0 }}>V+</div>;
}

const NOTIFS = [
  { id: 1, critical: true, when: 'now', title: 'Payout approval needed', body: '$9,420 across 24 payouts is ready to release. Reconciliation is clean.', tag: 'Money' },
  { id: 2, critical: true, when: '8m ago', title: 'Insurance expired', body: 'East Side Works\u2019 certificate lapsed. Suspend the listing until renewed?', tag: 'Legal' },
  { id: 3, critical: false, when: '9m ago', title: 'New listing ready to go live', body: 'The Cathedral Hall (Austin) passed all checks — review & publish.', tag: null },
  { id: 4, critical: false, when: '12m ago', title: '2 cold emails ready to send', body: 'Top-scoring outreach drafts for new Austin venue leads.', tag: null },
];

function LockScreen() {
  const [items, setItems] = useNotifState(NOTIFS);
  return (
    <div style={{ height: '100%', position: 'relative', background: 'linear-gradient(165deg, #0a2139 0%, #103156 45%, #5e240d 100%)', display: 'flex', flexDirection: 'column' }}>
      {/* clock */}
      <div style={{ textAlign: 'center', color: '#fff', marginTop: 58 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, opacity: 0.85, marginBottom: 4 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
          Monday, June 22
        </div>
        <div style={{ fontSize: 72, fontWeight: 300, lineHeight: 1, letterSpacing: '-.02em' }}>9:41</div>
      </div>

      {/* notification stack */}
      <div style={{ marginTop: 'auto', padding: '0 12px 16px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px 2px' }}>
          <span style={{ color: 'rgba(255,255,255,.85)', fontSize: 12.5, fontWeight: 600 }}>Notification Center</span>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 700, background: 'var(--accent-500)', borderRadius: 999, padding: '2px 9px' }}>{items.filter((n) => n.critical).length} need approval</span>
        </div>
        {items.map((n) => (
          <div key={n.id} onClick={() => setItems((l) => l.filter((x) => x.id !== n.id))} style={{
            background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: n.critical ? '1px solid rgba(255,105,70,0.5)' : '1px solid rgba(255,255,255,0.18)',
            borderRadius: 18, padding: 12, display: 'flex', gap: 10, cursor: 'pointer',
          }}>
            <AppIcon />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '.03em', flex: 1 }}>VenuePlus</span>
                {n.tag && <span style={{ fontSize: 9.5, fontWeight: 700, color: '#fff', background: n.tag === 'Money' ? 'var(--risk-money-fg)' : 'var(--risk-legal-fg)', borderRadius: 999, padding: '1px 7px' }}>{n.tag}</span>}
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>{n.when}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginTop: 2 }}>{n.title}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.82)', marginTop: 1, lineHeight: 1.35 }}>{n.body}</div>
            </div>
          </div>
        ))}
        {items.length === 0 && <div style={{ textAlign: 'center', color: 'rgba(255,255,255,.7)', fontSize: 13, padding: '20px 0' }}>All caught up ✓</div>}
      </div>
    </div>
  );
}

/* ---------------- Settings ---------------- */
const DELIVERY = [
  { id: 'critical', label: 'Money & legal', sub: 'Payouts, refunds, suspensions', value: 'push', locked: true, tone: 'var(--risk-money-fg)' },
  { id: 'financial', label: 'Financial', sub: 'Paid dispatches, credits', value: 'push', tone: 'var(--risk-financial-fg)' },
  { id: 'outbound', label: 'Outbound & customer-facing', sub: 'Emails, posts, listings, replies', value: 'push', tone: 'var(--risk-outbound-fg)' },
  { id: 'internal', label: 'Internal & read-only', sub: 'Drafts, scoring, scans', value: 'silent', tone: 'var(--neutral-500)' },
];
const OPTS = [['push', 'Push'], ['digest', 'Digest'], ['silent', 'Silent']];

function SettingsScreen() {
  const [rows, setRows] = useNotifState(DELIVERY);
  const [quiet, setQuiet] = useNotifState(true);
  const setVal = (id, v) => setRows((l) => l.map((r) => r.id === id ? { ...r, value: v } : r));

  return (
    <div style={{ height: '100%', background: 'var(--neutral-50)', overflowY: 'auto' }}>
      <div style={{ padding: '52px 18px 8px' }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Notifications</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--text-muted)' }}>Choose what reaches you, and when.</p>
      </div>

      <div style={{ padding: '14px 14px 8px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--text-subtle)', margin: '0 4px 8px' }}>Alert me by risk</div>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-default)', overflow: 'hidden' }}>
          {rows.map((r, i) => (
            <div key={r.id} style={{ padding: '12px 14px', borderTop: i ? '1px solid var(--border-hairline)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.tone, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--neutral-800)' }}>{r.label}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-subtle)' }}>{r.sub}</div>
                </div>
                {r.locked && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--risk-money-fg)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>CRITICAL</span>}
              </div>
              <div style={{ display: 'flex', background: 'var(--neutral-100)', borderRadius: 999, padding: 2 }}>
                {OPTS.map(([v, lbl]) => {
                  const on = r.value === v;
                  return (
                    <button key={v} disabled={r.locked} onClick={() => !r.locked && setVal(r.id, v)} style={{
                      flex: 1, border: 'none', cursor: r.locked ? 'default' : 'pointer', borderRadius: 999, padding: '6px 0',
                      fontSize: 12.5, fontWeight: 600, fontFamily: 'var(--font-sans)',
                      background: on ? '#fff' : 'transparent', color: on ? 'var(--primary-600)' : 'var(--text-muted)',
                      boxShadow: on ? 'var(--shadow-sm)' : 'none', opacity: r.locked && !on ? 0.4 : 1,
                    }}>{lbl}</button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--text-subtle)', margin: '18px 4px 8px' }}>Quiet hours</div>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-default)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 14px' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Quiet hours</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-subtle)' }}>10 PM – 7 AM · mute non-critical</div>
            </div>
            <button onClick={() => setQuiet((q) => !q)} style={{ width: 46, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer', background: quiet ? 'var(--primary-500)' : 'var(--neutral-300)', position: 'relative', transition: 'background 150ms' }}>
              <span style={{ position: 'absolute', top: 3, left: quiet ? 21 : 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'left 150ms', boxShadow: 'var(--shadow-sm)' }} />
            </button>
          </div>
          <div style={{ padding: '11px 14px', borderTop: '1px solid var(--border-hairline)', fontSize: 12.5, color: 'var(--neutral-600)', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ color: 'var(--risk-money-fg)' }}>⚠</span> Critical money & legal alerts always break through.
          </div>
        </div>
      </div>
      <div style={{ height: 40 }} />
    </div>
  );
}

function Phone({ label, dark, children }) {
  const { IOSDevice } = window;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, flex: 'none' }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{label}</span>
      <IOSDevice dark={dark}>{children}</IOSDevice>
    </div>
  );
}

function Root() {
  return (
    <div style={{ minWidth: '100%', minHeight: '100vh', boxSizing: 'border-box', padding: 40, background: 'var(--neutral-100)', display: 'flex', gap: 44, justifyContent: 'center', alignItems: 'flex-start', width: 'max-content' }}>
      <Phone label="Lock screen — approval pings" dark><LockScreen /></Phone>
      <Phone label="Notification settings"><SettingsScreen /></Phone>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
