import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** Adds the hover lift + shadow change. Use for clickable cards. @default false */
  interactive?: boolean;
  /** Inner padding. @default "md" */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Render as a different element, e.g. "a". @default "div" */
  as?: keyof React.JSX.IntrinsicElements;
  children?: React.ReactNode;
}

/**
 * White rounded-xl surface with a soft shadow. `interactive` adds the signature hover lift.
 *
 * @startingPoint section="Core" subtitle="White surface, soft shadow, hover lift" viewport="700x200"
 */
export function Card(props: CardProps): React.JSX.Element;
