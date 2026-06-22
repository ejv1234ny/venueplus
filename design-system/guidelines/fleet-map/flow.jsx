/* Fleet Map — how work flows across the 14-agent fleet and through the
   operator approval gate. Loads agent mandates from the Operations Manual data. */
const { useState: useFlowState, useEffect: useFlowEffect, useRef: useFlowRef } = React;
const { FACETS: MF, AGENTS: MA, A: MAUT } = window.MANUAL;

const AUT_C = {
  auto:     { bg: 'var(--decision-auto-bg)',     fg: 'var(--decision-auto-fg)' },
  draft:    { bg: 'var(--decision-approval-bg)', fg: 'var(--decision-approval-fg)' },
  gated:    { bg: 'var(--risk-financial-bg)',    fg: 'var(--risk-financial-fg)' },
  hardgate: { bg: 'var(--risk-money-bg)',        fg: 'var(--risk-money-fg)' },
};
const autKey = (k) => Object.keys(MAUT).find((x) => MAUT[x].kind === k);
const facet = (id) => MF.find((f) => f.id === id);
const agentsIn = (fid) => MA.filter((a) => a.facet === fid);

function Chevron() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', color: 'var(--neutral-300)', flexShrink: 0, padding: '0 2px' }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
    </div>
  );
}

function AgentChip({ a, onHover, dim }) {
  const f = facet(a.facet);
  const c = AUT_C[a.autonomy];
  return (
    <button
      onMouseEnter={() => onHover(a)} onMouseLeave={() => onHover(null)} onFocus={() => onHover(a)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left',
        border: '1px solid var(--border-default)', background: '#fff', cursor: 'default',
        borderRadius: 'var(--radius-md)', padding: '8px 10px', fontFamily: 'var(--font-sans)',
        opacity: dim ? 0.4 : 1, transition: 'opacity 150ms, box-shadow 150ms, transform 150ms',
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.fg, flexShrink: 0 }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--neutral-800)', textTransform: 'capitalize', flex: 1 }}>{a.name}</span>
    </button>
  );
}

function Lane({ fid, onHover, hovered }) {
  const f = facet(fid);
  return (
    <div style={{ flex: 1, minWidth: 0, background: '#fff', border: `1px solid var(--border-default)`, borderTop: `3px solid ${f.color}`, borderRadius: 'var(--radius-lg)', padding: 14, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: f.color }}>{f.name}</div>
      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: '2px 0 12px', minHeight: 30 }}>{f.blurb}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {agentsIn(fid).map((a) => (
          <AgentChip key={a.id} a={a} onHover={onHover} dim={hovered && hovered.id !== a.id && hovered.facet !== fid} />
        ))}
      </div>
    </div>
  );
}

function GateChip({ kind, label }) {
  const c = AUT_C[kind];
  return <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 11px', borderRadius: 'var(--radius-full)', background: c.bg, color: c.fg }}>{label}</span>;
}

