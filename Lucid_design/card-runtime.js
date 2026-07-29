/* Resolves the compiled design-system bundle onto window.DS.
   If the bundle hasn't been generated yet, falls back to transpiling the component
   sources in-browser with Babel standalone so cards and UI kits still render. */
(function () {
  const NAMES = [
    'GlassPanel', 'Button', 'IconButton', 'Glyph', 'Badge', 'Card',
    'Input', 'Select', 'Switch', 'Checkbox', 'Slider',
    'NavPills', 'IconRail', 'Segmented',
    'StatBlock', 'ProgressRing', 'AvatarStack',
  ];
  const FILES = [
    { p: 'components/core/GlassPanel.jsx', e: ['GlassPanel'] },
    { p: 'components/core/IconButton.jsx', e: ['IconButton', 'Glyph'] },
    { p: 'components/core/Button.jsx', e: ['Button'] },
    { p: 'components/core/Badge.jsx', e: ['Badge'] },
    { p: 'components/core/Card.jsx', e: ['Card'] },
    { p: 'components/forms/Input.jsx', e: ['Input'] },
    { p: 'components/forms/Select.jsx', e: ['Select'] },
    { p: 'components/forms/Switch.jsx', e: ['Switch'] },
    { p: 'components/forms/Checkbox.jsx', e: ['Checkbox'] },
    { p: 'components/forms/Slider.jsx', e: ['Slider'] },
    { p: 'components/navigation/NavPills.jsx', e: ['NavPills'] },
    { p: 'components/navigation/IconRail.jsx', e: ['IconRail'] },
    { p: 'components/navigation/Segmented.jsx', e: ['Segmented'] },
    { p: 'components/data/StatBlock.jsx', e: ['StatBlock'] },
    { p: 'components/data/ProgressRing.jsx', e: ['ProgressRing'] },
    { p: 'components/data/AvatarStack.jsx', e: ['AvatarStack'] },
  ];

  function fromBundle() {
    const named = ['LiquidGlass', 'LiquidGlassDesignExploration', 'Lucid', 'LucidDesignSystem', 'DesignSystem'];
    for (const k of named) { const v = window[k]; if (v && v.GlassPanel) return v; }
    for (const k in window) {
      try { const v = window[k]; if (v && typeof v === 'object' && v.GlassPanel && v.NavPills) return v; } catch (e) {}
    }
    return null;
  }

  function fromSource(base) {
    if (typeof Babel === 'undefined') return null;
    let src = 'var __ds = {};\n';
    for (const file of FILES) {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', base + file.p, false);
      xhr.send(null);
      if (xhr.status && xhr.status >= 400) return null;
      const body = xhr.responseText
        .replace(/^\s*import[^\n]*\n/gm, '')
        .replace(/^\s*export\s*\{[^}]*\}\s*;?\s*$/gm, '')
        .replace(/^\s*export\s+function/gm, 'function');
      /* each file gets its own scope, with previously-loaded dependencies injected —
         never inject a name the file itself defines, or the var would shadow it */
      const deps = ['GlassPanel', 'Glyph'].filter(n => file.e.indexOf(n) === -1)
        .map(n => 'var ' + n + '=__ds.' + n + ';').join(' ');
      src += 'Object.assign(__ds, (function(){ ' + deps + '\n'
        + body + '\nreturn {' + file.e.join(', ') + '};\n})());\n';
    }
    const wrapped = 'var __dsFactory = function (React) {\n' + src + '\nreturn __ds;\n};';
    const code = Babel.transform(wrapped, { presets: [['react', { runtime: 'classic' }]] }).code;
    return new Function(code + '\nreturn __dsFactory(arguments[0]);')(window.React);
  }

  const script = document.currentScript;
  const base = script ? script.src.replace(/card-runtime\.js.*$/, '') : './';
  let ds = fromBundle();
  if (!ds) {
    /* try the compiled bundle if it has been generated */
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', base + '_ds_bundle.js', false);
      xhr.send(null);
      if (xhr.status === 200 && xhr.responseText) { new Function(xhr.responseText)(); ds = fromBundle(); }
    } catch (e) {}
  }
  if (!ds) {
    try { ds = fromSource(base); } catch (e) { console.warn('[lucid] source fallback failed', e && (e.message || e.reasonCode) || e); }
  }
  if (!ds) console.warn('[lucid] design-system components unavailable');
  window.DS = ds || {};

  /* Loads sibling JSX files (relative to the current document) as classic scripts.
     Use this instead of <script type="text/babel" src>: Babel standalone defaults to the
     automatic JSX runtime, whose injected import breaks in a non-module script. */
  window.DSLoad = function (paths) {
    for (const p of [].concat(paths)) {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', p, false);
      xhr.send(null);
      const body = xhr.responseText
        .replace(/^\s*import[^\n]*\n/gm, '')
        .replace(/^\s*export\s*\{[^}]*\}\s*;?\s*$/gm, '')
        .replace(/^\s*export\s+function/gm, 'function');
      const code = Babel.transform('(function (React, DS) {\n' + body + '\n})',
        { presets: [['react', { runtime: 'classic' }]] }).code;
      new Function('return ' + code)()(window.React, window.DS);
    }
  };

  window.DSMount = function (component, el) {
    ReactDOM.createRoot(el || document.getElementById('root')).render(React.createElement(component));
  };
})();
