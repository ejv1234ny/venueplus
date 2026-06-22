import React from 'react';

/**
 * VenuePlus avatar. Shows an image, or initials on the brand gradient (the
 * app's signature navy→orange circle used in the navbar user menu).
 */
export function Avatar({ src, name = '', size = 'md', style = {}, ...rest }) {
  const sizes = { xs: 28, sm: 36, md: 44, lg: 56, xl: 80 };
  const px = sizes[size] || sizes.md;
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      style={{
        width: px, height: px, borderRadius: 'var(--radius-full)',
        flexShrink: 0, overflow: 'hidden',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: src ? 'var(--neutral-200)' : 'var(--gradient-brand)',
        color: 'var(--white)', fontFamily: 'var(--font-sans)',
        fontWeight: 'var(--weight-semibold)', fontSize: px * 0.4,
        ...style,
      }}
      {...rest}
    >
      {src ? (
        <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        initials || '?'
      )}
    </div>
  );
}
