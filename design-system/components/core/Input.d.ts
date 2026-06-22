import * as React from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Field label rendered above the input. */
  label?: string;
  /** Icon element shown inside the field on the left. */
  leadingIcon?: React.ReactNode;
  /** Error message — turns the border red and shows the text below. */
  error?: string;
}

/** Single-line text field with optional label, leading icon, and error state. Navy focus ring. */
export function Input(props: InputProps): React.JSX.Element;
