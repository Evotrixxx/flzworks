import React from 'react';

const TINT = {
  light: { bg: 'var(--glass-light)', border: 'var(--glass-edge-light)', inner: 'var(--glass-inner-light)', color: 'var(--text-primary)' },
  clear: { bg: 'var(--glass-mid)', border: 'var(--glass-edge-mid)', inner: 'var(--glass-inner-light)', color: 'var(--text-primary)' },
  dark: { bg: 'var(--glass-dark)', border: 'var(--glass-edge-dark)', inner: 'var(--glass-inner-dark)', color: 'var(--text-on-dark)' },
  solid: { bg: 'var(--surface-solid)', border: '1px solid var(--border-hairline)', inner: 'none', color: 'var(--text-primary)' },
  ink: { bg: 'var(--surface-inverse)', border: '1px solid var(--border-on-dark)', inner: 'none', color: 'var(--text-on-dark)' },
};
const BLUR = { sm: 'var(--glass-blur-sm)', md: 'var(--glass-blur-md)', lg: 'var(--glass-blur-lg)', xl: 'var(--glass-blur-xl)' };
const ELEV = { none: 'none', sm: 'var(--shadow-sm)', md: 'var(--shadow-md)', lg: 'var(--shadow-lg)', float: 'var(--shadow-float)' };

export function GlassPanel({
  tone = 'light', blur = 'lg', radius = 'var(--radius-lg)', elevation = 'md',
  specular = true, padding, as = 'div', style, children, ...rest
}) {
  const t = TINT[tone] || TINT.light;
  const Tag = as;
  const glassy = tone !== 'solid' && tone !== 'ink';
  return (
    <Tag
      style={{
        position: 'relative',
        borderRadius: radius,
        background: t.bg,
        border: t.border,
        color: t.color,
        padding: padding,
        backdropFilter: glassy ? BLUR[blur] : undefined,
        WebkitBackdropFilter: glassy ? BLUR[blur] : undefined,
        boxShadow: [ELEV[elevation], glassy ? t.inner : ''].filter(Boolean).join(', '),
        overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      {specular && glassy && (
        <span aria-hidden style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit',
          background: 'var(--glass-specular)', opacity: tone === 'dark' ? 0.4 : 0.9,
          pointerEvents: 'none', mixBlendMode: 'screen',
        }} />
      )}
      {children}
    </Tag>
  );
}
