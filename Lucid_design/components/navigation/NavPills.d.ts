import * as React from 'react';

/**
 * The system's primary navigation: a floating glass capsule of pills with one
 * solid-cream active pill. Used as top nav and as filter rows.
 * @startingPoint section="Navigation" subtitle="Floating glass pill nav, light and dark" viewport="700x160"
 */
export interface NavPillsProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: Array<string | { id: string; label: React.ReactNode }>;
  value?: string;
  onChange?: (id: string) => void;
  tone?: 'glass' | 'dark';
  size?: 'sm' | 'md';
}
export function NavPills(props: NavPillsProps): JSX.Element;
