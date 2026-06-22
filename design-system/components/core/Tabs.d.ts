import * as React from 'react';

export interface TabItem {
  value: string;
  label: React.ReactNode;
  /** Optional count shown in parentheses, e.g. "(3)". */
  count?: number;
  capitalize?: boolean;
}

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: TabItem[];
  /** Controlled selected value. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

/** Rounded "pill" filter tabs (Services / Bookings pages). Active pill is navy. */
export function Tabs(props: TabsProps): React.JSX.Element;
