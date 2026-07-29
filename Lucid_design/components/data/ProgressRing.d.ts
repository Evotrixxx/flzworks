import * as React from 'react';

/** Thick round-cap progress ring with a centred numeric readout. */
export interface ProgressRingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0–100 */
  value?: number;
  size?: number;
  thickness?: number;
  label?: string;
  unit?: React.ReactNode;
  tone?: 'light' | 'dark';
  /** override the progress stroke, e.g. var(--accent-warm) */
  accent?: string;
}
export function ProgressRing(props: ProgressRingProps): JSX.Element;
