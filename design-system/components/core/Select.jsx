import React from 'react';

/**
 * VenuePlus select / dropdown. Same shape as Input — rounded-lg, navy focus.
 * Pass `options` as [{value,label}] or render <option> children.
 */
export function Select({
  label,
  options = [],
  value,
  defaultValue,
  onChange,
  disabled = false,
  id,
  children,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const selectId = id || (label ? `vp-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  return (
    <div style={{ width: '100%', fontFamily: 'var(--font-sans)' }}>
      {label && (
        <label htmlFor={selectId} style={{
          display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)',
          color: 'var(--neutral-700)', marginBottom: '0.25rem',
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <select
          id={selectId}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            width: '100%',
            appearance: 'none',
            WebkitAppearance: 'none',
            padding: '0.75rem 2.5rem 0.75rem 1rem',
            fontSize: 'var(--text-base)',
            fontFamily: 'var(--font-sans)',
            color: 'var(--neutral-900)',
            background: disabled ? 'var(--neutral-100)' : 'var(--white)',
            border: `1px solid ${focus ? 'var(--primary-500)' : 'var(--neutral-300)'}`,
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            boxShadow: focus ? '0 0 0 2px var(--primary-100)' : 'none',
            transition: 'var(--transition-colors)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            ...style,
          }}
          {...rest}
        >
          {children || options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span style={{
          position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
          pointerEvents: 'none', color: 'var(--neutral-500)', fontSize: '0.7rem',
        }}>▼</span>
      </div>
    </div>
  );
}
