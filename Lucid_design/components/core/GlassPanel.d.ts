import * as React from 'react';

/**
 * The substrate of the entire system: a translucent, blurred, specular-lit surface.
 * Every other surface in Lucid is a GlassPanel or a solid capsule sitting on one.
 * @startingPoint section="Surfaces" subtitle="Glass surface primitive with tint, blur and specular sheen" viewport="700x260"
 */
export interface GlassPanelProps extends React.HTMLAttributes<HTMLElement> {
  /** light = frosted white (default), clear = barely-there, dark = smoked, solid/ink = opaque capsules */
  tone?: 'light' | 'clear' | 'dark' | 'solid' | 'ink';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  /** any CSS length or var(); defaults to var(--radius-lg) */
  radius?: string;
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'float';
  /** top-edge specular highlight; turn off only for tiny nested surfaces */
  specular?: boolean;
  padding?: string | number;
  as?: keyof JSX.IntrinsicElements;
}
export function GlassPanel(props: GlassPanelProps): JSX.Element;
