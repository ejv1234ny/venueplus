import React from 'react';

/**
 * VenuePlus pill tabs — the rounded filter row used on the Services and
 * Bookings pages. Active pill is teal; inactive is neutral-100.
 * Controlled (value+onChange) or uncontrolled (defaultValue).
 */
export function Tabs({ items = [], value, defaultValue, onChange, style = {}, ...rest }) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue ?? (items[0] && items[0].value));
  const active = isControlled ? value : internal;

  const select = (val) => {
    if (!isControlled) setInternal(val);
    onChange && onChange(val);
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', ...style }} {...rest}>
      {items.map((item) => {
        const on = item.value === active;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => select(item.value)}
            style={{
              padding: '0.5rem 1rem',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              cursor: 'pointer',
              transition: 'var(--transition-colors)',
              background: on ? 'var(--primary-500)' : 'var(--neutral-100)',
              color: on ? 'var(--white)' : 'var(--neutral-600)',
              textTransform: item.capitalize ? 'capitalize' : 'none',
            }}
          >
            {item.label}
            {item.count !== undefined && (
              <span style={{ marginLeft: '0.35rem', opacity: 0.8 }}>({item.count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
