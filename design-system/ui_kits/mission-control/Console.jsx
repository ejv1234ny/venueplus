/* Mission Control — interactive app shell wiring the screens together. */
const { useState: useAppState } = React;

function App() {
  const seed = window.MC_DATA;
  const [tab, setTab] = useAppState('overview');
  const [fleetEnabled, setFleetEnabled] = useAppState(true);
  const [escalations, setEscalations] = useAppState(seed.ESCALATIONS);
  const [runs, setRuns] = useAppState(seed.RUNS);
  const [openRunId, setOpenRunId] = useAppState(null);
  const [toast, setToast] = useAppState(null);
  const operator = { name: 'Avery Stone' };

  const flash = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2600); };

  const toggleFleet = () => {
    setFleetEnabled((v) => { flash(`Fleet ${v ? 'disabled — new runs halted' : 'enabled'}.`, !v ? true : false); return !v; });
  };

  const resolve = (id, approve) => {
    setEscalations((list) => list.filter((e) => e.id !== id));
    flash(`${approve ? 'Approved' : 'Rejected'} escalation #${id}.`, approve);
  };

  const dispatchGoal = (goal, city) => {
    const id = 312 + runs.length;
    const newRun = {
      id, goal: city ? `${goal} (${city})` : goal, status: 'needs_approval',
      executed: 5, total: 6, pending: 1, when: 'just now',
      jobs: [{ agent: 'discovery', status: 'done', blockers: [], actions: [
        { tool: 'search_places', risk: 'read', decision: 'auto', executed: true, reason: 'Found new candidate leads.' },
        { tool: 'send_outreach_email', risk: 'outbound', decision: 'require_approval', executed: false, reason: 'Top draft held for operator review.' },
      ] }],
    };
    setRuns((r) => [newRun, ...r]);
    setEscalations((list) => [{
      id: 100 + id, tool: 'send_outreach_email', risk: 'outbound', agent: 'discovery', run_id: id,
      run_goal: newRun.goal, reason: 'New cold outreach draft awaiting your approval.', created_at: 'just now',
      args: { template: 'venue_cold_v3' },
    }, ...list]);
    flash(`Run #${id} dispatched.`);
    return { id, escalations: 1, executed: 5, total: 6, jobs: 1 };
  };

  const openRun = (rid) => { setOpenRunId(rid); setTab('runs'); };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'agents', label: 'Agents' },
    { id: 'runs', label: 'Runs' },
    { id: 'escalations', label: 'Escalations' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-console)' }}>
      <ConsoleHeader operator={operator} />
      <Nav tabs={tabs} active={tab} onChange={(t) => { setTab(t); if (t !== 'runs') setOpenRunId(null); }}
        badges={{ escalations: escalations.length }} />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 64px' }}>
        {tab === 'overview' && (
          <Overview metrics={seed.METRICS} openEsc={escalations.length} fleetEnabled={fleetEnabled}
            onToggleFleet={toggleFleet} onGoEscalations={() => setTab('escalations')} />
        )}
        {tab === 'agents' && <Agents agents={seed.AGENTS} fleetEnabled={fleetEnabled} onDispatch={dispatchGoal} />}
        {tab === 'runs' && <Runs runs={runs} openRunId={openRunId} onOpenRun={setOpenRunId} onBack={() => setOpenRunId(null)} />}
        {tab === 'escalations' && <Escalations escalations={escalations} onResolve={resolve} onOpenRun={openRun} />}
        {tab === 'settings' && <Settings onFlash={flash} />}
      </main>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 50,
          background: toast.ok ? 'var(--status-success-fg)' : 'var(--status-error-fg)', color: '#fff',
          padding: '10px 18px', borderRadius: 'var(--radius-md)', fontSize: 13.5, fontWeight: 500,
          boxShadow: 'var(--shadow-lg)', fontFamily: 'var(--font-sans)',
        }}>{toast.msg}</div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
