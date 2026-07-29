import React from 'react';
import { Glyph } from '../core/IconButton.jsx';

export function Checkbox({ checked, onChange, label, round, disabled, style, ...rest }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1, ...style }}>
      <button type="button" role="checkbox" aria-checked={!!checked} disabled={disabled}
        onClick={() => onChange && onChange(!checked)}
        style={{
          width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: round ? 999 : 'var(--radius-xs)', cursor: 'inherit',
          background: checked ? 'var(--surface-inverse)' : 'var(--glass-light)',
          border: checked ? '1px solid transparent' : 'var(--glass-edge-light)',
          color: 'var(--text-on-dark)',
          boxShadow: checked ? 'var(--shadow-sm)' : 'var(--glass-inner-light)',
          backdropFilter: 'var(--glass-blur-sm)', WebkitBackdropFilter: 'var(--glass-blur-sm)',
          transition: 'var(--transition-control)', padding: 0,
        }} {...rest}>
        {checked && <Glyph name="check" size={12} strokeWidth={1.8} />}
      </button>
      {label && <span style={{ font: 'var(--type-body-sm)' }}>{label}</span>}
    </label>
  );
}
