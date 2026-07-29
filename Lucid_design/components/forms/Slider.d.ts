import * as React from 'react';

/** Glass track slider with a solid white knob. */
export interface SliderProps {
  value?: number; min?: number; max?: number; step?: number;
  onChange?: (next: number) => void;
  label?: string;
  /** right-aligned mono readout, e.g. "1199$" */
  suffix?: React.ReactNode;
  tone?: 'glass' | 'dark';
  style?: React.CSSProperties;
}
export function Slider(props: SliderProps): JSX.Element;
