import React from 'react';

const RING = ['var(--accent-warm)', 'var(--accent-cool)', 'var(--sand-200)', 'var(--stone-400)', 'var(--cream-50)'];

export function AvatarStack({ people = [], size = 34, max = 5, onAdd, tone = 'light', style, ...rest }) {
  const shown = people.slice(0, max);
  const onDark = tone === 'dark';
  return (
    <div style={{ display: 'flex', alignItems: 'center', ...style }} {...rest}>
      {shown.map((p, i) => {
        const person = typeof p === 'string' ? { name: p } : p;
        const initials = (person.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('');
        return (
          <span key={i} title={person.name} style={{
            width: size, height: size, marginLeft: i ? -size * 0.3 : 0, borderRadius: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: person.color || RING[i % RING.length],
            border: `2px solid ${onDark ? 'var(--ink-800)' : 'var(--white)'}`,
            font: 'var(--type-caption)', letterSpacing: 0, color: 'var(--ink-900)',
            boxShadow: 'var(--shadow-sm)', zIndex: shown.length - i, textTransform: 'uppercase',
          }}>{initials}</span>
        );
      })}
      {onAdd && (
        <button onClick={onAdd} aria-label="Add person" style={{
          width: size, height: size, marginLeft: -size * 0.3, borderRadius: 999, cursor: 'pointer',
          background: onDark ? 'var(--glass-dark)' : 'var(--glass-light)',
          border: onDark ? 'var(--glass-edge-dark)' : 'var(--glass-edge-light)',
          color: onDark ? 'var(--text-on-dark)' : 'var(--text-primary)',
          backdropFilter: 'var(--glass-blur-sm)', WebkitBackdropFilter: 'var(--glass-blur-sm)',
          font: 'var(--type-body-sm)', lineHeight: 1, boxShadow: 'var(--shadow-sm)',
        }}>+</button>
      )}
    </div>
  );
}
