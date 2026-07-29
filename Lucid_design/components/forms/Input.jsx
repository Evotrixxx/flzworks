import React from 'react';

export function Input({ label, hint, icon, tone = 'glass', invalid, style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const dark = tone === 'dark';
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && (
        <span style={{ font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase',
          color: dark ? 'var(--text-on-dark-muted)' : 'var(--text-muted)' }}>{label}</span>
      )}
      <span style={{
        display: 'flex', alignItems: 'center', gap: 10, height: 'var(--control-h-lg)', padding: '0 18px',
        borderRadius: 'var(--radius-pill)',
        background: dark ? 'var(--glass-dark)' : 'var(--glass-light)',
        border: invalid ? '1px solid var(--status-critical)' : (dark ? 'var(--glass-edge-dark)' : 'var(--glass-edge-light)'),
        boxShadow: focus ? '0 0 0 3px color-mix(in srgb, var(--accent-warm) 45%, transparent), var(--glass-inner-light)'
                         : (dark ? 'var(--glass-inner-dark)' : 'var(--glass-inner-light)'),
        backdropFilter: 'var(--glass-blur-md)', WebkitBackdropFilter: 'var(--glass-blur-md)',
        transition: 'box-shadow var(--dur-med) var(--ease-glass)',
      }}>
        {icon && <span style={{ display: 'flex', color: dark ? 'var(--text-on-dark-muted)' : 'var(--text-muted)' }}>{icon}</span>}
        <input
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
            font: 'var(--type-body)', letterSpacing: 'var(--tracking-tight)',
            color: dark ? 'var(--text-on-dark)' : 'var(--text-primary)',
          }}
          {...rest}
        />
      </span>
      {hint && <span style={{ font: 'var(--type-meta)', color: invalid ? 'var(--status-critical)' : 'var(--text-muted)', paddingLeft: 18 }}>{hint}</span>}
    </label>
  );
}
