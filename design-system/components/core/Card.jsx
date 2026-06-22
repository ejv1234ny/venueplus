import React from 'react';

/**
 * VenuePlus surface card. White, rounded-xl, soft shadow that lifts on hover.
 * Set `interactive` for the hover lift (used on venue/service cards).
 */
export function Card({
  interactive = false,
  padding = 'md',
  as = 'div',
  children,
  style = {},
  onClick,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const Tag = as;
  const pads = { none: 0, sm: 'var(--space-4)', md: 'var(--space-5)', lg: 'var(--space-6)' };

  return (
    <Tag
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: interactive && hover ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
        overflow: 'hidden',
        padding: pads[padding] ?? pads.md,
        transition: 'var(--transition-shadow), transform var(--duration-base) var(--ease-standard)',
        cursor: interactive ? 'pointer' : 'default',
        transform: interactive && hover ? 'translateY(-2px)' : 'none',
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
