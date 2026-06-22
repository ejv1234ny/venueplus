/* Agent Operations Manual — interactive two-pane reference. */
const { useState: useManualState } = React;
const { FACETS, AGENTS, A } = window.MANUAL;

const AUT_COLORS = {
  auto:     { bg: 'var(--decision-auto-bg)',     fg: 'var(--decision-auto-fg)' },
  draft:    { bg: 'var(--decision-approval-bg)', fg: 'var(--decision-approval-fg)' },
  gated:    { bg: 'var(--risk-financial-bg)',    fg: 'var(--risk-financial-fg)' },
  hardgate: { bg: 'var(--risk-money-bg)',        fg: 'var(--risk-money-fg)' },
};
const facetOf = (id) => FACETS.find((f) => f.id === id);

function AutBadge({ kind, children }) {
  const c = AUT_COLORS[kind];
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 'var(--radius-full)', background: c.bg, color: c.fg, whiteSpace: 'nowrap' }}>{children || A[kindToKey(kind)].label}</span>;
}
function kindToKey(kind) { return Object.keys(A).find((k) => A[k].kind === kind); }

function Chip({ children, color }) {
  return <span style={{ fontSize: 12.5, padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'var(--neutral-100)', color: color || 'var(--neutral-700)', fontWeight: 500 }}>{children}</span>;
}

function ListRow({ agent, active, onClick }) {
  const f = facetOf(agent.facet);
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
      border: 'none', cursor: 'pointer', padding: '10px 12px', borderRadius: 'var(--radius-md)',
      background: active ? 'var(--primary-50)' : 'transparent', fontFamily: 'var(--font-sans)',
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: f.color, flexShrink: 0 }} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: active ? 'var(--primary-700)' : 'var(--neutral-800)' }}>{agent.name}</span>
        <span style={{ display: 'block', fontSize: 11.5, color: 'var(--text-subtle)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.id}</span>
      </span>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: AUT_COLORS[agent.autonomy].fg, flexShrink: 0 }} title={A[kindToKey(agent.autonomy)].label} />
    </button>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 22 }}>
      <h3 style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-subtle)' }}>{title}</h3>
      {children}
    </div>
  );
}

function Bullets({ items, warn }) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((t, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14, lineHeight: 1.5, color: 'var(--neutral-700)' }}>
          <span style={{ color: warn ? 'var(--status-pending-fg)' : 'var(--primary-500)', flexShrink: 0, fontWeight: 700, marginTop: 1 }}>{warn ? '▸' : '•'}</span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

function Detail({ agent }) {
  const f = facetOf(agent.facet);
  const aut = A[kindToKey(agent.autonomy)];
  return (
    <div style={{ padding: '28px 32px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--radius-full)', background: f.soft, color: f.color }}>{f.name}</span>
        <AutBadge kind={agent.autonomy} />
        <code style={{ fontSize: 12, color: 'var(--text-subtle)', fontFamily: 'ui-monospace, monospace' }}>agent: {agent.id}</code>
      </div>
      <h2 style={{ margin: '14px 0 6px', fontSize: 28, fontWeight: 800, letterSpacing: '-.02em', color: 'var(--neutral-900)' }}>{agent.name}</h2>
      <p style={{ margin: 0, fontSize: 17, lineHeight: 1.5, color: 'var(--neutral-600)', maxWidth: '54ch' }}>{agent.mandate}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
        <Section title="Core responsibilities"><Bullets items={agent.responsibilities} /></Section>
        <Section title="Day-to-day tasks"><Bullets items={agent.tasks} /></Section>
      </div>

      <Section title="Tools & integrations">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {agent.tools.map((t) => <Chip key={t}>{t}</Chip>)}
        </div>
      </Section>

      <Section title="Autonomy — what it does alone vs. needs you">
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: AUT_COLORS[agent.autonomy].bg, border: `1px solid ${AUT_COLORS[agent.autonomy].fg}22`, borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
          <AutBadge kind={agent.autonomy} />
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: 'var(--neutral-700)' }}>{agent.autonomyNote}</p>
        </div>
      </Section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
        <Section title="Escalation triggers → you"><Bullets items={agent.escalations} warn /></Section>
        <Section title="Success metrics (KPIs)">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {agent.kpis.map((k) => (
              <span key={k} style={{ fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 'var(--radius-md)', background: 'var(--primary-50)', color: 'var(--primary-700)' }}>{k}</span>
            ))}
          </div>
          <div style={{ marginTop: 18 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-subtle)' }}>Handoffs</h3>
            <code style={{ fontSize: 13, color: 'var(--neutral-600)', fontFamily: 'ui-monospace, monospace' }}>{agent.handoffs}</code>
          </div>
        </Section>
      </div>
    </div>
  );
}

function ManualApp() {
  const [filter, setFilter] = useManualState('all');
  const [sel, setSel] = useManualState(AGENTS[0].id);
  const shown = filter === 'all' ? AGENTS : AGENTS.filter((a) => a.facet === filter);
  const selected = AGENTS.find((a) => a.id === sel);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface-console)' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid var(--border-default)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <img src="../../assets/venueplus-logo-mark.png" alt="VenuePlus" style={{ height: 40 }} />
        <div>
          <h1 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: 'var(--neutral-900)' }}>Agent Operations Manual</h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>How the VenuePlus fleet runs the business — one operator, {AGENTS.length} agents.</p>
        </div>
      </header>

      {/* Philosophy banner */}
      <div style={{ background: 'var(--alert-bg)', borderBottom: '1px solid var(--alert-border)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13.5, color: 'var(--alert-fg)', fontWeight: 500 }}>
          <strong>Balanced autonomy.</strong> Agents draft everything; you approve anything outbound, customer-facing, financial, or legal.
        </span>
        <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginLeft: 'auto' }}>
          <AutBadge kind="auto" /><AutBadge kind="draft" /><AutBadge kind="gated" /><AutBadge kind="hardgate" />
        </span>
      </div>

      {/* Two-pane */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '300px 1fr', minHeight: 0 }}>
        {/* Left rail */}
        <aside style={{ borderRight: '1px solid var(--border-default)', background: '#fff', overflowY: 'auto', padding: 14 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            <FacetChip id="all" label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
            {FACETS.map((f) => <FacetChip key={f.id} id={f.id} label={f.name} color={f.color} active={filter === f.id} onClick={() => setFilter(f.id)} />)}
          </div>
          {(filter === 'all' ? FACETS : FACETS.filter((f) => f.id === filter)).map((f) => {
            const rows = shown.filter((a) => a.facet === f.id);
            if (!rows.length) return null;
            return (
              <div key={f.id} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: f.color, padding: '4px 12px' }}>{f.name}</div>
                {rows.map((a) => <ListRow key={a.id} agent={a} active={a.id === sel} onClick={() => setSel(a.id)} />)}
              </div>
            );
          })}
        </aside>

        {/* Detail */}
        <main style={{ overflowY: 'auto', background: '#fff' }}>
          {selected && <Detail agent={selected} />}
        </main>
      </div>
    </div>
  );
}

function FacetChip({ label, color, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      border: `1px solid ${active ? (color || 'var(--primary-500)') : 'var(--border-default)'}`,
      background: active ? (color || 'var(--primary-500)') : '#fff', color: active ? '#fff' : 'var(--neutral-600)',
      cursor: 'pointer', borderRadius: 'var(--radius-full)', padding: '4px 11px', fontSize: 12, fontWeight: 500,
      fontFamily: 'var(--font-sans)',
    }}>{label}</button>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<ManualApp />);
