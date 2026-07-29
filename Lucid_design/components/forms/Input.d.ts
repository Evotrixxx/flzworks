import * as React from 'react';

/**
 * Pill text field on glass, with a warm focus ring.
 * @startingPoint section="Forms" subtitle="Glass pill inputs, hints and error state" viewport="700x220"
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  icon?: React.ReactNode;
  tone?: 'glass' | 'dark';
  invalid?: boolean;
}
export function Input(props: InputProps): JSX.Element;
