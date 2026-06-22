import React from 'react';

/**
 * VenuePlus pill badge. Used for booking statuses and service categories.
 * Pass a semantic `tone` OR a `category` to auto-pick the brand chip colors.
 */
const TONES = {
  neutral: { bg: 'var(--neutral-100)', fg: 'var(--neutral-700)' },
  brand:   { bg: 'var(--primary-100)', fg: 'var(--primary-700)' },
  pending: { bg: 'var(--status-pending-bg)', fg: 'var(--status-pending-fg)' },
  success: { bg: 'var(--status-success-bg)', fg: 'var(--status-success-fg)' },
  error:   { bg: 'var(--status-error-bg)', fg: 'var(--status-error-fg)' },
  info:    { bg: 'var(--status-info-bg)', fg: 'var(--status-info-fg)' },
};

const STATUS_TONE = {
  pending: 'pending', awaiting_payment: 'pending',
  confirmed: 'success', accepted: 'success', completed: 'info',
  cancelled: 'error', declined: 'error',
  // agent run / job lifecycle
  done: 'success', running: 'info', planned: 'neutral',
  needs_approval: 'pending', blocked: 'error', failed: 'error',
};

const RISK = {
  read:           { bg: 'var(--risk-read-bg)', fg: 'var(--risk-read-fg)' },
  internal_write: { bg: 'var(--risk-internal-bg)', fg: 'var(--risk-internal-fg)' },
  outbound:       { bg: 'var(--risk-outbound-bg)', fg: 'var(--risk-outbound-fg)' },
  financial:      { bg: 'var(--risk-financial-bg)', fg: 'var(--risk-financial-fg)' },
  money_movement: { bg: 'var(--risk-money-bg)', fg: 'var(--risk-money-fg)' },
  legal:          { bg: 'var(--risk-legal-bg)', fg: 'var(--risk-legal-fg)' },
};

const DECISION = {
  auto:             { bg: 'var(--decision-auto-bg)', fg: 'var(--decision-auto-fg)' },
  require_approval: { bg: 'var(--decision-approval-bg)', fg: 'var(--decision-approval-fg)' },
  deny:             { bg: 'var(--decision-deny-bg)', fg: 'var(--decision-deny-fg)' },
};

const CATEGORY = {
  cleaning:    { bg: 'var(--cat-cleaning-bg)', fg: 'var(--cat-cleaning-fg)' },
  security:    { bg: 'var(--cat-security-bg)', fg: 'var(--cat-security-fg)' },
  catering:    { bg: 'var(--cat-catering-bg)', fg: 'var(--cat-catering-fg)' },
  bartending:  { bg: 'var(--cat-bartending-bg)', fg: 'var(--cat-bartending-fg)' },
  dj:          { bg: 'var(--cat-dj-bg)', fg: 'var(--cat-dj-fg)' },
  photography: { bg: 'var(--cat-photography-bg)', fg: 'var(--cat-photography-fg)' },
  decoration:  { bg: 'var(--cat-decoration-bg)', fg: 'var(--cat-decoration-fg)' },
  equipment:   { bg: 'var(--cat-equipment-bg)', fg: 'var(--cat-equipment-fg)' },
  staff:       { bg: 'var(--cat-staff-bg)', fg: 'var(--cat-staff-fg)' },
};

export function Badge({ tone = 'neutral', status, category, risk, decision, capitalize = true, children, style = {}, ...rest }) {
  let palette = TONES[tone] || TONES.neutral;
  if (status) palette = TONES[STATUS_TONE[status]] || TONES.neutral;
  if (category) palette = CATEGORY[category] || TONES.neutral;
  if (risk) palette = RISK[risk] || TONES.neutral;
  if (decision) palette = DECISION[decision] || TONES.neutral;

  const label = children || (status || category || risk || decision || '');
  const text = typeof label === 'string' ? label.replace(/_/g, ' ') : label;

  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
        fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)',
        fontWeight: 'var(--weight-semibold)', lineHeight: 1.4,
        padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-full)',
        textTransform: capitalize ? 'capitalize' : 'none',
        background: palette.bg, color: palette.fg,
        ...style,
      }}
      {...rest}
    >
      {text}
    </span>
  );
}
