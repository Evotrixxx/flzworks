import React from 'react';
import { Glyph } from '../core/IconButton.jsx';

export function Select({ label, options = [], value, onChange, tone = 'glass', style, ...rest }) {
  const dark = tone === 'dark';
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && (
        <span style={{ font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase',
          color: dark ? 'var(--text-on-dark-muted)' : 'var(--text-muted)' }}>{label}</span>
      )}
      <span style={{
        position: 'relative', display: 'flex', alignItems: 'center',
        height: 'var(--control-h-lg)', padding: '0 18px', borderRadius: 'var(--radius-pill)',
        background: dark ? 'var(--glass-dark)' : 'var(--glass-light)',
        border: dark ? 'var(--glass-edge-dark)' : 'var(--glass-edge-light)',
        boxShadow: dark ? 'var(--glass-inner-dark)' : 'var(--glass-inner-light)',
        backdropFilter: 'var(--glass-blur-md)', WebkitBackdropFilter: 'var(--glass-blur-md)',
        color: dark ? 'var(--text-on-dark)' : 'var(--text-primary)',
      }}>
        <select value={value} onChange={onChange}
          style={{ appearance: 'none', border: 'none', outline: 'none', background: 'transparent',
            font: 'var(--type-body)', color: 'inherit', flex: 1, paddingRight: 22, cursor: 'pointer' }}
          {...rest}>
          {options.map(o => {
            const opt = typeof o === 'string' ? { value: o, label: o } : o;
            return <option key={opt.value} value={opt.value}>{opt.label}</option>;
          })}
        </select>
        <span style={{ position: 'absolute', right: 16, display: 'flex', pointerEvents: 'none', opacity: 0.6 }}>
          <Glyph name="chevronDown" size={14} />
        </span>
      </span>
    </label>
  );
}
