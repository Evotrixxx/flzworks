import * as React from 'react';

/**
 * Glass card with the system's standard eyebrow / title / meta stack.
 * @startingPoint section="Surfaces" subtitle="Glass card with eyebrow, title, media and footer slots" viewport="700x360"
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** uppercase mono kicker */
  eyebrow?: string;
  title?: React.ReactNode;
  meta?: React.ReactNode;
  /** image / placeholder block rendered flush to the card edges */
  media?: React.ReactNode;
  footer?: React.ReactNode;
  tone?: 'light' | 'clear' | 'dark' | 'solid' | 'ink';
}
export function Card(props: CardProps): JSX.Element;
