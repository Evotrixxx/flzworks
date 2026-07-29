import React from 'react';

export function Switch({ checked, onChange, label, disabled, size = 'md', style, ...rest }) {
  const w = size === 'sm' ? 38 : 50, h = size === 'sm' ? 22 : 28, k = h - 6;
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1, ...style }}>
      <button type="button" role="switch" aria-checked={!!checked} disabled={disabled}
        onClick={() => onChange && onChange(!checked)}
        style={{
          width: w, height: h, padding: 3, borderRadius: 'var(--radius-pill)', border: 'none', cursor: 'inherit',
          background: checked ? 'var(--surface-inverse)' : 'var(--glass-light)',
          boxShadow: checked ? 'var(--shadow-sm)' : 'var(--glass-inner-light), inset 0 0 0 1px color-mix(in srgb, #FFF 45%, transparent)',
          backdropFilter: 'var(--glass-blur-sm)', WebkitBackdropFilter: 'var(--glass-blur-sm)',
          display: 'flex', justifyContent: checked ? 'flex-end' : 'flex-start',
          transition: 'background var(--dur-med) var(--ease-glass)',
        }} {...rest}>
        <span style={{ width: k, height: k, borderRadius: 999, background: checked ? 'var(--cream-25)' : 'var(--white)',
          boxShadow: 'var(--shadow-sm)', transition: 'all var(--dur-med) var(--ease-glass)' }} />
      </button>
      {label && <span style={{ font: 'var(--type-body-sm)' }}>{label}</span>}
    </label>
  );
}
