/* Agents: dispatch a goal in plain English; watch the fleet work. */
const { useState: useStateAgents } = React;

function Agents({ agents, fleetEnabled, onDispatch }) {
  const { Button, Card, Badge } = window.VenuePlusDesignSystem_17f1a7;
  const [goal, setGoal] = useStateAgents('');
  const [city, setCity] = useStateAgents('');
  const [result, setResult] = useStateAgents(null);

  const examples = [
    'Grow venue supply with cold email in Austin, TX',
    'Publish 5 SEO landing pages for Nashville rooftops',
    'Re-engage providers with no jobs in 30 days',
  ];

  const dispatch = () => {
    if (!goal.trim() || !fleetEnabled) return;
    const r = onDispatch(goal.trim(), city.trim());
    setResult(r);
    setGoal(''); setCity('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Run a goal */}
      <Card padding="md" style={{ border: '1px solid var(--border-default)', boxShadow: 'none' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>Run a goal</h2>
        <p style={{ margin: '0 0 12px', fontSize: 13.5, color: 'var(--text-muted)' }}>
          Describe an outcome. The planner fans it out across the fleet — high-risk actions land in your approval queue.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Grow venue supply with paid ads in Austin"
            style={inputStyle} />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City (optional)"
              style={{ ...inputStyle, maxWidth: 240 }} />
            <Button variant="primary" disabled={!goal.trim() || !fleetEnabled} onClick={dispatch}>
              {fleetEnabled ? 'Run goal' : 'Fleet disabled'}
            </Button>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {examples.map((ex) => (
              <button key={ex} onClick={() => setGoal(ex)} style={chipStyle}>{ex}</button>
            ))}
          </div>
        </div>
        {result && (
          <div style={{
            marginTop: 12, background: 'var(--status-success-bg)', border: '1px solid #bbf7d0',
            borderRadius: 'var(--radius-md)', padding: '10px 12px', fontSize: 13.5, color: 'var(--status-success-fg)',
          }}>
            <strong>Run #{result.id} dispatched</strong> · {result.escalations} escalation{result.escalations === 1 ? '' : 's'} opened.<br />
            {result.executed}/{result.total} actions auto-executed across {result.jobs} agents.
          </div>
        )}
      </Card>

      {/* Fleet — grouped by business facet */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 14px' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Fleet</h2>
          <Badge tone={fleetEnabled ? 'success' : 'error'} capitalize={false}>
            {agents.length} agents · {fleetEnabled ? 'live' : 'halted'}
          </Badge>
        </div>
        {(window.MC_DATA.FACETS || []).map((f) => {
          const rows = agents.filter((a) => a.facet === f.id);
          if (!rows.length) return null;
          return (
            <div key={f.id} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: 8 }}>{f.name}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {rows.map((a) => (
                  <Card key={a.agent} padding="md" style={{ border: '1px solid var(--border-default)', boxShadow: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, textTransform: 'capitalize' }}>{a.agent}</h3>
                        <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--text-muted)', maxWidth: '38ch' }}>{a.role}</p>
                      </div>
                      {a.needs_approval > 0 && <Badge status="needs_approval">{a.needs_approval} pending</Badge>}
                    </div>
                    <p style={{ margin: '10px 0 0', fontSize: 11.5, color: 'var(--text-subtle)' }}>Last run: {a.last_run}</p>
                    <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 13, fontWeight: 500 }}>
                      <span style={{ color: 'var(--status-success-fg)' }}>{a.done} done</span>
                      <span style={{ color: 'var(--status-pending-fg)' }}>{a.needs_approval} need approval</span>
                      <span style={{ color: a.blocked ? 'var(--status-error-fg)' : 'var(--text-subtle)' }}>{a.blocked} blocked</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '11px 14px', fontSize: 14,
  fontFamily: 'var(--font-sans)', color: 'var(--neutral-900)', background: '#fff',
  border: '1px solid var(--neutral-300)', borderRadius: 'var(--radius-md)', outline: 'none',
};
const chipStyle = {
  border: '1px solid var(--border-default)', background: 'var(--neutral-50)', cursor: 'pointer',
  borderRadius: 'var(--radius-full)', padding: '5px 12px', fontSize: 12, color: 'var(--neutral-600)',
  fontFamily: 'var(--font-sans)',
};

Object.assign(window, { Agents });
