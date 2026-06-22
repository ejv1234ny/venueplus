/* Settings — per-agent autonomy controls. Operator decides, per action,
   what runs automatically vs. lands in the approval queue. Money & legal
   actions are permanently hard-gated. Persists to localStorage. */
const { useState: useSetState, useEffect: useSetEffect } = React;

const STORE_KEY = 'vp_agent_settings_v1';
const POL_COLOR = {
  auto:     { bg: 'var(--decision-auto-bg)',     fg: 'var(--decision-auto-fg)',     label: 'Auto' },
  approval: { bg: 'var(--decision-approval-bg)', fg: 'var(--decision-approval-fg)', label: 'Approval' },
  off:      { bg: 'var(--neutral-200)',          fg: 'var(--neutral-600)',          label: 'Off' },
};

// preset → policy by risk tier
const PRESETS = {
  conservative: { read: 'auto', internal_write: 'approval', outbound: 'approval', financial: 'approval' },
  balanced:     { read: 'auto', internal_write: 'auto',     outbound: 'approval', financial: 'approval' },
  maxauto:      { read: 'auto', internal_write: 'auto',     outbound: 'auto',     financial: 'auto' },
};

function defaultState() {
  const POL = window.MC_DATA.POLICIES;
  const s = {};
  Object.keys(POL).forEach((id) => {
    s[id] = { gates: {}, thresholds: {} };
    POL[id].gates.forEach((g) => { s[id].gates[g.id] = g.policy; });
    POL[id].thresholds.forEach((t) => { s[id].thresholds[t.id] = t.value; });
  });
  return s;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return defaultState();
    const saved = JSON.parse(raw);
    const base = defaultState();
    Object.keys(base).forEach((id) => {
      if (saved[id]) {
        Object.assign(base[id].gates, saved[id].gates || {});
        Object.assign(base[id].thresholds, saved[id].thresholds || {});
      }
    });
    return base;
  } catch (e) { return defaultState(); }
}

function Seg({ value, locked, onChange }) {
  if (locked) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 'var(--radius-full)', background: 'var(--risk-money-bg)', color: 'var(--risk-money-fg)', whiteSpace: 'nowrap' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
        Approval · locked
      </span>
    );
  }
  return (
    <div style={{ display: 'inline-flex', background: 'var(--neutral-100)', borderRadius: 'var(--radius-full)', padding: 2 }}>
      {['auto', 'approval', 'off'].map((p) => {
        const on = value === p;
        const c = POL_COLOR[p];
        return (
          <button key={p} onClick={() => onChange(p)} style={{
            border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-full)', padding: '5px 12px',
            fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-sans)',
            background: on ? c.bg : 'transparent', color: on ? c.fg : 'var(--text-muted)',
          }}>{c.label}</button>
        );
      })}
    </div>
  );
}

