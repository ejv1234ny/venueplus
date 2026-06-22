import React from 'react';

/**
 * VenuePlus checkbox with label. Navy when checked.
 */
export function Checkbox({
  label,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  id,
  ...rest
}) {
  const reactId = React.useId();
  const boxId = id || reactId;
  const isControlled = checked !== undefined;
  const [internal, setInternal] = React.useState(!!defaultChecked);
  const isChecked = isControlled ? checked : internal;

  const handle = (e) => {
    if (!isControlled) setInternal(e.target.checked);
    onChange && onChange(e);
  };

  return (
    <label
      htmlFor={boxId}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)',
        color: 'var(--neutral-700)', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, userSelect: 'none',
      }}
    >
      <span style={{
        position: 'relative', width: '1.15rem', height: '1.15rem', flexShrink: 0,
        borderRadius: 'var(--radius-sm)',
        border: `2px solid ${isChecked ? 'var(--primary-500)' : 'var(--neutral-300)'}`,
        background: isChecked ? 'var(--primary-500)' : 'var(--white)',
        transition: 'var(--transition-colors)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isChecked && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
        <input
          id={boxId}
          type="checkbox"
          checked={isChecked}
          onChange={handle}
          disabled={disabled}
          style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', margin: 0, cursor: 'inherit' }}
          {...rest}
        />
      </span>
      {label}
    </label>
  );
}
