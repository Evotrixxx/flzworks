import * as React from 'react';

/** Small mono-type capsule for status, category and metadata. */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'glass' | 'ink' | 'cream' | 'outline' | 'positive' | 'caution';
  dot?: boolean;
}
export function Badge(props: BadgeProps): JSX.Element;
