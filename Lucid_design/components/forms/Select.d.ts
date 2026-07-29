import * as React from 'react';

/** Pill select on glass; matches Input geometry exactly. */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: Array<string | { value: string; label: string }>;
  tone?: 'glass' | 'dark';
}
export function Select(props: SelectProps): JSX.Element;
