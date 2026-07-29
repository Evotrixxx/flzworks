import React from 'react';

export function ProgressRing({ value = 60, size = 96, thickness = 10, label, unit, tone = 'light', accent, style, ...rest }) {
  const onDark = tone === 'dark';
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, ...style }} {...rest}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={thickness}
          stroke={onDark ? 'color-mix(in srgb, #FFF 16%, transparent)' : 'color-mix(in srgb, #14120F 12%, transparent)'} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={thickness} strokeLinecap="round"
          stroke={accent || (onDark ? 'var(--cream-25)' : 'var(--ink-900)')}
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)}
          style={{ transition: 'stroke-dashoffset var(--dur-slow) var(--ease-glass)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <span style={{ display: 'flex', alignItems: 'flex-start', font: 'var(--type-subtitle)',
          letterSpacing: 'var(--tracking-display)', color: onDark ? 'var(--text-on-dark)' : 'var(--text-primary)' }}>
          {value}{unit && <sup style={{ font: 'var(--type-caption)', marginTop: 2, opacity: 0.7 }}>{unit}</sup>}
        </span>
        {label && <span style={{ font: 'var(--type-caption)', letterSpacing: 'var(--tracking-caption)', textTransform: 'uppercase',
          color: onDark ? 'var(--text-on-dark-muted)' : 'var(--text-muted)' }}>{label}</span>}
      </div>
    </div>
  );
}
