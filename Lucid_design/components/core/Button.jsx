import React from 'react';

const SIZES = {
  sm: { h: 'var(--control-h-sm)', px: 14, font: 'var(--type-label)', tracking: 'var(--tracking-label)' },
  md: { h: 'var(--control-h-md)', px: 20, font: 'var(--type-button)', tracking: 'var(--tracking-tight)' },
  lg: { h: 'var(--control-h-lg)', px: 28, font: 'var(--type-button)', tracking: 'var(--tracking-tight)' },
};

const VARIANTS = {
  ink: { bg: 'var(--surface-inverse)', color: 'var(--text-on-dark)', border: '1px solid transparent', shadow: 'var(--shadow-md)', hover: 'var(--ink-700)' },
  cream: { bg: 'var(--surface-solid)', color: 'var(--text-primary)', border: '1px solid transparent', shadow: 'var(--shadow-md)', hover: 'var(--cream-25)' },
  glass: { bg: 'var(--glass-light)', color: 'var(--text-primary)', border: 'var(--glass-edge-light)', shadow: 'var(--shadow-sm), var(--glass-inner-light)', hover: 'var(--glass-light-strong)' },
  glassDark: { bg: 'var(--glass-dark)', color: 'var(--text-on-dark)', border: 'var(--glass-edge-dark)', shadow: 'var(--shadow-sm), var(--glass-inner-dark)', hover: 'var(--glass-dark-strong)' },
  ghost: { bg: 'transparent', color: 'var(--text-secondary)', border: '1px solid transparent', shadow: 'none', hover: 'var(--surface-sunken)' },
};

export function Button({
  variant = 'ink', size = 'md', icon, iconRight, block, disabled,
  uppercase, style, children, ...rest
}) {
  const s = SIZES[size] || SIZES.md;
  const v = VARIANTS[variant] || VARIANTS.ink;
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const glassy = variant === 'glass' || variant === 'glassDark';
  return (
    <button
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        display: block ? 'flex' : 'inline-flex', width: block ? '100%' : undefined,
        alignItems: 'center', justifyContent: 'center', gap: 8,
        height: s.h, padding: `0 ${s.px}px`, borderRadius: 'var(--radius-pill)',
        font: uppercase ? 'var(--type-label)' : s.font,
        letterSpacing: uppercase ? 'var(--tracking-label)' : s.tracking,
        textTransform: uppercase ? 'uppercase' : 'none',
        background: hover && !disabled ? v.hover : v.bg,
        color: v.color, border: v.border, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        boxShadow: press ? 'var(--shadow-inset-press)' : v.shadow,
        transform: press ? 'scale(0.975)' : 'scale(1)',
        transition: 'var(--transition-control)',
        backdropFilter: glassy ? 'var(--glass-blur-md)' : undefined,
        WebkitBackdropFilter: glassy ? 'var(--glass-blur-md)' : undefined,
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {icon}{children}{iconRight}
    </button>
  );
}
