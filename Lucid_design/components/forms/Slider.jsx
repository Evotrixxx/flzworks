import React from 'react';

export function Slider({ value = 50, min = 0, max = 100, step = 1, onChange, label, suffix, tone = 'glass', style }) {
  const pct = ((value - min) / (max - min)) * 100;
  const dark = tone === 'dark';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, ...style }}>
      {(label || suffix) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          {label && <span style={{ font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase',
            color: dark ? 'var(--text-on-dark-muted)' : 'var(--text-muted)' }}>{label}</span>}
          {suffix && <span style={{ font: 'var(--type-meta)', color: dark ? 'var(--text-on-dark)' : 'var(--text-secondary)' }}>{suffix}</span>}
        </div>
      )}
      <div style={{ position: 'relative', height: 10, borderRadius: 999,
        background: dark ? 'var(--glass-dark)' : 'var(--glass-light)',
        border: dark ? 'var(--glass-edge-dark)' : 'var(--glass-edge-light)',
        boxShadow: dark ? 'var(--glass-inner-dark)' : 'var(--glass-inner-light)',
        backdropFilter: 'var(--glass-blur-sm)', WebkitBackdropFilter: 'var(--glass-blur-sm)' }}>
        <div style={{ position: 'absolute', inset: 1, right: `calc(${100 - pct}% + 1px)`, borderRadius: 999,
          background: dark ? 'var(--cream-25)' : 'var(--surface-inverse)' }} />
        <div style={{ position: 'absolute', top: -5, left: `calc(${pct}% - 10px)`, width: 20, height: 20, borderRadius: 999,
          background: 'var(--white)', boxShadow: 'var(--shadow-md)', border: '1px solid color-mix(in srgb, #FFF 70%, transparent)' }} />
        <input type="range" value={value} min={min} max={max} step={step}
          onChange={e => onChange && onChange(Number(e.target.value))}
          style={{ position: 'absolute', inset: -6, width: '100%', opacity: 0, cursor: 'pointer', margin: 0 }} />
      </div>
    </div>
  );
}