function FlowApp() {
  const [hovered, setHovered] = useFlowState(null);
  const wrapRef = useFlowRef(null);
  const [scale, setScale] = useFlowState(1);
  useFlowEffect(() => {
    const fit = () => { const w = window.innerWidth - 40; setScale(Math.min(1, w / 1060)); };
    fit(); window.addEventListener('resize', fit); return () => window.removeEventListener('resize', fit);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-console)' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid var(--border-default)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <img src="../../assets/venueplus-logo-mark.png" alt="VenuePlus" style={{ height: 40 }} />
        <div>
          <h1 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: 'var(--neutral-900)' }}>Fleet Map</h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>How a goal flows across the fleet — and everything consequential passes through you.</p>
        </div>
      </header>

      <div style={{ padding: 20, display: 'flex', justifyContent: 'center' }}>
        <div ref={wrapRef} style={{ width: 1060, transform: `scale(${scale})`, transformOrigin: 'top center' }}>

          {/* Demand feeder */}
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 16, marginBottom: 14 }}>
            <div style={{ flex: '0 0 320px' }}>
              <Lane fid="demand-growth" onHover={setHovered} hovered={hovered} />
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-subtle)', fontSize: 12.5, fontStyle: 'italic' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 600, color: 'var(--accent-600)', fontStyle: 'normal' }}>Renters discover &amp; book ↓</div>
                <div>SEO pages, social, and lifecycle campaigns drive demand into the marketplace.</div>
              </div>
            </div>
          </div>

          {/* Value chain */}
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 4 }}>
            <Lane fid="supply-growth" onHover={setHovered} hovered={hovered} />
            <Chevron />
            <Lane fid="onboarding-net" onHover={setHovered} hovered={hovered} />
            <Chevron />
            <Lane fid="operations" onHover={setHovered} hovered={hovered} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: 11, color: 'var(--text-subtle)', margin: '8px 0 0', fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' }}>
            <span>1 · Acquire supply</span><span>2 · Activate &amp; make serviceable</span><span>3 · Transact &amp; operate</span>
          </div>

          {/* Customer & Platform span */}
          <div style={{ marginTop: 14, background: '#fff', border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-lg)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: facet('customer-plat').color, whiteSpace: 'nowrap' }}>Customer &amp; Platform<br /><span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: 11 }}>spans everything</span></div>
            <div style={{ display: 'flex', gap: 8, flex: 1 }}>
              {agentsIn('customer-plat').map((a) => (
                <div key={a.id} style={{ flex: 1 }}><AgentChip a={a} onHover={setHovered} dim={hovered && hovered.id !== a.id && hovered.facet !== 'customer-plat'} /></div>
              ))}
            </div>
          </div>

          {/* Operator approval gate */}
          <div style={{ position: 'relative', margin: '22px 0 0' }}>
            <div style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', color: 'var(--neutral-300)' }}>
              <svg width="22" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
            <div style={{ background: 'var(--neutral-900)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', color: '#fff', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src="../../assets/venueplus-logo-mark.png" alt="" style={{ height: 30, filter: 'drop-shadow(0 0 0 #fff)' }} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>Operator approval gate</div>
                  <div style={{ fontSize: 12, color: 'var(--neutral-400)' }}>You — 1 of 1. Agents draft; you decide.</div>
                </div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <GateChip kind="auto" label="Auto · read & internal" />
                <GateChip kind="draft" label="Approve · outbound / customer-facing" />
                <GateChip kind="gated" label="Approve · financial" />
                <GateChip kind="hardgate" label="Hard gate · money & legal" />
              </div>
            </div>
          </div>

          {/* Outside world */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6, color: 'var(--neutral-300)' }}>
            <svg width="22" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            {['Customers emailed', 'Money moved', 'Content published', 'Providers dispatched'].map((t) => (
              <div key={t} style={{ background: '#fff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '9px 16px', fontSize: 13, fontWeight: 600, color: 'var(--neutral-700)' }}>{t}</div>
            ))}
          </div>

          {/* Hover info strip */}
          <div style={{ marginTop: 18, minHeight: 54, background: hovered ? '#fff' : 'transparent', border: hovered ? '1px solid var(--border-default)' : '1px dashed var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
            {hovered ? (
              <React.Fragment>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--neutral-900)', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{hovered.name}</span>
                <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 'var(--radius-full)', background: AUT_C[hovered.autonomy].bg, color: AUT_C[hovered.autonomy].fg, whiteSpace: 'nowrap' }}>{MAUT[autKey(hovered.autonomy)].label}</span>
                <span style={{ fontSize: 13.5, color: 'var(--neutral-600)' }}>{hovered.mandate}</span>
              </React.Fragment>
            ) : (
              <span style={{ fontSize: 13, color: 'var(--text-subtle)' }}>Hover any agent to see its mandate and autonomy level. Full specs live in the Agent Operations Manual.</span>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<FlowApp />);
