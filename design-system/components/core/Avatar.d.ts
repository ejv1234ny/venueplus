import * as React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Image URL. If omitted, initials render on the navy→orange brand gradient. */
  src?: string;
  /** Full name — used for initials and alt text. */
  name?: string;
  /** @default "md" */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/** Circular avatar — photo, or initials on the brand gradient (as in the navbar user menu). */
export function Avatar(props: AvatarProps): React.JSX.Element;
