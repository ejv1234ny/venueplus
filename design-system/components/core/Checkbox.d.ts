import * as React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Text label shown beside the box. */
  label?: React.ReactNode;
}

/** Checkbox with label. Fills navy with a white check when selected. Controlled or uncontrolled. */
export function Checkbox(props: CheckboxProps): React.JSX.Element;
