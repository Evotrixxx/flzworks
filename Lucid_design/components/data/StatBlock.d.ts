import * as React from 'react';

/**
 * Big-number metric with a mono uppercase label and superscript unit.
 * @startingPoint section="Data" subtitle="Big-number metrics with mono labels" viewport="700x180"
 */
export interface StatBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  value?: React.ReactNode;
  /** superscript unit — "$", "%", "th" */
  unit?: React.ReactNode;
  sub?: React.ReactNode;
  align?: 'left' | 'right';
  tone?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}
export function StatBlock(props: StatBlockProps): JSX.Element;
