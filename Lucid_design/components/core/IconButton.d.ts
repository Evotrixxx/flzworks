import * as React from 'react';

/**
 * Circular icon action. Carries the system's built-in 1.4px stroke glyph set.
 * @startingPoint section="Controls" subtitle="Circular icon buttons and the stroke glyph set" viewport="700x150"
 */
export type GlyphName = 'plus' | 'arrow' | 'arrowRight' | 'close' | 'search' | 'dots' | 'check'
  | 'chevronDown' | 'chevronRight' | 'globe' | 'bolt' | 'spark' | 'home' | 'wallet' | 'circle' | 'exit';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  name?: GlyphName;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'ink' | 'cream' | 'glass' | 'glassDark' | 'outline';
  /** accessible label; falls back to the glyph name */
  label?: string;
  /** pass a custom node to override the built-in glyph */
  children?: React.ReactNode;
}
export function IconButton(props: IconButtonProps): JSX.Element;
export function Glyph(props: { name?: GlyphName; size?: number; strokeWidth?: number }): JSX.Element;
