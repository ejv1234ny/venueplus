import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Semantic color. @default "neutral" */
  tone?: 'neutral' | 'brand' | 'pending' | 'success' | 'error' | 'info';
  /** Booking status string — auto-maps to a tone (confirmed→success, cancelled→error, …). Also handles agent run/job states (done, running, needs_approval, blocked). */
  status?: 'pending' | 'awaiting_payment' | 'confirmed' | 'accepted' | 'completed' | 'cancelled' | 'declined' | 'done' | 'running' | 'planned' | 'needs_approval' | 'blocked' | 'failed';
  /** Service category — auto-picks the brand chip color (cleaning, security, dj, …). */
  category?: 'cleaning' | 'security' | 'catering' | 'bartending' | 'dj' | 'photography' | 'decoration' | 'equipment' | 'staff';
  /** Agent action risk tier (Mission Control) — escalating severity color. */
  risk?: 'read' | 'internal_write' | 'outbound' | 'financial' | 'money_movement' | 'legal';
  /** Agent policy decision — auto (green), require_approval (amber), deny (red). */
  decision?: 'auto' | 'require_approval' | 'deny';
  /** Capitalize the first letter. @default true */
  capitalize?: boolean;
  children?: React.ReactNode;
}

/** Small pill for booking statuses, service categories, and agent risk/decision tiers. Pass `status`, `category`, `risk`, or `decision` to auto-color. */
export function Badge(props: BadgeProps): React.JSX.Element;
