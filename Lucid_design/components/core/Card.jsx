import React from 'react';
import { GlassPanel } from './GlassPanel.jsx';

export function Card({ eyebrow, title, meta, media, footer, tone = 'light', children, style, ...rest }) {
  const onDark = tone === 'dark' || tone === 'ink';
  return (
    <GlassPanel tone={tone} radius="var(--radius-lg)" elevation="lg"
      style={{ display: 'flex', flexDirection: 'column', ...style }} {...rest}>
      {media && <div style={{ position: 'relative', overflow: 'hidden' }}>{media}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 'var(--panel-pad)' }}>
        {eyebrow && (
          <span style={{ font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase',
            color: onDark ? 'var(--text-on-dark-muted)' : 'var(--text-muted)' }}>{eyebrow}</span>
        )}
        {title && <h3 style={{ margin: 0, font: 'var(--type-title)', letterSpacing: 'var(--tracking-display)' }}>{title}</h3>}
        {children}
        {meta && (
          <span style={{ font: 'var(--type-meta)', color: onDark ? 'var(--text-on-dark-muted)' : 'var(--text-secondary)' }}>{meta}</span>
        )}
        {footer && <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>{footer}</div>}
      </div>
    </GlassPanel>
  );
}
