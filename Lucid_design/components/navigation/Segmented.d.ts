import * as React from 'react';

/** Loose row of standalone glass chips (filters, categories) — unlike NavPills there is no containing capsule. */
export interface SegmentedProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: Array<string | { id: string; label: React.ReactNode }>;
  value?: string;
  onChange?: (id: string) => void;
  tone?: 'glass' | 'dark';
}
export function Segmented(props: SegmentedProps): JSX.Element;
