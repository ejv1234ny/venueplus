import * as React from 'react';

export interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Small caption above the number. */
  label: string;
  /** The headline metric. */
  value: React.ReactNode;
  /** CSS color for the value (e.g. 'var(--status-success-fg)' for healthy, red for alarm). */
  accent?: string;
  /** Optional delta / context line under the value. */
  delta?: React.ReactNode;
  /** Colors the delta line. @default "neutral" */
  deltaTone?: 'up' | 'down' | 'neutral';
}

/**
 * Mission Control metric tile — label + large value, used in the operator
 * dashboard KPI grid (GMV, active venues, open escalations, fleet status…).
 *
 * @startingPoint section="Operator" subtitle="Mission Control KPI metric tile" viewport="240x120"
 */
export function KpiCard(props: KpiCardProps): React.JSX.Element;
