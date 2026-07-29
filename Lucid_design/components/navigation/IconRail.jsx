import React from 'react';
import { Glyph } from '../core/IconButton.jsx';

export function IconRail({ items = [], value, onChange, footer, tone = 'glass', style, ...rest }) {
  const dark = tone === 'dark';
  return (
    <nav style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 8,
      borderRadius: 'var(--radius-pill)',
      background: dark ? 'var(--glass-dark)' : 'var(--glass-light)',
      border: dark ? 'var(--glass-edge-dark)' : 'var(--glass-edge-light)',
      boxShadow: dark ? 'var(--glass-inner-dark), var(--shadow-md)' : 'var(--glass-inner-light), var(--shadow-md)',
      backdropFilter: 'var(--glass-blur-lg)', WebkitBackdropFilter: 'var(--glass-blur-lg)',
      ...style,
    }} {...rest}>
      {items.map(it => {
        const item = typeof it === 'string' ? { id: it, icon: it } : it;
        const active = item.id === value;
        return (
          <button key={item.id} aria-label={item.label || item.id} onClick={() => onChange && onChange(item.id)}
            style={{
              width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 999, border: 'none', cursor: 'pointer', transition: 'var(--transition-control)',
              background: active ? (dark ? 'var(--cream-25)' : 'var(--surface-inverse)') : 'transparent',
              color: active ? (dark ? 'var(--ink-900)' : 'var(--text-on-dark)') : (dark ? 'var(--text-on-dark-muted)' : 'var(--text-secondary)'),
              boxShadow: active ? 'var(--shadow-sm)' : 'none',
            }}>
            <Glyph name={item.icon} size={17} />
          </button>
        );
      })}
      {footer && <div style={{ marginTop: 6, paddingTop: 6, borderTop: dark ? '1px solid var(--border-on-dark)' : '1px solid var(--border-hairline)', width: '100%', display: 'flex', justifyContent: 'center' }}>{footer}</div>}
    </nav>
  );
}
