import React from 'react';

export function Segmented({ items = [], value, onChange, tone = 'glass', style, ...rest }) {
  const dark = tone === 'dark';
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', ...style }} {...rest}>
      {items.map(it => {
        const item = typeof it === 'string' ? { id: it, label: it } : it;
        const active = item.id === value;
        return (
          <button key={item.id} onClick={() => onChange && onChange(item.id)}
            style={{
              height: 34, padding: '0 16px', borderRadius: 'var(--radius-pill)', cursor: 'pointer',
              font: 'var(--type-body-sm)', letterSpacing: 'var(--tracking-tight)',
              background: active ? (dark ? 'var(--cream-25)' : 'var(--surface-solid)') : (dark ? 'var(--glass-dark)' : 'var(--glass-light)'),
              color: active ? 'var(--text-primary)' : (dark ? 'var(--text-on-dark-muted)' : 'var(--text-secondary)'),
              border: active ? '1px solid transparent' : (dark ? 'var(--glass-edge-dark)' : 'var(--glass-edge-light)'),
              boxShadow: active ? 'var(--shadow-sm)' : 'none',
              backdropFilter: 'var(--glass-blur-sm)', WebkitBackdropFilter: 'var(--glass-blur-sm)',
              transition: 'var(--transition-control)',
            }}>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
