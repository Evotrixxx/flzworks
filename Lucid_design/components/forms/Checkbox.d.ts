import * as React from 'react';

/** Glass checkbox; `round` makes it a radio. */
export interface CheckboxProps {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  label?: React.ReactNode;
  /** circular = radio semantics */
  round?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}
export function Checkbox(props: CheckboxProps): JSX.Element;
