import React from 'react';

/**
 * VenuePlus Mission Control KPI tile. A bordered white card with a small
 * label and a large value; optional accent color and delta caption.
 */
export function KpiCard({ label, value, accent, delta, deltaTone = 'neutral', style = {}, ...rest }) {
  const deltaColors = {
    up: 'var(--status-success-fg)',
    down: 'var(--status-error-fg)',
    neutral: 'var(--text-muted)',
  };
  return (
    <div
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        fontFamily: 'var(--font-sans)',
        ...style,
      }}
      {...rest}
    >
      <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{label}</p>
      <p style={{
        margin: '2px 0 0', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)',
        lineHeight: 1.1, color: accent || 'var(--text-strong)',
      }}>
        {value}
      </p>
      {delta && (
        <p style={{ margin: '4px 0 0', fontSize: 'var(--text-xs)', color: deltaColors[deltaTone] }}>
          {delta}
        </p>
      )}
    </div>
  );
}
