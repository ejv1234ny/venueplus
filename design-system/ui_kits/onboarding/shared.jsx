/* Onboarding — shared UI: stepper, AI-assist callout, choice cards, live previews. */
const { useState: useObState } = React;

function Stepper({ steps, current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24 }}>
      {steps.map((s, i) => {
        const done = i < current, on = i === current;
        return (
          <React.Fragment key={s.id}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
                background: done ? 'var(--primary-500)' : on ? 'var(--primary-50)' : 'var(--neutral-100)',
                color: done ? '#fff' : on ? 'var(--primary-700)' : 'var(--text-subtle)',
                border: on ? '2px solid var(--primary-500)' : '2px solid transparent',
              }}>
                {done ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 11, fontWeight: on ? 600 : 500, color: on ? 'var(--primary-700)' : 'var(--text-subtle)', whiteSpace: 'nowrap' }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: done ? 'var(--primary-300)' : 'var(--border-default)', margin: '0 8px', marginBottom: 22 }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function AIAssist({ children, label = 'Onboarding agent', action }) {
  return (
    <div style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-100)', borderRadius: 'var(--radius-lg)', padding: '12px 14px', marginTop: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', background: 'var(--gradient-brand)', color: '#fff', fontSize: 11 }}>✦</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-700)' }}>{label}</span>
      </div>
      <div style={{ fontSize: 13.5, color: 'var(--neutral-700)', lineHeight: 1.5 }}>{children}</div>
      {action}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label style={{ display: 'block', marginBottom: 16 }}>
      <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--neutral-700)', marginBottom: 6 }}>{label}</span>
      {children}
      {hint && <span style={{ display: 'block', fontSize: 12, color: 'var(--text-subtle)', marginTop: 5 }}>{hint}</span>}
    </label>
  );
}

const inputCss = {
  width: '100%', boxSizing: 'border-box', padding: '11px 13px', fontSize: 14.5,
  fontFamily: 'var(--font-sans)', color: 'var(--neutral-900)', background: '#fff',
  border: '1px solid var(--neutral-300)', borderRadius: 'var(--radius-md)', outline: 'none',
};

function ChoiceCard({ title, desc, accent, points, onClick }) {
  const [hover, setHover] = useObState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        textAlign: 'left', cursor: 'pointer', background: '#fff', fontFamily: 'var(--font-sans)',
        border: `2px solid ${hover ? accent : 'var(--border-default)'}`, borderRadius: 'var(--radius-lg)',
        padding: 24, transition: 'var(--transition-colors), transform 150ms', transform: hover ? 'translateY(-3px)' : 'none',
        boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow-sm)', width: '100%',
      }}>
      <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: accent, opacity: 0.12, marginBottom: 14 }} />
      <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 700, color: 'var(--neutral-900)' }}>{title}</h3>
      <p style={{ margin: '0 0 14px', fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</p>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
        {points.map((p) => (
          <li key={p} style={{ display: 'flex', gap: 8, fontSize: 13.5, color: 'var(--neutral-700)' }}>
            <span style={{ color: accent, fontWeight: 700 }}>✓</span>{p}
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 16, fontSize: 14, fontWeight: 600, color: accent }}>Get started →</div>
    </button>
  );
}

/* live preview cards */
function VenuePreview({ d }) {
  const grad = 'linear-gradient(135deg, var(--primary-500), var(--accent-500))';
  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
      <div style={{ height: 150, background: grad, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,.5)', fontSize: 38, fontWeight: 700 }}>V+</span>
        {d.type && <span style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,.92)', color: 'var(--neutral-800)', fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 999, textTransform: 'capitalize' }}>{d.type}</span>}
      </div>
      <div style={{ padding: 14 }}>
        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: d.name ? 'var(--neutral-900)' : 'var(--text-subtle)' }}>{d.name || 'Your space name'}</h4>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>◌ {d.city || 'City'}, {d.state || '—'}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-hairline)' }}>
          <span style={{ fontSize: 13, color: 'var(--neutral-600)' }}>{d.capacity ? `Up to ${d.capacity}` : 'Capacity'}</span>
          <span style={{ fontWeight: 700, color: 'var(--primary-600)' }}>{d.price ? `$${d.price}` : '$—'}<span style={{ color: 'var(--text-subtle)', fontWeight: 400, fontSize: 12 }}>/hr</span></span>
        </div>
      </div>
    </div>
  );
}

function ProviderPreview({ d }) {
  const { Badge } = window.VenuePlusDesignSystem_17f1a7;
  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18 }}>
          {(d.name || 'P')[0].toUpperCase()}
        </div>
        {d.category && <Badge category={d.category} />}
      </div>
      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: d.name ? 'var(--neutral-900)' : 'var(--text-subtle)' }}>{d.name || 'Your business name'}</h4>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>◌ {d.area || 'Service area'}{d.radius ? ` · ${d.radius} mi` : ''}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-hairline)' }}>
        <span style={{ fontSize: 13, color: 'var(--neutral-600)' }}>{d.insured ? '⛨ Insured' : 'Add insurance'}</span>
        <span style={{ fontWeight: 700, color: 'var(--primary-600)' }}>{d.rate ? `$${d.rate}` : '$—'}<span style={{ color: 'var(--text-subtle)', fontWeight: 400, fontSize: 12 }}>/hr</span></span>
      </div>
    </div>
  );
}

Object.assign(window, { Stepper, AIAssist, Field, ChoiceCard, VenuePreview, ProviderPreview, OB_INPUT: inputCss });
