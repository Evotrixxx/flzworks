import React from 'react';

export function NavPills({ items = [], value, onChange, tone = 'glass', size = 'md', style, ...rest }) {
  const dark = tone === 'dark';
  const h = size === 'sm' ? 30 : 38;
  return (
    <div role="tablist" style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, padding: 4, borderRadius: 'var(--radius-pill)',
      background: dark ? 'var(--glass-dark)' : 'var(--glass-light)',
      border: dark ? 'var(--glass-edge-dark)' : 'var(--glass-edge-light)',
      boxShadow: dark ? 'var(--glass-inner-dark), var(--shadow-sm)' : 'var(--glass-inner-light), var(--shadow-sm)',
      backdropFilter: 'var(--glass-blur-lg)', WebkitBackdropFilter: 'var(--glass-blur-lg)',
      ...style,
    }} {...rest}>
      {items.map(it => {
        const item = typeof it === 'string' ? { id: it, label: it } : it;
        const active = item.id === value;
        return (
          <button key={item.id} role="tab" aria-selected={active} onClick={() => onChange && onChange(item.id)}
            style={{
              height: h, padding: '0 18px', borderRadius: 'var(--radius-pill)', border: 'none', cursor: 'pointer',
              font: 'var(--type-button)', letterSpacing: 'var(--tracking-tight)', whiteSpace: 'nowrap',
              background: active ? (dark ? 'var(--cream-25)' : 'var(--surface-solid)') : 'transparent',
              color: active ? 'var(--text-primary)' : (dark ? 'var(--text-on-dark-muted)' : 'var(--text-secondary)'),
              boxShadow: active ? 'var(--shadow-sm)' : 'none',
              transition: 'var(--transition-control)',
            }}>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
