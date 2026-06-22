/* Runs: a list of agent runs; click one for the full audit trace (jobs → actions). */
function Runs({ runs, openRunId, onOpenRun, onBack }) {
  const { Badge } = window.VenuePlusDesignSystem_17f1a7;

  if (openRunId != null) {
    const run = runs.find((r) => r.id === openRunId);
    if (run) return <RunDetail run={run} onBack={onBack} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Agent runs</h2>
      <div style={{ background: '#fff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-default)' }}>
              <th style={th}>Run</th><th style={th}>Goal</th><th style={th}>Status</th>
              <th style={{ ...th, textAlign: 'center' }}>Actions</th>
              <th style={{ ...th, textAlign: 'center' }}>Pending</th><th style={th}>When</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((r) => (
              <tr key={r.id} onClick={() => onOpenRun(r.id)} style={{ borderBottom: '1px solid var(--border-hairline)', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--neutral-50)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <td style={{ ...td, color: 'var(--primary-600)', fontWeight: 600 }}>#{r.id}</td>
                <td style={{ ...td, maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.goal}</td>
                <td style={td}><Badge status={r.status} /></td>
                <td style={{ ...td, textAlign: 'center' }}>{r.executed}/{r.total}</td>
                <td style={{ ...td, textAlign: 'center' }}>
                  {r.pending > 0 ? <span style={{ color: 'var(--status-pending-fg)', fontWeight: 600 }}>{r.pending}</span> : <span style={{ color: 'var(--text-subtle)' }}>0</span>}
                </td>
                <td style={{ ...td, color: 'var(--text-muted)' }}>{r.when}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RunDetail({ run, onBack }) {
  const { Badge } = window.VenuePlusDesignSystem_17f1a7;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <button onClick={onBack} style={linkBtn}>← All runs</button>
      <div style={{ background: '#fff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Run #{run.id}</h2>
          <Badge status={run.status} />
        </div>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--neutral-700)' }}>{run.goal}</p>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
          {run.executed}/{run.total} actions executed · {run.pending} awaiting approval · {run.when}
        </p>
      </div>

      {run.jobs.map((job) => (
        <div key={job.agent} style={{ background: '#fff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 16px', borderBottom: '1px solid var(--border-default)', background: 'var(--neutral-50)' }}>
            <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, textTransform: 'capitalize' }}>{job.agent}</h3>
            <Badge status={job.status} />
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-hairline)' }}>
                <th style={th}>Tool</th><th style={th}>Risk</th><th style={th}>Decision</th>
                <th style={{ ...th, textAlign: 'center' }}>Run</th><th style={th}>Reason</th>
              </tr>
            </thead>
            <tbody>
              {job.actions.map((a, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-hairline)' }}>
                  <td style={{ ...td, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>{a.tool}</td>
                  <td style={td}><Badge risk={a.risk} /></td>
                  <td style={td}><Badge decision={a.decision} /></td>
                  <td style={{ ...td, textAlign: 'center' }}>{a.executed ? <span style={{ color: 'var(--status-success-fg)' }}>✓</span> : <span style={{ color: 'var(--text-subtle)' }}>—</span>}</td>
                  <td style={{ ...td, color: 'var(--neutral-600)' }}>{a.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

const th = { padding: '10px 14px', fontWeight: 600 };
const td = { padding: '11px 14px', verticalAlign: 'top' };

Object.assign(window, { Runs });
