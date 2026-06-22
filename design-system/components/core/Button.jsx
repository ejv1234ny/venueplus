import React from 'react';

/**
 * VenuePlus Button.
 * Variants: primary (deep navy), accent (warm orange CTA), outline, ghost.
 * Sizes: sm, md, lg. Optional leading/trailing icon, fullWidth, loading.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  leadingIcon = null,
  trailingIcon = null,
  type = 'button',
  onClick,
  children,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: { padding: '0.5rem 0.875rem', fontSize: 'var(--text-sm)', gap: '0.375rem' },
    md: { padding: '0.75rem 1.5rem', fontSize: 'var(--text-base)', gap: '0.5rem' },
    lg: { padding: '1rem 2rem', fontSize: 'var(--text-lg)', gap: '0.5rem' },
  };

  const variants = {
    primary: { background: 'var(--primary-500)', color: 'var(--white)', border: '2px solid transparent' },
    accent: { background: 'var(--accent-500)', color: 'var(--white)', border: '2px solid transparent' },
    outline: { background: 'transparent', color: 'var(--primary-500)', border: '2px solid var(--primary-500)' },
    ghost: { background: 'transparent', color: 'var(--neutral-700)', border: '2px solid transparent' },
  };

  const [hover, setHover] = React.useState(false);
  const isDisabled = disabled || loading;

  const hoverBg = {
    primary: 'var(--primary-600)',
    accent: 'var(--accent-600)',
    outline: 'var(--primary-50)',
    ghost: 'var(--neutral-100)',
  };

  const v = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sizes[size].gap,
        fontFamily: 'var(--font-sans)',
        fontWeight: 'var(--weight-medium)',
        lineHeight: 1,
        borderRadius: 'var(--radius-md)',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        transition: 'var(--transition-colors)',
        ...sizes[size],
        ...v,
        background: hover && !isDisabled ? hoverBg[variant] : v.background,
        ...style,
      }}
      {...rest}
    >
      {loading ? (
        <span style={{
          width: '1em', height: '1em', borderRadius: '50%',
          border: '2px solid currentColor', borderTopColor: 'transparent',
          display: 'inline-block', animation: 'vp-spin 0.6s linear infinite',
        }} />
      ) : leadingIcon}
      {children}
      {!loading && trailingIcon}
      <style>{`@keyframes vp-spin{to{transform:rotate(360deg)}}`}</style>
    </button>
  );
}
