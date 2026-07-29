import * as React from 'react';

/** Overlapping initial-avatars with an optional add affordance. Placeholder colours only — swap in real photography when available. */
export interface AvatarStackProps extends React.HTMLAttributes<HTMLDivElement> {
  people?: Array<string | { name: string; color?: string }>;
  size?: number;
  max?: number;
  onAdd?: () => void;
  tone?: 'light' | 'dark';
}
export function AvatarStack(props: AvatarStackProps): JSX.Element;
