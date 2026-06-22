import React from 'react';

/**
 * VenuePlus text input with optional label, leading icon, and error state.
 * Mirrors the app's `.input-field` — full-width, rounded-lg, navy focus ring.
 */
export function Input({
  label,
  type = 'text',
  placeholder,
  value,
  defaultValue,
  onChange,
  leadingIcon = null,
  error = '',
  disabled = false,
  id,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || (label ? `vp-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  return (
    <div style={{ width: '100%', fontFamily: 'var(--font-sans)' }}>
      {label && (
        <label htmlFor={inputId} style={{
          display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)',
          color: 'var(--neutral-700)', marginBottom: '0.25rem',
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {leadingIcon && (
          <span style={{
            position: 'absolute', left: '0.875rem', display: 'flex',
            color: 'var(--neutral-400)', pointerEvents: 'none',
          }}>
            {leadingIcon}
          </span>
        )}
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            width: '100%',
            padding: leadingIcon ? '0.75rem 1rem 0.75rem 2.5rem' : '0.75rem 1rem',
            fontSize: 'var(--text-base)',
            fontFamily: 'var(--font-sans)',
            color: 'var(--neutral-900)',
            background: disabled ? 'var(--neutral-100)' : 'var(--white)',
            border: `1px solid ${error ? 'var(--status-error-fg)' : focus ? 'var(--primary-500)' : 'var(--neutral-300)'}`,
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            boxShadow: focus && !error ? '0 0 0 2px var(--primary-100)' : 'none',
            transition: 'var(--transition-colors)',
            cursor: disabled ? 'not-allowed' : 'text',
            ...style,
          }}
          {...rest}
        />
      </div>
      {error && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--status-error-fg)', marginTop: '0.25rem' }}>
          {error}
        </p>
      )}
    </div>
  );
}
