/* Mission Control shell: brand header + underline nav tabs. */
const { useState } = React;

function Logo({ size = 36 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img src="../../assets/venueplus-logo-mark.png" alt="VenuePlus" style={{ height: size, width: 'auto' }} />
      <div style={{ lineHeight: 1 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--neutral-900)' }}>VenuePlus</div>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--primary-600)' }}>Mission Control</div>
      </div>
    </div>
  );
}

function ConsoleHeader({ operator }) {
  const { Avatar } = window.VenuePlusDesignSystem_17f1a7;
  return (
    <header style={{
      background: '#fff', borderBottom: '1px solid var(--border-default)',
      padding: '0 24px', height: 64, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20,
    }}>
      <Logo />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ textAlign: 'right', lineHeight: 1.2 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--neutral-800)' }}>{operator.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Solo operator · 1 of 1</div>
        </div>
        <Avatar name={operator.name} size="sm" />
      </div>
    </header>
  );
}

function Nav({ tabs, active, onChange, badges = {} }) {
  return (
    <nav style={{
      display: 'flex', gap: 2, borderBottom: '1px solid var(--border-default)',
      background: '#fff', padding: '0 24px', position: 'sticky', top: 64, zIndex: 19,
    }}>
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            border: 'none', background: 'none', cursor: 'pointer',
            padding: '14px 14px 12px', fontFamily: 'var(--font-sans)',
            fontSize: 14, fontWeight: 500, color: on ? 'var(--primary-600)' : 'var(--text-muted)',
            borderBottom: `2px solid ${on ? 'var(--primary-500)' : 'transparent'}`,
            marginBottom: -1, display: 'flex', alignItems: 'center', gap: 7,
            transition: 'var(--transition-colors)',
          }}>
            {t.label}
            {badges[t.id] > 0 && (
              <span style={{
                background: 'var(--status-pending-bg)', color: 'var(--status-pending-fg)',
                fontSize: 11, fontWeight: 700, borderRadius: 'var(--radius-full)',
                padding: '1px 7px', minWidth: 18, textAlign: 'center',
              }}>{badges[t.id]}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

Object.assign(window, { Logo, ConsoleHeader, Nav });
