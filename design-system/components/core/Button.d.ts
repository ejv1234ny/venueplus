import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. primary = teal, accent = coral CTA, outline, ghost. @default "primary" */
  variant?: 'primary' | 'accent' | 'outline' | 'ghost';
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Stretch to fill container width. @default false */
  fullWidth?: boolean;
  /** Show a spinner and disable interaction. @default false */
  loading?: boolean;
  /** Icon element rendered before the label. */
  leadingIcon?: React.ReactNode;
  /** Icon element rendered after the label. */
  trailingIcon?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * The primary action control for VenuePlus. Teal for standard actions,
 * coral (`accent`) for the highest-intent CTA like "Book Now".
 *
 * @startingPoint section="Core" subtitle="Teal / coral / outline / ghost actions" viewport="700x180"
 */
export function Button(props: ButtonProps): React.JSX.Element;
