import * as React from 'react';

/**
 * Pill-shaped action. Ink and cream capsules are the primary pair; glass variants
 * are for actions that sit directly on imagery.
 * @startingPoint section="Controls" subtitle="Pill buttons — ink, cream, glass, ghost" viewport="700x180"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ink' | 'cream' | 'glass' | 'glassDark' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  block?: boolean;
  /** switches to mono label type — used for small utility actions like REFRESH */
  uppercase?: boolean;
}
export function Button(props: ButtonProps): JSX.Element;
