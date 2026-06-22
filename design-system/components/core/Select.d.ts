import * as React from 'react';

export interface SelectOption { value: string; label: string; }

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  /** Options as data; alternatively pass <option> children. */
  options?: SelectOption[];
  children?: React.ReactNode;
}

/** Dropdown select matching the Input shape — rounded-lg, navy focus, custom chevron. */
export function Select(props: SelectProps): React.JSX.Element;
