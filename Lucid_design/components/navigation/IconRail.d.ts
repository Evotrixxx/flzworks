import * as React from 'react';

/**
 * Vertical floating glass rail of icon-only destinations. Sits detached at the
 * left edge of app layouts.
 * @startingPoint section="Navigation" subtitle="Vertical glass icon rail" viewport="700x260"
 */
export interface IconRailProps extends React.HTMLAttributes<HTMLElement> {
  items?: Array<{ id: string; icon: string; label?: string }>;
  value?: string;
  onChange?: (id: string) => void;
  footer?: React.ReactNode;
  tone?: 'glass' | 'dark';
}
export function IconRail(props: IconRailProps): JSX.Element;
