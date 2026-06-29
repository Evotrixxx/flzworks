"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Each "style" is a theme: a set of CSS custom properties that re-skin the SAME
// standardized board of elements below. Switch styles with the arrows to compare
// how each design language treats identical components.
// ─────────────────────────────────────────────────────────────────────────────
interface Theme {
  id: string;
  name: string;
  tagline: string;
  tags: string[];
  accent: string;
  glow: string;
  /** CSS custom properties applied to the preview, consumed by the board CSS. */
  vars: Record<string, string>;
}

const THEMES: Theme[] = [
  {
    id: "lucent-ui",
    name: "Lucent UI",
    tagline: "Liquid Glass Asset Library",
    tags: ["Glassmorphism", "Saturated Blur", "Dark Mode", "Syne"],
    accent: "#d1b894",
    glow: "rgba(209, 184, 148, 0.4)",
    vars: {
      "--ds-bg": "radial-gradient(ellipse 90% 70% at 50% 0%, #16140f 0%, #070709 60%)",
      "--ds-surface": "rgba(13, 13, 17, 0.65)",
      "--ds-surface-2": "rgba(255, 255, 255, 0.05)",
      "--ds-border": "rgba(255, 255, 255, 0.10)",
      "--ds-border-2": "rgba(255, 255, 255, 0.20)",
      "--ds-text": "#ffffff",
      "--ds-sub": "#a1a1aa",
      "--ds-accent": "#d1b894",
      "--ds-accent-ink": "#070709",
      "--ds-glow": "rgba(209, 184, 148, 0.4)",
      "--ds-radius": "12px",
      "--ds-radius-lg": "20px",
      "--ds-blur": "24px",
      "--ds-saturate": "160%",
      "--ds-shadow": "0 20px 50px rgba(0,0,0,0.5)",
      "--ds-font": "'Outfit', system-ui, sans-serif",
      "--ds-font-display": "'Syne', sans-serif",
      "--ds-ease": "cubic-bezier(0.16, 1, 0.3, 1)",
    },
  },
  {
    id: "liquid-glass",
    name: "Liquid Glass Player",
    tagline: "Frosted Music Interface",
    tags: ["Glassmorphism", "Ultra-round", "Springy", "Blur"],
    accent: "#a78bfa",
    glow: "rgba(167, 139, 250, 0.4)",
    vars: {
      "--ds-bg": "radial-gradient(ellipse 80% 80% at 70% 20%, #1c1530 0%, #0d0e12 65%)",
      "--ds-surface": "rgba(255, 255, 255, 0.08)",
      "--ds-surface-2": "rgba(255, 255, 255, 0.10)",
      "--ds-border": "rgba(255, 255, 255, 0.18)",
      "--ds-border-2": "rgba(255, 255, 255, 0.32)",
      "--ds-text": "#ffffff",
      "--ds-sub": "rgba(255, 255, 255, 0.6)",
      "--ds-accent": "#a78bfa",
      "--ds-accent-ink": "#1a1030",
      "--ds-glow": "rgba(167, 139, 250, 0.4)",
      "--ds-radius": "18px",
      "--ds-radius-lg": "28px",
      "--ds-blur": "30px",
      "--ds-saturate": "120%",
      "--ds-shadow": "0 20px 50px rgba(0,0,0,0.35), 0 0 80px rgba(255,255,255,0.04)",
      "--ds-font": "'Outfit', system-ui, sans-serif",
      "--ds-font-display": "'Outfit', sans-serif",
      "--ds-ease": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    },
  },
  {
    id: "dynamic-island",
    name: "Dynamic Island HUD",
    tagline: "Fluid Morphing Interface",
    tags: ["iOS HUD", "Pill Shapes", "Spring", "Micro-alerts"],
    accent: "#34d399",
    glow: "rgba(52, 211, 153, 0.4)",
    vars: {
      "--ds-bg": "radial-gradient(ellipse 70% 60% at 50% 30%, #0a1410 0%, #000000 60%)",
      "--ds-surface": "rgba(18, 18, 20, 0.85)",
      "--ds-surface-2": "rgba(255, 255, 255, 0.08)",
      "--ds-border": "rgba(255, 255, 255, 0.08)",
      "--ds-border-2": "rgba(255, 255, 255, 0.16)",
      "--ds-text": "#ffffff",
      "--ds-sub": "rgba(255, 255, 255, 0.5)",
      "--ds-accent": "#34d399",
      "--ds-accent-ink": "#00130c",
      "--ds-glow": "rgba(52, 211, 153, 0.4)",
      "--ds-radius": "999px",
      "--ds-radius-lg": "30px",
      "--ds-blur": "18px",
      "--ds-saturate": "140%",
      "--ds-shadow": "0 16px 40px rgba(0,0,0,0.6)",
      "--ds-font": "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
      "--ds-font-display": "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
      "--ds-ease": "cubic-bezier(0.34, 1.56, 0.64, 1)",
    },
  },
  {
    id: "control-center",
    name: "iOS Control Center",
    tagline: "Tactile Toggles & Sliders",
    tags: ["iOS Control", "Frosted Glass", "Tiles", "System Font"],
    accent: "#60a5fa",
    glow: "rgba(96, 165, 250, 0.4)",
    vars: {
      "--ds-bg": "linear-gradient(135deg, #243049 0%, #0f1622 70%)",
      "--ds-surface": "rgba(255, 255, 255, 0.12)",
      "--ds-surface-2": "rgba(255, 255, 255, 0.16)",
      "--ds-border": "rgba(255, 255, 255, 0.18)",
      "--ds-border-2": "rgba(255, 255, 255, 0.28)",
      "--ds-text": "#ffffff",
      "--ds-sub": "rgba(255, 255, 255, 0.65)",
      "--ds-accent": "#60a5fa",
      "--ds-accent-ink": "#04122b",
      "--ds-glow": "rgba(96, 165, 250, 0.4)",
      "--ds-radius": "16px",
      "--ds-radius-lg": "22px",
      "--ds-blur": "30px",
      "--ds-saturate": "180%",
      "--ds-shadow": "0 16px 44px rgba(0,0,0,0.4)",
      "--ds-font": "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
      "--ds-font-display": "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
      "--ds-ease": "cubic-bezier(0.32, 0.72, 0, 1)",
    },
  },
  {
    id: "widget-space",
    name: "iOS Widget Space",
    tagline: "Frosted Desktop Widgets",
    tags: ["iOS Widgets", "Soft Frost", "Rounded", "Home Screen"],
    accent: "#f472b6",
    glow: "rgba(244, 114, 182, 0.4)",
    vars: {
      "--ds-bg": "linear-gradient(160deg, #2c2030 0%, #161019 70%)",
      "--ds-surface": "rgba(255, 255, 255, 0.10)",
      "--ds-surface-2": "rgba(255, 255, 255, 0.14)",
      "--ds-border": "rgba(255, 255, 255, 0.16)",
      "--ds-border-2": "rgba(255, 255, 255, 0.26)",
      "--ds-text": "#ffffff",
      "--ds-sub": "rgba(255, 255, 255, 0.6)",
      "--ds-accent": "#f472b6",
      "--ds-accent-ink": "#2a0418",
      "--ds-glow": "rgba(244, 114, 182, 0.4)",
      "--ds-radius": "18px",
      "--ds-radius-lg": "26px",
      "--ds-blur": "26px",
      "--ds-saturate": "150%",
      "--ds-shadow": "0 18px 46px rgba(0,0,0,0.4)",
      "--ds-font": "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
      "--ds-font-display": "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
      "--ds-ease": "cubic-bezier(0.32, 0.72, 0, 1)",
    },
  },
];

