/* Day-one operator — empty state + supply bootstrap.
   Strategy: scrape service providers first (easy-to-find SMBs with ad channels);
   once coverage exists, venue owners list more readily because the services
   they'd require from renters are already in place. */
const { useState: useLaunchState, useEffect: useLaunchEffect, useRef: useLaunchRef } = React;

const CATS = ['security', 'cleaning', 'catering', 'bartending', 'dj', 'photography', 'equipment', 'staff'];
const FACTOR = { security: 1.0, cleaning: 1.15, catering: 0.9, bartending: 0.8, dj: 0.72, photography: 0.95, equipment: 0.85, staff: 1.05 };

function ZeroKpi({ label, value, sub, accent }) {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: accent || 'var(--neutral-300)', lineHeight: 1.1, marginTop: 2 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: 'var(--text-subtle)', marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function PhaseCard({ n, active, done, title, body, points, accent }) {
  return (
    <div style={{ flex: 1, background: '#fff', border: `1px solid ${active ? accent : 'var(--border-default)'}`, borderTop: `3px solid ${accent}`, borderRadius: 'var(--radius-lg)', padding: 18, opacity: done ? 0.6 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 24, height: 24, borderRadius: '50%', background: accent, color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{done ? '✓' : n}</span>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h3>
        {active && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '.04em' }}>Active</span>}
      </div>
      <p style={{ margin: '0 0 10px', fontSize: 13.5, color: 'var(--neutral-600)', lineHeight: 1.5 }}>{body}</p>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {points.map((p) => <li key={p} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--neutral-700)' }}><span style={{ color: accent, fontWeight: 700 }}>›</span>{p}</li>)}
      </ul>
    </div>
  );
}

function LaunchApp() {
  const { Button, Badge, KpiCard } = window.VenuePlusDesignSystem_17f1a7;
  const [phase, setPhase] = useLaunchState('empty'); // empty | working
  const [city, setCity] = useLaunchState('Austin, TX');
  const [picked, setPicked] = useLaunchState(['security', 'cleaning', 'catering', 'bartending', 'dj']);
  const [p, setP] = useLaunchState(0); // 0..100 progress
  const timer = useLaunchRef(null);

  const launch = () => {
    if (!picked.length) return;
    setPhase('working'); setP(0); window.scrollTo(0, 0);
    timer.current = setInterval(() => setP((v) => { if (v >= 100) { clearInterval(timer.current); return 100; } return v + 2; }), 90);
  };
  useLaunchEffect(() => () => clearInterval(timer.current), []);

  const toggleCat = (c) => setPicked((l) => l.includes(c) ? l.filter((x) => x !== c) : [...l, c]);

  const found = Math.round(p * 1.18);
  const queued = Math.round(p * 0.62);
  const coverage = Math.min(92, Math.round(p * 0.92));
  const phase2 = coverage >= 60;

  if (phase === 'empty') {
    return (
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '28px 24px 64px' }}>
        {/* welcome */}
        <div style={{ background: 'var(--gradient-hero)', borderRadius: 'var(--radius-lg)', padding: '28px 28px', color: '#fff', marginBottom: 20 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--accent-200)' }}>Day 1 · Solo operator</span>
          <h1 style={{ margin: '8px 0 6px', fontSize: 30, fontWeight: 800, letterSpacing: '-.02em' }}>Let&rsquo;s bootstrap your marketplace</h1>
          <p style={{ margin: 0, fontSize: 16, color: 'var(--primary-50)', maxWidth: '60ch', lineHeight: 1.5 }}>
            No supply yet — that&rsquo;s expected. The fleet builds it for you, supply-first. You just approve the outreach.
          </p>
        </div>

        {/* zero KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          <ZeroKpi label="Service providers" value="0" sub="Build these first" />
          <ZeroKpi label="Active venues" value="0" sub="Phase 2" />
          <ZeroKpi label="Bookings" value="0" />
          <ZeroKpi label="GMV" value="$0" />
        </div>

        {/* strategy */}
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: 10 }}>The launch strategy</div>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 14, marginBottom: 26 }}>
          <PhaseCard n="1" active accent="var(--primary-500)" title="Build service coverage"
            body="Service providers — cleaners, security, food trucks, bartenders, insurance — are SMBs with public listings and ad channels. They&rsquo;re easy to find, so the fleet scrapes and recruits them first."
            points={['Discovery scrapes Places, Yelp & socials', 'Outreach pitches providers to join free', 'Coverage map fills, category by category']} />
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--neutral-300)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </div>
          <PhaseCard n="2" accent="var(--accent-500)" title="Venues follow"
            body="With services already in place, property owners list far more readily — everything a renter needs (security, cleaning, insurance) is ready on day one, so there&rsquo;s no friction to going live."
            points={['Venue owners pitched on ready-made services', 'Required services auto-attach to each listing', 'First bookings can be fully serviced immediately']} />
        </div>

        {/* launch panel */}
        <div style={{ background: '#fff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 22, boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700 }}>Launch the supply engine</h2>
          <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--text-muted)' }}>Pick a launch city and the provider categories to recruit first.</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <label style={{ flex: '1 1 220px' }}>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--neutral-700)', marginBottom: 6 }}>Launch city</span>
              <input value={city} onChange={(e) => setCity(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '11px 13px', fontSize: 14.5, fontFamily: 'var(--font-sans)', border: '1px solid var(--neutral-300)', borderRadius: 'var(--radius-md)', outline: 'none' }} />
            </label>
          </div>
          <div style={{ marginTop: 16 }}>
            <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--neutral-700)', marginBottom: 8 }}>Provider categories ({picked.length})</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CATS.map((c) => {
                const on = picked.includes(c);
                return (
                  <button key={c} onClick={() => toggleCat(c)} style={{ cursor: 'pointer', borderRadius: 'var(--radius-full)', border: `1px solid ${on ? 'var(--primary-500)' : 'var(--border-strong)'}`, background: on ? 'var(--primary-50)' : '#fff', padding: '4px 6px 4px 10px', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)' }}>
                    <span style={{ fontSize: 13, color: on ? 'var(--primary-700)' : 'var(--neutral-500)', textTransform: 'capitalize' }}>{c}</span>
                    <Badge category={c} />
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
            <Button variant="accent" size="lg" onClick={launch} disabled={!picked.length}>Launch supply engine →</Button>
            <span style={{ fontSize: 12.5, color: 'var(--text-subtle)' }}>Nothing sends until you approve it. Outreach drafts land in your queue.</span>
          </div>
        </div>
      </div>
    );
  }

  /* working */
  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '28px 24px 64px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: 'var(--status-success-fg)', background: 'var(--status-success-bg)', padding: '6px 12px', borderRadius: 999 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }} />Supply engine running · {city}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{p < 100 ? 'Scraping & recruiting providers…' : 'First wave complete.'}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
        <KpiCard label="Providers found" value={found} accent="var(--primary-600)" />
        <KpiCard label="Contacted / queued" value={queued} delta={`${queued} drafts in your queue`} deltaTone="neutral" />
        <KpiCard label="Service coverage" value={`${coverage}%`} accent={phase2 ? 'var(--status-success-fg)' : 'var(--status-pending-fg)'} />
        <KpiCard label="Active venues" value="0" delta={phase2 ? 'Phase 2 unlocked →' : `Unlocks at 60%`} deltaTone={phase2 ? 'up' : 'neutral'} />
      </div>

      {/* provider pipeline */}
      <div style={{ background: '#fff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 18, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>Provider pipeline</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[['Discovery', found], ['Enrichment', Math.round(found * 0.82)], ['Scoring', Math.round(found * 0.78)], ['Outreach', queued]].map(([label, n], i) => (
            <React.Fragment key={label}>
              {i > 0 && <span style={{ color: 'var(--neutral-300)' }}>›</span>}
              <div style={{ flex: 1, textAlign: 'center', background: 'var(--neutral-50)', borderRadius: 'var(--radius-md)', padding: '12px 6px' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary-600)' }}>{n}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* coverage by category */}
      <div style={{ background: '#fff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 18, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>Coverage by category — {city}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {picked.map((c) => {
            const pct = Math.min(100, Math.round(p * (FACTOR[c] || 0.9)));
            return (
              <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 110, flexShrink: 0 }}><Badge category={c} /></div>
                <div style={{ flex: 1, height: 8, background: 'var(--neutral-100)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: pct >= 60 ? 'var(--status-success-fg)' : 'var(--primary-500)', borderRadius: 999, transition: 'width 120ms linear' }} />
                </div>
                <span style={{ width: 38, textAlign: 'right', fontSize: 12.5, fontWeight: 600, color: pct >= 60 ? 'var(--status-success-fg)' : 'var(--neutral-600)' }}>{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* phase 2 */}
      <div style={{ background: phase2 ? 'var(--accent-50)' : 'var(--neutral-50)', border: `1px solid ${phase2 ? 'var(--accent-200)' : 'var(--border-default)'}`, borderRadius: 'var(--radius-lg)', padding: 18, display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ width: 30, height: 30, borderRadius: '50%', background: phase2 ? 'var(--accent-500)' : 'var(--neutral-300)', color: '#fff', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: phase2 ? 'var(--accent-700)' : 'var(--neutral-600)' }}>{phase2 ? 'Phase 2 unlocked — recruiting venues' : 'Phase 2 — venue recruitment'}</div>
          <div style={{ fontSize: 13, color: 'var(--neutral-600)', marginTop: 2 }}>
            {phase2
              ? 'Coverage is strong enough to pitch venue owners on a marketplace where services are already in place. Venue outreach drafts are starting to appear in your queue.'
              : `Reaches owners once coverage passes 60% (now ${coverage}%). They list more readily when the services they&rsquo;d require are ready.`}
          </div>
        </div>
      </div>

      <p style={{ margin: '18px 0 0', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
        <strong style={{ color: 'var(--neutral-700)' }}>{queued} outreach drafts</strong> are waiting in your approval queue. Approve to start signing providers.
      </p>
    </div>
  );
}

function Root() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-console)', fontFamily: 'var(--font-sans)' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid var(--border-default)', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="../../assets/venueplus-logo-mark.png" alt="VenuePlus" style={{ height: 34 }} />
        <div style={{ lineHeight: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>VenuePlus</div>
          <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--primary-600)' }}>Mission Control</div>
        </div>
      </header>
      <LaunchApp />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
