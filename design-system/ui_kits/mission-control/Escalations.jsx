/* Escalations: the human-in-the-loop approval queue — the operator's core job. */
const HARD_GATED = new Set(['money_movement', 'legal']);

function CheckList({ items }) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map(([label, ok]) => (
        <li key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--neutral-700)' }}>
          <span style={{ width: 17, height: 17, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: ok ? 'var(--status-success-bg)' : 'var(--status-pending-bg)', color: ok ? 'var(--status-success-fg)' : 'var(--status-pending-fg)' }}>{ok ? '✓' : '!'}</span>
          {label}
        </li>
      ))}
    </ul>
  );
}

function ListingReview({ p }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 18, marginTop: 12 }}>
      <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-hairline)' }}>
        <div style={{ height: 110, background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,.5)', fontSize: 30, fontWeight: 700 }}>V+</span>
          <span style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(255,255,255,.92)', color: 'var(--neutral-800)', fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 999, textTransform: 'capitalize' }}>{p.type}</span>
          <span style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,.5)', color: '#fff', fontSize: 10.5, fontWeight: 600, padding: '2px 7px', borderRadius: 999 }}>{p.photos} photos</span>
        </div>
        <div style={{ padding: 12, background: '#fff' }}>
          <div style={{ fontSize: 14.5, fontWeight: 700 }}>{p.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>◌ {p.city}, {p.state}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-hairline)' }}>
            <span style={{ fontSize: 12.5, color: 'var(--neutral-600)' }}>Up to {p.capacity}</span>
            <span style={{ fontWeight: 700, color: 'var(--primary-600)', fontSize: 14 }}>${p.price}<span style={{ fontWeight: 400, color: 'var(--text-subtle)', fontSize: 11.5 }}>/hr</span></span>
          </div>
        </div>
      </div>
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', marginBottom: 12 }}>
          <Detail k="Host" v={p.host} />
          <Detail k="Completeness" v={`${p.completeness}%`} />
          <Detail k="Rate vs comp" v={`$${p.price} (sugg. $${p.suggested_price})`} />
          <Detail k="Required" v={p.required.join(', ')} cap />
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--text-subtle)', margin: '6px 0 7px' }}>Onboarding agent checks</div>
        <CheckList items={p.checks} />
      </div>
    </div>
  );
}

function ProviderReview({ p }) {
  const { Badge } = window.VenuePlusDesignSystem_17f1a7;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 18, marginTop: 12 }}>
      <div style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-hairline)', padding: 14, background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>{p.name[0]}</div>
          <Badge category={p.category} />
        </div>
        <div style={{ fontSize: 14.5, fontWeight: 700 }}>{p.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>◌ {p.area} · {p.radius} mi</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-hairline)' }}>
          <span style={{ fontSize: 12.5, color: 'var(--status-success-fg)' }}>⛨ Insured</span>
          <span style={{ fontWeight: 700, color: 'var(--primary-600)', fontSize: 14 }}>${p.rate}<span style={{ fontWeight: 400, color: 'var(--text-subtle)', fontSize: 11.5 }}>/hr</span></span>
        </div>
      </div>
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', marginBottom: 12 }}>
          <Detail k="Team size" v={`${p.team} people`} />
          <Detail k="License #" v={p.license} />
          <Detail k="Insurance" v={`Valid · ${p.insurance_expires}`} />
          <Detail k="Hourly rate" v={`$${p.rate}`} />
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--text-subtle)', margin: '6px 0 7px' }}>Trust &amp; Safety checks</div>
        <CheckList items={p.checks} />
      </div>
    </div>
  );
}

function Detail({ k, v, cap }) {
  return (
    <div style={{ fontSize: 13, padding: '3px 0' }}>
      <span style={{ color: 'var(--text-muted)' }}>{k}: </span>
      <span style={{ color: 'var(--neutral-800)', fontWeight: 600, textTransform: cap ? 'capitalize' : 'none' }}>{v}</span>
    </div>
  );
}

function Escalations({ escalations, onResolve, onOpenRun }) {
  const { Badge } = window.VenuePlusDesignSystem_17f1a7;

  if (escalations.length === 0) {
    return (
      <div style={{
        background: '#fff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)',
        padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 15,
      }}>
        🎉 No open escalations. The fleet is clear — go do something else.
      </div>
    );
  }

  const titleFor = (e) => e.kind === 'listing_review' ? 'New listing ready to go live'
    : e.kind === 'provider_review' ? 'New provider ready to verify' : null;
  const approveLabel = (e) => e.kind === 'listing_review' ? 'Approve & publish'
    : e.kind === 'provider_review' ? 'Verify & approve' : 'Approve';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Approval queue</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {escalations.map((e) => {
          const gated = HARD_GATED.has(e.risk);
          const review = e.kind === 'listing_review' || e.kind === 'provider_review';
          return (
            <div key={e.id} style={{
              background: '#fff', border: `1px solid ${gated ? '#fecaca' : 'var(--border-default)'}`,
              borderRadius: 'var(--radius-lg)', padding: 16,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {review
                      ? <strong style={{ fontSize: 15, color: 'var(--neutral-900)' }}>{titleFor(e)}</strong>
                      : <code style={{ fontSize: 13, fontFamily: 'ui-monospace, monospace', color: 'var(--neutral-800)' }}>{e.tool}</code>}
                    <Badge risk={e.risk} />
                    <span style={{ fontSize: 12, color: 'var(--text-subtle)', textTransform: 'capitalize' }}>{e.agent}</span>
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--neutral-700)' }}>{e.reason}</p>
                  <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--text-subtle)' }}>
                    <button onClick={() => onOpenRun(e.run_id)} style={linkBtn}>run #{e.run_id}</button>
                    {e.run_goal ? ` · ${e.run_goal}` : ''} · {e.created_at}
                  </p>

                  {e.kind === 'listing_review' && <ListingReview p={e.payload} />}
                  {e.kind === 'provider_review' && <ProviderReview p={e.payload} />}

                  {!review && e.args && (
                    <pre style={{
                      margin: '10px 0 0', background: 'var(--neutral-50)', border: '1px solid var(--border-hairline)',
                      borderRadius: 'var(--radius-sm)', padding: 10, fontSize: 11.5, overflowX: 'auto',
                      color: 'var(--neutral-700)',
                    }}>{JSON.stringify(e.args, null, 2)}</pre>
                  )}
                  {gated && (
                    <p style={{ margin: '8px 0 0', fontSize: 12, fontWeight: 600, color: 'var(--status-error-fg)' }}>
                      ⚠ Hard-gated {e.risk.replace('_', ' ')} action — requires explicit confirmation.
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <button onClick={() => onResolve(e.id, true)} style={approveBtn}>{approveLabel(e)}</button>
                  <button onClick={() => onResolve(e.id, false)} style={rejectBtn}>Reject</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const linkBtn = { border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: 'var(--primary-600)', font: 'inherit', textDecoration: 'underline' };
const approveBtn = { border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-md)', padding: '9px 18px', fontSize: 13.5, fontWeight: 600, color: '#fff', background: 'var(--status-success-fg)', fontFamily: 'var(--font-sans)' };
const rejectBtn = { cursor: 'pointer', borderRadius: 'var(--radius-md)', padding: '9px 18px', fontSize: 13.5, fontWeight: 600, color: 'var(--status-error-fg)', background: '#fff', border: '1px solid #fecaca', fontFamily: 'var(--font-sans)' };

Object.assign(window, { Escalations });