// ── Interactive bits so every themed board feels alive ──────────────────────
function Toggle({ defaultOn }: { defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      type="button"
      className={`ds-toggle ${on ? "on" : ""}`}
      onClick={() => setOn((v) => !v)}
      aria-pressed={on}
      aria-label="Toggle"
    >
      <span className="ds-knob" />
    </button>
  );
}

function Slider({ defaultValue }: { defaultValue: number }) {
  const [val, setVal] = useState(defaultValue);
  const trackRef = useRef<HTMLDivElement>(null);

  const setFromX = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
    setVal(pct);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    setFromX(e.clientX);
    const move = (ev: PointerEvent) => setFromX(ev.clientX);
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div className="ds-slider" ref={trackRef} onPointerDown={onPointerDown} role="slider" aria-valuenow={Math.round(val)} aria-valuemin={0} aria-valuemax={100} tabIndex={0}>
      <div className="ds-slider-fill" style={{ width: `${val}%` }} />
      <div className="ds-slider-thumb" style={{ left: `${val}%` }} />
    </div>
  );
}

// ── The standardized board — identical markup for every theme ───────────────
function PreviewBoard({ theme }: { theme: Theme }) {
  return (
    <div className="ds-preview" style={theme.vars as React.CSSProperties}>
      <div className="ds-panel">
        <div className="ds-panel-head">
          <div className="ds-panel-title">{theme.name}</div>
          <span className="ds-badge ds-badge-accent">Live</span>
        </div>

        {/* Buttons */}
        <div className="ds-group-label">Buttons</div>
        <div className="ds-btns">
          <button type="button" className="ds-btn ds-btn-primary">Primary</button>
          <button type="button" className="ds-btn ds-btn-secondary">Secondary</button>
          <button type="button" className="ds-btn ds-btn-ghost">Ghost</button>
        </div>

        {/* Nested card */}
        <div className="ds-card">
          <div className="ds-card-title">Card / Surface</div>
          <div className="ds-card-body">
            The panel, this card, borders, radius, blur and shadow all come from
            the active style — only the skin changes between samples.
          </div>
        </div>

        {/* Inputs */}
        <div className="ds-group-label">Inputs</div>
        <div className="ds-fields">
          <input className="ds-input" type="text" placeholder="Text input" />
          <div className="ds-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input className="ds-input ds-input-bare" type="text" placeholder="Search…" />
          </div>
        </div>

        {/* Controls */}
        <div className="ds-group-label">Controls</div>
        <div className="ds-controls">
          <div className="ds-control-row">
            <span className="ds-control-name">Notifications</span>
            <Toggle defaultOn />
          </div>
          <div className="ds-control-row">
            <span className="ds-control-name">Airplane Mode</span>
            <Toggle defaultOn={false} />
          </div>
          <div className="ds-control-row ds-slider-row">
            <span className="ds-control-name">Volume</span>
            <Slider defaultValue={64} />
          </div>
        </div>

        {/* Badges / chips */}
        <div className="ds-group-label">Badges</div>
        <div className="ds-chips">
          <span className="ds-badge ds-badge-accent">Accent</span>
          <span className="ds-badge">Default</span>
          <span className="ds-badge">New</span>
          <span className="ds-badge ds-badge-dot"><i />Active</span>
        </div>
      </div>
    </div>
  );
}

