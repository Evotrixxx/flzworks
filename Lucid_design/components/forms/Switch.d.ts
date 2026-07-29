import * as React from 'react';

/** Pill toggle. Off = glass, on = ink. */
export interface SwitchProps {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}
export function Switch(props: SwitchProps): JSX.Element;
