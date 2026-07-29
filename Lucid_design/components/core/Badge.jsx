import React from 'react';

const TONES = {
  glass: { bg: 'var(--glass-light)', color: 'var(--text-primary)', border: 'var(--glass-edge-light)' },
  ink: { bg: 'var(--surface-inverse)', color: 'var(--text-on-dark)', border: '1px solid transparent' },
  cream: { bg: 'var(--surface-solid)', color: 'var(--text-primary)', border: '1px solid transparent' },
  outline: { bg: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-hairline)' },
  positive: { bg: 'color-mix(in oklab, var(--status-positive) 22%, transparent)', color: 'var(--ink-900)', border: '1px solid color-mix(in oklab, var(--status-positive) 40%, transparent)' },
  caution: { bg: 'color-mix(in oklab, var(--status-caution) 26%, transparent)', color: 'var(--ink-900)', border: '1px solid color-mix(in oklab, var(--status-caution) 44%, transparent)' },
};

export function Badge({ tone = 'glass', dot, children, style, ...rest }) {
  const t = TONES[tone] || TONES.glass;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, height: 22, padding: '0 10px',
      borderRadius: 'var(--radius-pill)', background: t.bg, color: t.color, border: t.border,
      font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', whiteSpace: 'nowrap',
      backdropFilter: tone === 'glass' ? 'var(--glass-blur-sm)' : undefined,
      WebkitBackdropFilter: tone === 'glass' ? 'var(--glass-blur-sm)' : undefined,
      ...style,
    }} {...rest}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: 999, background: 'currentColor' }} />}
      {children}
    </span>
  );
}