export default function UiDesignBoard() {
  const [active, setActive] = useState(0);

  const go = useCallback((dir: number) => {
    setActive((prev) => (prev + dir + THEMES.length) % THEMES.length);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const cur = THEMES[active];
  const prev = THEMES[(active - 1 + THEMES.length) % THEMES.length];
  const next = THEMES[(active + 1) % THEMES.length];

  return (
    <div
      className="ds-root"
      style={{ "--cur-accent": cur.accent, "--cur-glow": cur.glow } as React.CSSProperties}
    >
      <div
        className="ds-ambient"
        style={{ background: `radial-gradient(ellipse 55% 50% at 50% 42%, ${cur.glow}, transparent 70%)` }}
      />

      {/* Arrows */}
      <button className="ds-arrow ds-arrow-left" onClick={() => go(-1)} aria-label={`Previous — ${prev.name}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span className="ds-arrow-peek">{prev.name}</span>
      </button>
      <button className="ds-arrow ds-arrow-right" onClick={() => go(1)} aria-label={`Next — ${next.name}`}>
        <span className="ds-arrow-peek">{next.name}</span>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Sliding track of identical boards, one per theme */}
      <div className="ds-stage">
        <div className="ds-track" style={{ transform: `translateX(-${active * 100}%)` }}>
          {THEMES.map((theme, i) => (
            <div className="ds-slide" key={theme.id} aria-hidden={i !== active}>
              <PreviewBoard theme={theme} />
              <div className="ds-caption">
                <span className="ds-index">
                  {String(i + 1).padStart(2, "0")} / {String(THEMES.length).padStart(2, "0")}
                </span>
                <h1 className="ds-name" style={{ color: theme.accent }}>{theme.name}</h1>
                <p className="ds-tagline">{theme.tagline}</p>
                <div className="ds-cap-tags">
                  {theme.tags.map((t) => (
                    <span key={t} className="ds-cap-tag">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots + hint */}
      <div className="ds-dots">
        {THEMES.map((t, i) => (
          <button
            key={t.id}
            className={`ds-dot ${i === active ? "active" : ""}`}
            style={i === active ? { background: cur.accent, width: "24px" } : {}}
            onClick={() => setActive(i)}
            aria-label={`Go to ${t.name}`}
          />
        ))}
      </div>
      <div className="ds-hint"><span>&larr; &rarr;</span> compare styles</div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');

        .ds-root {
          position: relative;
          width: 100%;
          min-height: calc(100vh - 56px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #04040a;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .ds-ambient { position: absolute; inset: 0; z-index: 0; pointer-events: none; transition: background 0.7s ease; }

        /* Sliding stage */
        .ds-stage { position: relative; z-index: 5; width: 100%; overflow: hidden; }
        .ds-track {
          display: flex; width: 100%;
          transition: transform 0.6s cubic-bezier(0.65, 0, 0.2, 1);
          will-change: transform;
        }
        .ds-slide {
          flex: 0 0 100%; min-width: 100%;
          display: flex; flex-direction: column; align-items: center;
          gap: 20px; padding: 24px 100px 14px;
        }

        /* Themed preview area (the style's own backdrop) */
        .ds-preview {
          width: 100%; max-width: 560px;
          background: var(--ds-bg);
          border-radius: 26px;
          padding: 34px;
          display: flex; justify-content: center;
          box-shadow: 0 30px 70px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset;
        }

        /* ── Standardized board (skinned by theme vars) ───────────────────── */
        .ds-panel {
          width: 100%;
          font-family: var(--ds-font);
          color: var(--ds-text);
          background: var(--ds-surface);
          -webkit-backdrop-filter: blur(var(--ds-blur)) saturate(var(--ds-saturate));
          backdrop-filter: blur(var(--ds-blur)) saturate(var(--ds-saturate));
          border: 1px solid var(--ds-border);
          border-radius: var(--ds-radius-lg);
          box-shadow: var(--ds-shadow);
          padding: 22px;
          display: flex; flex-direction: column; gap: 12px;
        }
        .ds-panel-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px; }
        .ds-panel-title { font-family: var(--ds-font-display); font-size: 18px; font-weight: 700; letter-spacing: 0.4px; }

        .ds-group-label {
          font-size: 9.5px; font-weight: 600; letter-spacing: 1.6px; text-transform: uppercase;
          color: var(--ds-sub); margin-top: 6px;
        }

        /* Buttons */
        .ds-btns { display: flex; gap: 9px; flex-wrap: wrap; }
        .ds-btn {
          font-family: var(--ds-font); font-size: 12.5px; font-weight: 600; letter-spacing: 0.3px;
          padding: 9px 16px; border-radius: var(--ds-radius); cursor: pointer;
          transition: transform 0.25s var(--ds-ease), background 0.25s var(--ds-ease), box-shadow 0.25s var(--ds-ease), border-color 0.25s var(--ds-ease);
          border: 1px solid transparent;
        }
        .ds-btn:hover { transform: translateY(-2px); }
        .ds-btn:active { transform: translateY(0) scale(0.97); }
        .ds-btn-primary { background: var(--ds-accent); color: var(--ds-accent-ink); box-shadow: 0 6px 18px var(--ds-glow); }
        .ds-btn-primary:hover { box-shadow: 0 10px 26px var(--ds-glow); }
        .ds-btn-secondary { background: var(--ds-surface-2); color: var(--ds-text); border-color: var(--ds-border-2); }
        .ds-btn-secondary:hover { border-color: var(--ds-accent); }
        .ds-btn-ghost { background: transparent; color: var(--ds-sub); }
        .ds-btn-ghost:hover { background: var(--ds-surface-2); color: var(--ds-text); }

        /* Card */
        .ds-card {
          background: var(--ds-surface-2);
          border: 1px solid var(--ds-border);
          border-radius: var(--ds-radius);
          padding: 14px 16px; display: flex; flex-direction: column; gap: 6px;
        }
        .ds-card-title { font-size: 13px; font-weight: 600; }
        .ds-card-body { font-size: 12px; line-height: 1.55; color: var(--ds-sub); }

        /* Inputs */
        .ds-fields { display: flex; flex-direction: column; gap: 9px; }
        .ds-input {
          width: 100%; font-family: var(--ds-font); font-size: 13px;
          color: var(--ds-text);
          background: var(--ds-surface-2);
          border: 1px solid var(--ds-border);
          border-radius: var(--ds-radius);
          padding: 10px 14px; outline: none;
          transition: border-color 0.25s var(--ds-ease), box-shadow 0.25s var(--ds-ease);
        }
        .ds-input::placeholder { color: var(--ds-sub); opacity: 0.7; }
        .ds-input:focus { border-color: var(--ds-accent); box-shadow: 0 0 0 3px var(--ds-glow); }
        .ds-search {
          display: flex; align-items: center; gap: 9px;
          background: var(--ds-surface-2);
          border: 1px solid var(--ds-border);
          border-radius: var(--ds-radius);
          padding: 0 14px; color: var(--ds-sub);
          transition: border-color 0.25s var(--ds-ease);
        }
        .ds-search:focus-within { border-color: var(--ds-accent); }
        .ds-input-bare { background: transparent; border: 0; padding: 10px 0; border-radius: 0; }
        .ds-input-bare:focus { box-shadow: none; }

        /* Controls */
        .ds-controls { display: flex; flex-direction: column; gap: 11px; }
        .ds-control-row { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
        .ds-control-name { font-size: 12.5px; font-weight: 500; color: var(--ds-text); }

        .ds-toggle {
          position: relative; width: 44px; height: 26px; flex-shrink: 0;
          border-radius: 999px; cursor: pointer; padding: 0;
          background: var(--ds-surface-2); border: 1px solid var(--ds-border);
          transition: background 0.3s var(--ds-ease), border-color 0.3s var(--ds-ease);
        }
        .ds-toggle.on { background: var(--ds-accent); border-color: transparent; box-shadow: 0 0 14px var(--ds-glow); }
        .ds-knob {
          position: absolute; top: 50%; left: 3px; transform: translateY(-50%);
          width: 20px; height: 20px; border-radius: 50%; background: #fff;
          box-shadow: 0 2px 5px rgba(0,0,0,0.4);
          transition: left 0.3s var(--ds-ease);
        }
        .ds-toggle.on .ds-knob { left: calc(100% - 23px); }

        .ds-slider-row { gap: 16px; }
        .ds-slider {
          position: relative; flex: 1; height: 8px;
          background: var(--ds-surface-2); border-radius: 999px; cursor: pointer;
          border: 1px solid var(--ds-border);
        }
        .ds-slider-fill {
          position: absolute; left: 0; top: 0; bottom: 0;
          background: var(--ds-accent); border-radius: 999px; box-shadow: 0 0 12px var(--ds-glow);
        }
        .ds-slider-thumb {
          position: absolute; top: 50%; transform: translate(-50%, -50%);
          width: 16px; height: 16px; border-radius: 50%; background: #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.5);
        }

        /* Badges / chips */
        .ds-chips { display: flex; flex-wrap: wrap; gap: 7px; }
        .ds-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.2px;
          padding: 3px 10px; border-radius: 999px;
          background: var(--ds-surface-2); border: 1px solid var(--ds-border); color: var(--ds-sub);
        }
        .ds-badge-accent {
          color: var(--ds-accent);
          background: color-mix(in srgb, var(--ds-accent) 16%, transparent);
          border-color: color-mix(in srgb, var(--ds-accent) 40%, transparent);
        }
        .ds-badge-dot i {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--ds-accent); box-shadow: 0 0 8px var(--ds-accent);
        }

        /* Caption */
        .ds-caption { width: 100%; max-width: 560px; display: flex; flex-direction: column; gap: 5px; align-items: center; text-align: center; }
        .ds-index { font-size: 10.5px; font-weight: 600; letter-spacing: 2px; color: rgba(255,255,255,0.25); }
        .ds-name { margin: 1px 0 0; font-size: 24px; font-weight: 600; letter-spacing: 0.4px; }
        .ds-tagline { margin: 0; font-size: 12px; letter-spacing: 0.5px; text-transform: uppercase; color: rgba(255,255,255,0.4); }
        .ds-cap-tags { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-top: 6px; }
        .ds-cap-tag {
          font-size: 10px; font-weight: 600; letter-spacing: 0.4px; text-transform: uppercase;
          color: rgba(255,255,255,0.45); background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); padding: 3px 9px; border-radius: 20px;
        }

        /* Arrows */
        .ds-arrow {
          position: absolute; top: 50%; transform: translateY(-50%); z-index: 30;
          width: 52px; height: 52px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
          color: rgba(255,255,255,0.55); cursor: pointer; transition: all 0.2s ease;
        }
        .ds-arrow:hover { background: rgba(255,255,255,0.09); border-color: var(--cur-accent); color: #fff; box-shadow: 0 0 24px var(--cur-glow); }
        .ds-arrow-left { left: 26px; }
        .ds-arrow-right { right: 26px; }
        .ds-arrow-peek { position: absolute; white-space: nowrap; font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.5); opacity: 0; transition: opacity 0.2s; pointer-events: none; }
        .ds-arrow-left .ds-arrow-peek { left: calc(100% + 12px); }
        .ds-arrow-right .ds-arrow-peek { right: calc(100% + 12px); }
        .ds-arrow:hover .ds-arrow-peek { opacity: 1; }

        /* Dots + hint */
        .ds-dots { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 30; display: flex; gap: 9px; }
        .ds-dot { width: 8px; height: 8px; padding: 0; border: none; border-radius: 999px; background: rgba(255,255,255,0.16); cursor: pointer; transition: all 0.3s ease; }
        .ds-hint { position: absolute; bottom: 20px; right: 30px; z-index: 30; font-size: 11px; color: rgba(255,255,255,0.22); letter-spacing: 0.4px; }
        .ds-hint span { font-weight: 600; color: rgba(255,255,255,0.4); }

        @media (max-width: 760px) {
          .ds-slide { padding: 18px 60px 12px; }
          .ds-preview { padding: 22px; }
          .ds-hint { display: none; }
        }
        @media (max-width: 520px) {
          .ds-arrow { width: 42px; height: 42px; }
          .ds-arrow-left { left: 8px; } .ds-arrow-right { right: 8px; }
          .ds-slide { padding: 14px 52px 12px; }
        }
      `}</style>
    </div>
  );
}