function Settings({ onFlash }) {
  const { Badge, Card } = window.VenuePlusDesignSystem_17f1a7;
  const POL = window.MC_DATA.POLICIES;
  const FACETS = window.MC_DATA.FACETS;
  const AGENTS = window.MC_DATA.AGENTS;
  const [state, setState] = useSetState(loadState);

  useSetEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }, [state]);

  const setGate = (aid, gid, policy) => {
    setState((s) => ({ ...s, [aid]: { ...s[aid], gates: { ...s[aid].gates, [gid]: policy } } }));
  };
  const setThreshold = (aid, tid, value) => {
    setState((s) => ({ ...s, [aid]: { ...s[aid], thresholds: { ...s[aid].thresholds, [tid]: value } } }));
  };

  const applyPreset = (preset) => {
    const map = PRESETS[preset];
    setState((s) => {
      const next = { ...s };
      Object.keys(POL).forEach((aid) => {
        const gates = { ...next[aid].gates };
        POL[aid].gates.forEach((g) => {
          if (g.locked) return;
          if (g.id === 'faq_auto') { gates[g.id] = preset === 'maxauto' ? 'auto' : 'off'; return; }
          gates[g.id] = map[g.risk] || gates[g.id];
        });
        next[aid] = { ...next[aid], gates };
      });
      return next;
    });
    onFlash(`Applied "${preset === 'maxauto' ? 'Max autonomy' : preset[0].toUpperCase() + preset.slice(1)}" preset. Money & legal stay hard-gated.`);
  };

  // fleet-wide tallies
  let nAuto = 0, nApproval = 0, nOff = 0, nLocked = 0;
  Object.keys(POL).forEach((aid) => POL[aid].gates.forEach((g) => {
    if (g.locked) { nLocked++; return; }
    const p = state[aid].gates[g.id];
    if (p === 'auto') nAuto++; else if (p === 'approval') nApproval++; else nOff++;
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Agent settings</h2>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>
          Decide, per action, what each agent does on its own vs. what waits for you. Changes save automatically.
        </p>
      </div>

      {/* Presets + tallies */}
      <Card padding="md" style={{ border: '1px solid var(--border-default)', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 8 }}>Autonomy preset</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['conservative', 'Conservative'], ['balanced', 'Balanced'], ['maxauto', 'Max autonomy']].map(([id, label]) => (
              <button key={id} onClick={() => applyPreset(id)} style={{
                border: '1px solid var(--border-strong)', background: '#fff', cursor: 'pointer',
                borderRadius: 'var(--radius-md)', padding: '8px 14px', fontSize: 13, fontWeight: 600,
                color: 'var(--neutral-700)', fontFamily: 'var(--font-sans)',
              }}>{label}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 18, fontSize: 13 }}>
          <Tally n={nAuto} label="Auto" color="var(--decision-auto-fg)" />
          <Tally n={nApproval} label="Need approval" color="var(--decision-approval-fg)" />
          <Tally n={nOff} label="Off" color="var(--neutral-500)" />
          <Tally n={nLocked} label="Hard-gated" color="var(--risk-money-fg)" />
        </div>
      </Card>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--alert-bg)', border: '1px solid var(--alert-border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 13, color: 'var(--alert-fg)' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
        Money movement and legal actions are permanently hard-gated — they always require your explicit approval and can&apos;t be automated.
      </div>

      {/* Agent cards grouped by facet */}
      {FACETS.map((f) => {
        const rows = AGENTS.filter((a) => a.facet === f.id);
        if (!rows.length) return null;
        return (
          <div key={f.id}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--text-subtle)', margin: '4px 0 8px' }}>{f.name}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {rows.map((a) => {
                const cfg = POL[a.agent]; if (!cfg) return null;
                return (
                  <Card key={a.agent} padding="md" style={{ border: '1px solid var(--border-default)', boxShadow: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
                      <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 700, textTransform: 'capitalize' }}>{a.agent}</h3>
                      <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{a.role}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {cfg.gates.map((g) => (
                        <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: '1px solid var(--border-hairline)' }}>
                          <span style={{ flex: 1, fontSize: 13.5, color: 'var(--neutral-700)' }}>{g.label}</span>
                          <Badge risk={g.risk} />
                          <Seg value={state[a.agent].gates[g.id]} locked={g.locked} onChange={(p) => setGate(a.agent, g.id, p)} />
                        </div>
                      ))}
                      {cfg.thresholds.map((t) => (
                        <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: '1px solid var(--border-hairline)' }}>
                          <span style={{ flex: 1, fontSize: 13.5, color: 'var(--neutral-700)' }}>{t.label}</span>
                          <input type="range" min={t.min} max={t.max} step={t.step}
                            value={state[a.agent].thresholds[t.id]}
                            onChange={(e) => setThreshold(a.agent, t.id, Number(e.target.value))}
                            style={{ width: 180, accentColor: 'var(--primary-500)' }} />
                          <span style={{ minWidth: 56, textAlign: 'right', fontSize: 14, fontWeight: 700, color: 'var(--primary-600)' }}>
                            {t.unit === '$' ? '$' : ''}{state[a.agent].thresholds[t.id]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Tally({ n, label, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
    </div>
  );
}

Object.assign(window, { Settings });
