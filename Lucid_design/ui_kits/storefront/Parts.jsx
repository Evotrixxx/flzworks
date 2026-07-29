/* eslint-disable */
window.Kit = window.Kit || {};
(function () {
  const { Badge, IconButton } = window.DS;

  /* Imagery placeholder — this system ships no product photography. */
  function Shot({ label = 'product shot', ratio = '4 / 5', radius = 'var(--radius-md)', style }) {
    return (
      <div style={{
        aspectRatio: ratio, borderRadius: radius, position: 'relative', overflow: 'hidden',
        background: 'repeating-linear-gradient(135deg, color-mix(in srgb, #14120F 7%, transparent) 0 8px, transparent 8px 16px), var(--backdrop-studio)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', ...style,
      }}>
        <span style={{
          font: 'var(--type-caption)', letterSpacing: 'var(--tracking-caption)', textTransform: 'uppercase',
          color: 'var(--text-muted)', background: 'var(--glass-light-strong)', padding: '5px 10px',
          borderRadius: 'var(--radius-pill)', backdropFilter: 'var(--glass-blur-sm)',
        }}>{label}</span>
      </div>
    );
  }

  function Wordmark({ tone = 'ink', size = 15 }) {
    const dark = tone === 'ink';
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 3, height: 30, padding: '0 14px',
        borderRadius: 'var(--radius-pill)',
        background: dark ? 'var(--surface-inverse)' : 'var(--glass-light)',
        border: dark ? '1px solid transparent' : 'var(--glass-edge-light)',
        color: dark ? 'var(--text-on-dark)' : 'var(--text-primary)',
        font: `700 ${size}px/1 var(--font-display)`, letterSpacing: '-0.03em',
        boxShadow: 'var(--shadow-sm)',
      }}>LUCID<sup style={{ font: 'var(--type-caption)', opacity: 0.6 }}>®</sup></span>
    );
  }

  function Spec({ label, lines = [] }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase' }}>{label}</span>
        {lines.map((l, i) => (
          <span key={i} style={{ font: 'var(--type-meta)', color: 'var(--text-secondary)' }}>{l}</span>
        ))}
      </div>
    );
  }

  window.Kit.Shot = Shot;
  window.Kit.Wordmark = Wordmark;
  window.Kit.Spec = Spec;
})();
