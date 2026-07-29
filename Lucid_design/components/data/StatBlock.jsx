import React from 'react';

export function StatBlock({ label, value, unit, sub, align = 'left', tone = 'light', size = 'md', style, ...rest }) {
  const onDark = tone === 'dark';
  const font = size === 'lg' ? 'var(--type-numeric-xl)' : size === 'sm' ? 'var(--type-title)' : 'var(--type-display-md)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: align === 'right' ? 'flex-end' : 'flex-start', ...style }} {...rest}>
      {label && <span style={{ font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase',
        color: onDark ? 'var(--text-on-dark-muted)' : 'var(--text-muted)' }}>{label}</span>}
      <span style={{ display: 'flex', alignItems: 'flex-start', gap: 2, font, letterSpacing: 'var(--tracking-display)',
        color: onDark ? 'var(--text-on-dark)' : 'var(--text-primary)' }}>
        {value}
        {unit && <sup style={{ font: 'var(--type-meta)', marginTop: 4, opacity: 0.7 }}>{unit}</sup>}
      </span>
      {sub && <span style={{ font: 'var(--type-meta)', color: onDark ? 'var(--text-on-dark-muted)' : 'var(--text-secondary)' }}>{sub}</span>}
    </div>
  );
}
