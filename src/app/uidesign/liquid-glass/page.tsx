"use client";

import { useState, useEffect, useRef } from "react";

// ─── Design system components ─────────────────────────────────────────────────
interface Track {
  title: string;
  artist: string;
  album: string;
  duration: string;
  color: string;
  accentLight: string;
}

const TRACKS: Track[] = [
  { title: "Midnight Signal", artist: "Neon Cascade", album: "Ultraviolet Dreams", duration: "3:42", color: "#1e3a5f", accentLight: "#60a5fa" },
  { title: "Glass Horizon", artist: "Auric Tone", album: "Surface Tension", duration: "4:18", color: "#2d1b4e", accentLight: "#a78bfa" },
  { title: "Liquid State", artist: "Frost Layer", album: "Cryo Sessions", duration: "5:01", color: "#1a3a2e", accentLight: "#34d399" },
  { title: "Vapor Drift", artist: "Spectral Haze", album: "Ambient Volume I", duration: "6:22", color: "#3b1f1c", accentLight: "#fb923c" },
];

interface Component {
  id: string;
  title: string;
  description: string;
}

const COMPONENTS: Component[] = [
  { id: "player", title: "Main Player", description: "Full-bleed album art with layered backdrop-filter blur. Every control surface is a frosted glass panel tinted by the album's dominant color." },
  { id: "tracklist", title: "Track List", description: "An indexed scrollable list with active track highlighted via a full-row color bleed. Row hover reveals waveform mini-bars." },
  { id: "controls", title: "Transport Controls", description: "Play, seek, volume, and shuffle — all rendered as pressable glass pills with inset shadow depth and neon accent glows." },
  { id: "visualizer", title: "Waveform Visualizer", description: "A real-time animated bar waveform rendered in CSS, color-matched to the playing track's accent. Idle state breathes gently." },
];

// ─── Waveform bar animation ───────────────────────────────────────────────────
function Waveform({ color, playing }: { color: string; playing: boolean }) {
  const bars = Array.from({ length: 32 }, (_, i) => i);
  return (
    <div className="lgp-wave">
      {bars.map((i) => (
        <div
          key={i}
          className={`lgp-wave-bar ${playing ? "playing" : ""}`}
          style={{
            background: color,
            animationDelay: `${(i * 47) % 800}ms`,
            animationDuration: `${600 + (i * 83) % 500}ms`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Player Preview ──────────────────────────────────────────────────────
function PlayerPreview({ track, playing, onToggle, progress, onSeek }: {
  track: Track; playing: boolean; onToggle: () => void; progress: number; onSeek: (v: number) => void;
}) {
  return (
    <div className="lgp-player" style={{ "--track-color": track.color, "--accent": track.accentLight } as React.CSSProperties}>
      {/* Background color bleed */}
      <div className="lgp-player-bg" style={{ background: `radial-gradient(ellipse 80% 80% at 50% 0%, ${track.color}, transparent 80%)` }} />

      {/* Album art */}
      <div className="lgp-album-art">
        <div className="lgp-art-inner" style={{ background: `linear-gradient(135deg, ${track.color} 0%, color-mix(in srgb, ${track.accentLight} 30%, ${track.color}) 100%)` }}>
          <div className="lgp-art-grid" />
          <div className="lgp-art-label">
            <span className="lgp-art-album">{track.album}</span>
          </div>
          {playing && <div className="lgp-art-pulse" style={{ borderColor: `${track.accentLight}40` }} />}
        </div>
      </div>

      {/* Track info */}
      <div className="lgp-track-info">
        <h3 className="lgp-track-title">{track.title}</h3>
        <p className="lgp-track-artist">{track.artist}</p>
      </div>

      {/* Progress bar */}
      <div className="lgp-progress-wrap">
        <input
          type="range" min={0} max={100} value={progress}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="lgp-progress"
          style={{ "--acc": track.accentLight } as React.CSSProperties}
        />
        <div className="lgp-progress-times">
          <span>{Math.floor(progress / 100 * 222)}s</span>
          <span>{track.duration}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="lgp-controls">
        <button className="lgp-ctrl-btn" title="Shuffle">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" />
          </svg>
        </button>
        <button className="lgp-ctrl-btn" title="Previous">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="19" x2="5" y2="5" />
          </svg>
        </button>
        <button
          className="lgp-play-btn"
          onClick={onToggle}
          style={{ borderColor: `${track.accentLight}60`, boxShadow: `0 0 24px ${track.accentLight}40, inset 0 1px 0 rgba(255,255,255,0.15)` }}
        >
          {playing ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>
        <button className="lgp-ctrl-btn" title="Next">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" />
          </svg>
        </button>
        <button className="lgp-ctrl-btn" title="Loop">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
        </button>
      </div>

      {/* Volume */}
      <div className="lgp-volume">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
        <input type="range" min={0} max={100} defaultValue={75} className="lgp-volume-slider"
          style={{ "--acc": track.accentLight } as React.CSSProperties} />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      </div>
    </div>
  );
}

// ─── Track list preview ───────────────────────────────────────────────────────
function TrackListPreview({ tracks, activeIdx, onSelect }: {
  tracks: Track[]; activeIdx: number; onSelect: (i: number) => void;
}) {
  return (
    <div className="lgp-tracklist">
      {tracks.map((t, i) => (
        <button
          key={i}
          className={`lgp-track-row ${i === activeIdx ? "active" : ""}`}
          style={i === activeIdx ? {
            background: `linear-gradient(90deg, ${t.color} 0%, transparent 100%)`,
            borderColor: `${t.accentLight}30`,
          } : {}}
          onClick={() => onSelect(i)}
        >
          <span className="lgp-track-num" style={i === activeIdx ? { color: t.accentLight } : {}}>
            {i === activeIdx ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: t.accentLight }}>
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            ) : String(i + 1).padStart(2, "0")}
          </span>
          <div className="lgp-track-row-info">
            <span className="lgp-track-row-title">{t.title}</span>
            <span className="lgp-track-row-artist">{t.artist}</span>
          </div>
          <span className="lgp-track-dur">{t.duration}</span>
          {i === activeIdx && (
            <Waveform color={t.accentLight} playing={true} />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Controls preview ─────────────────────────────────────────────────────────
function ControlsPreview({ track }: { track: Track }) {
  const [vol, setVol] = useState(75);
  return (
    <div className="lgp-controls-showcase" style={{ "--accent": track.accentLight } as React.CSSProperties}>
      <div className="lgp-ctrl-section">
        <span className="lgp-ctrl-section-label">Playback</span>
        <div className="lgp-ctrl-pills">
          {[
            { label: "Previous", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg> },
            { label: "Play / Pause", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>, accent: true },
            { label: "Next", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg> },
          ].map((c) => (
            <button key={c.label} className={`lgp-pill ${c.accent ? "lgp-pill-accent" : ""}`}
              style={c.accent ? { borderColor: track.accentLight, boxShadow: `0 0 16px ${track.accentLight}40` } : {}}>
              {c.icon}
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="lgp-ctrl-section">
        <span className="lgp-ctrl-section-label">Modifiers</span>
        <div className="lgp-ctrl-pills">
          {["Shuffle", "Repeat", "Heart", "Queue"].map((l) => (
            <button key={l} className="lgp-pill lgp-pill-sm">{l}</button>
          ))}
        </div>
      </div>
      <div className="lgp-ctrl-section">
        <span className="lgp-ctrl-section-label">Volume — {vol}%</span>
        <div className="lgp-volume-full">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          </svg>
          <input type="range" min={0} max={100} value={vol} onChange={(e) => setVol(Number(e.target.value))}
            className="lgp-volume-slider" style={{ "--acc": track.accentLight } as React.CSSProperties} />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

// ─── Visualizer preview ───────────────────────────────────────────────────────
function VisualizerPreview({ track, playing }: { track: Track; playing: boolean }) {
  return (
    <div className="lgp-viz-showcase">
      <div className="lgp-viz-label">
        <span style={{ color: track.accentLight }}>◉</span> {playing ? "Live — Now Playing" : "Idle — Breathing Mode"}
      </div>
      <div className="lgp-viz-panel" style={{ borderColor: `${track.accentLight}20` }}>
        <div className="lgp-viz-glow" style={{ background: `${track.accentLight}10` }} />
        <Waveform color={track.accentLight} playing={playing} />
        <div className="lgp-viz-spectrum">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="lgp-spec-bar" style={{
              height: `${20 + Math.sin(i * 0.9) * 18}%`,
              background: `${track.accentLight}${playing ? "80" : "30"}`,
              transition: "height 0.5s ease, background 0.5s",
            }} />
          ))}
        </div>
      </div>
      <div className="lgp-viz-tokens">
        {[
          { label: "Peak", val: playing ? "−3.2 dBFS" : "—" },
          { label: "RMS", val: playing ? "−18.4 dBFS" : "—" },
          { label: "BPM", val: "124" },
          { label: "Key", val: "Am" },
        ].map((t) => (
          <div key={t.label} className="lgp-viz-token">
            <span className="lgp-viz-token-label">{t.label}</span>
            <span className="lgp-viz-token-val" style={{ color: track.accentLight }}>{t.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const COMPONENT_PANELS = [PlayerPreview, TrackListPreview, ControlsPreview, VisualizerPreview];

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function LiquidGlassPlayerPage() {
  const [activeTrack, setActiveTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(28);
  const [activeComp, setActiveComp] = useState(0);
  const [animDir, setAnimDir] = useState<"left" | "right" | null>(null);
  const [animating, setAnimating] = useState(false);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const track = TRACKS[activeTrack];

  // Auto-advance progress
  useEffect(() => {
    if (playing) {
      progressRef.current = setInterval(() => {
        setProgress((p) => (p >= 100 ? 0 : p + 0.1));
      }, 120);
    } else {
      if (progressRef.current) clearInterval(progressRef.current);
    }
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [playing]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") navigateComp("right");
      if (e.key === "ArrowLeft")  navigateComp("left");
      if (e.key === " ") { e.preventDefault(); setPlaying((p) => !p); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const navigateComp = (dir: "left" | "right") => {
    if (animating) return;
    setAnimDir(dir);
    setAnimating(true);
    setTimeout(() => {
      setActiveComp((prev) => dir === "right" ? (prev + 1) % COMPONENTS.length : (prev - 1 + COMPONENTS.length) % COMPONENTS.length);
      setAnimating(false);
      setAnimDir(null);
    }, 280);
  };

  const comp = COMPONENTS[activeComp];

  // Render the correct preview
  const renderPreview = () => {
    switch (activeComp) {
      case 0: return <PlayerPreview track={track} playing={playing} onToggle={() => setPlaying(p => !p)} progress={progress} onSeek={setProgress} />;
      case 1: return <TrackListPreview tracks={TRACKS} activeIdx={activeTrack} onSelect={(i) => { setActiveTrack(i); setProgress(0); }} />;
      case 2: return <ControlsPreview track={track} />;
      case 3: return <VisualizerPreview track={track} playing={playing} />;
      default: return null;
    }
  };

  return (
    <div className="lgp-root">
      {/* Full-bleed background bleed from active track */}
      <div
        className="lgp-bg-bleed"
        style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${track.color}60, transparent 70%)`, transition: "background 1s ease" }}
      />
      <div className="lgp-bg-grid" />

      <div className="lgp-app">
        {/* Header */}
        <nav className="lgp-nav">
          <div className="lgp-nav-brand">
            <div className="lgp-nav-logo-icon" style={{ background: `linear-gradient(135deg, ${track.color}, ${track.accentLight}40)`, borderColor: `${track.accentLight}30` }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: track.accentLight }}>
                <circle cx="12" cy="12" r="10" opacity="0.2" /><circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeWidth="2" stroke="currentColor" fill="none" />
              </svg>
            </div>
            <span className="lgp-nav-name">Liquid Glass Player</span>
            <span className="lgp-nav-version">Component Library</span>
          </div>
          <div className="lgp-nav-links">
            {COMPONENTS.map((c, i) => (
              <button
                key={c.id}
                className={`lgp-nav-link ${i === activeComp ? "active" : ""}`}
                style={i === activeComp ? { color: track.accentLight } : {}}
                onClick={() => {
                  if (i > activeComp) navigateComp("right");
                  else if (i < activeComp) navigateComp("left");
                  else setActiveComp(i);
                }}
              >
                {c.title}
              </button>
            ))}
          </div>
          <div className="lgp-now-playing" style={{ borderColor: `${track.accentLight}20` }}>
            {playing && <span className="lgp-np-dot" style={{ background: track.accentLight }} />}
            <span className="lgp-np-text">{playing ? `${track.title} — ${track.artist}` : "Paused"}</span>
          </div>
        </nav>

        {/* Hero */}
        <header className="lgp-hero">
          <h1 className="lgp-hero-title">Liquid Glass Player</h1>
          <p className="lgp-hero-sub">A cinematic music interface built on layered <code>backdrop-filter</code> blur. Rich colour bleeds from album art through every frosted control surface.</p>
          <div className="lgp-hero-tags">
            {["CSS Glassmorphism", "backdrop-filter", "CSS Animations", "Dark Mode"].map((t) => (
              <span key={t} className="lgp-hero-tag">{t}</span>
            ))}
          </div>
        </header>

        {/* Main showcase layout */}
        <div className="lgp-showcase-layout">
          {/* Component carousel */}
          <div className="lgp-component-area">
            <div className="lgp-carousel-nav">
              <button className="lgp-arr-btn" onClick={() => navigateComp("left")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <div
                key={activeComp}
                className={`lgp-showcase-card ${animating ? `lgp-slide-out-${animDir}` : "lgp-slide-in"}`}
              >
                <div className="lgp-showcase-preview">
                  {renderPreview()}
                </div>
                <div className="lgp-showcase-meta" style={{ borderColor: `${track.accentLight}15` }}>
                  <div>
                    <h3 className="lgp-showcase-title" style={{ color: track.accentLight }}>{comp.title}</h3>
                    <p className="lgp-showcase-desc">{comp.description}</p>
                  </div>
                  <div className="lgp-code-actions">
                    <button className="lgp-btn-copy" style={{ "--acc": track.accentLight } as React.CSSProperties}
                      onClick={() => navigator.clipboard.writeText(`<!-- ${comp.title} — Liquid Glass Player -->`)}
                    >Copy HTML</button>
                    <button className="lgp-btn-copy" style={{ "--acc": track.accentLight } as React.CSSProperties}
                      onClick={() => navigator.clipboard.writeText(`/* ${comp.title} — Liquid Glass Player */`)}
                    >Copy CSS</button>
                  </div>
                </div>
              </div>

              <button className="lgp-arr-btn" onClick={() => navigateComp("right")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            <div className="lgp-dots">
              {COMPONENTS.map((_, i) => (
                <button key={i} className={`lgp-dot ${i === activeComp ? "active" : ""}`}
                  style={i === activeComp ? { background: track.accentLight } : {}}
                  onClick={() => { if (i > activeComp) navigateComp("right"); else navigateComp("left"); }}
                />
              ))}
            </div>
          </div>

          {/* Sidebar: design tokens + track selector */}
          <aside className="lgp-sidebar">
            <div className="lgp-sidebar-section">
              <h3 className="lgp-sidebar-heading">Design System</h3>
              <div className="lgp-token-grid">
                {[
                  { name: "--glass-bg", val: "rgba(255,255,255,0.04)", sw: "rgba(255,255,255,0.04)" },
                  { name: "--blur", val: "backdrop-filter: blur(24px)", sw: "transparent" },
                  { name: "--accent", val: track.accentLight, sw: track.accentLight },
                  { name: "--track-bg", val: track.color, sw: track.color },
                  { name: "--border", val: "rgba(255,255,255,0.06)", sw: "rgba(255,255,255,0.06)" },
                ].map((t) => (
                  <div key={t.name} className="lgp-token-row">
                    <div className="lgp-token-swatch" style={{ background: t.sw, borderColor: `${track.accentLight}20` }} />
                    <div>
                      <div className="lgp-token-name">{t.name}</div>
                      <div className="lgp-token-val">{t.val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lgp-sidebar-section">
              <h3 className="lgp-sidebar-heading">Track Preview</h3>
              <div className="lgp-mini-tracklist">
                {TRACKS.map((t, i) => (
                  <button
                    key={i}
                    className={`lgp-mini-track ${i === activeTrack ? "active" : ""}`}
                    style={i === activeTrack ? {
                      background: `linear-gradient(90deg, ${t.color}80, transparent)`,
                      borderColor: `${t.accentLight}25`,
                    } : {}}
                    onClick={() => { setActiveTrack(i); setProgress(0); }}
                  >
                    <div className="lgp-mini-track-art" style={{ background: t.color, borderColor: `${t.accentLight}40` }} />
                    <div className="lgp-mini-track-info">
                      <span className="lgp-mini-track-title" style={i === activeTrack ? { color: t.accentLight } : {}}>{t.title}</span>
                      <span className="lgp-mini-track-artist">{t.artist}</span>
                    </div>
                    <span className="lgp-mini-track-dur">{t.duration}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

        :root {
          --lgp-bg: #050508;
          --lgp-glass: rgba(255,255,255,0.04);
          --lgp-glass-h: rgba(255,255,255,0.07);
          --lgp-border: rgba(255,255,255,0.07);
          --lgp-border-h: rgba(255,255,255,0.14);
          --lgp-text: #f0f0f5;
          --lgp-text2: rgba(255,255,255,0.55);
          --lgp-muted: rgba(255,255,255,0.28);
        }

        .lgp-root {
          min-height: calc(100vh - 56px);
          background: var(--lgp-bg);
          color: var(--lgp-text);
          font-family: 'Inter', system-ui, sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        .lgp-bg-bleed {
          position: fixed;
          top: 56px; left: 0; right: 0;
          height: 60vh;
          z-index: 0;
          pointer-events: none;
        }

        .lgp-bg-grid {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: linear-gradient(to bottom, rgba(0,0,0,0.4), transparent 85%);
        }

        .lgp-app {
          position: relative;
          z-index: 10;
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px 36px 48px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        /* Nav */
        .lgp-nav {
          background: rgba(5,5,8,0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--lgp-border);
          border-radius: 50px;
          height: 62px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .lgp-nav-brand { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .lgp-nav-logo-icon {
          width: 34px; height: 34px;
          border-radius: 10px;
          border: 1px solid;
          display: flex; align-items: center; justify-content: center;
        }
        .lgp-nav-name { font-size: 14px; font-weight: 600; letter-spacing: 0.5px; }
        .lgp-nav-version { font-size: 10px; color: var(--lgp-muted); letter-spacing: 1px; text-transform: uppercase; }

        .lgp-nav-links { display: flex; gap: 24px; }
        .lgp-nav-link {
          background: none; border: none;
          color: var(--lgp-text2);
          font-size: 12px; font-weight: 500; letter-spacing: 0.8px; text-transform: uppercase;
          cursor: pointer;
          transition: color 0.2s;
          padding: 4px 0;
          position: relative;
        }
        .lgp-nav-link.active { font-weight: 600; }

        .lgp-now-playing {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.03);
          border: 1px solid;
          border-radius: 30px;
          padding: 6px 14px;
          font-size: 11px;
          color: var(--lgp-text2);
          max-width: 240px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .lgp-np-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; animation: npPulse 1.2s ease-in-out infinite; }
        @keyframes npPulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }

        /* Hero */
        .lgp-hero h1 { font-size: 44px; font-weight: 300; letter-spacing: -0.5px; line-height: 1.1; margin-bottom: 12px; }
        .lgp-hero-sub { font-size: 15px; line-height: 1.65; color: var(--lgp-text2); max-width: 640px; margin-bottom: 16px; }
        .lgp-hero-sub code { font-size: 13px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); padding: 1px 6px; border-radius: 4px; }
        .lgp-hero-tags { display: flex; gap: 8px; flex-wrap: wrap; }
        .lgp-hero-tag { font-size: 11px; font-weight: 500; letter-spacing: 0.5px; color: var(--lgp-text2); background: var(--lgp-glass); border: 1px solid var(--lgp-border); padding: 4px 12px; border-radius: 20px; }

        /* Showcase layout */
        .lgp-showcase-layout { display: grid; grid-template-columns: 1fr 300px; gap: 28px; }
        .lgp-component-area { display: flex; flex-direction: column; gap: 20px; }

        .lgp-carousel-nav { display: flex; align-items: stretch; gap: 12px; }

        .lgp-arr-btn {
          flex-shrink: 0;
          width: 42px; height: 42px;
          border-radius: 50%;
          background: var(--lgp-glass);
          border: 1px solid var(--lgp-border);
          color: var(--lgp-text2);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          align-self: center;
          backdrop-filter: blur(10px);
        }
        .lgp-arr-btn:hover { background: var(--lgp-glass-h); border-color: var(--lgp-border-h); color: var(--lgp-text); }

        .lgp-showcase-card {
          flex: 1;
          background: var(--lgp-glass);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid var(--lgp-border);
          border-radius: 20px;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr 260px;
        }

        .lgp-showcase-preview {
          padding: 36px;
          background: rgba(255,255,255,0.008);
          border-right: 1px solid var(--lgp-border);
          display: flex; align-items: center; justify-content: center;
          min-height: 360px;
        }

        .lgp-showcase-meta {
          padding: 28px;
          background: rgba(0,0,0,0.2);
          display: flex; flex-direction: column; justify-content: space-between; gap: 16px;
          border-left: 1px solid;
        }

        .lgp-showcase-title { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
        .lgp-showcase-desc { font-size: 13px; line-height: 1.6; color: var(--lgp-text2); }

        .lgp-code-actions { display: flex; gap: 8px; }
        .lgp-btn-copy {
          flex: 1;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          color: var(--lgp-muted);
          font-size: 11px; font-weight: 500; letter-spacing: 0.5px;
          padding: 8px 10px; border-radius: 4px; cursor: pointer;
          text-transform: uppercase; transition: all 0.2s;
        }
        .lgp-btn-copy:hover { background: rgba(var(--acc), 0.08); border-color: var(--acc); color: var(--acc); }

        /* Dots */
        .lgp-dots { display: flex; gap: 8px; justify-content: center; }
        .lgp-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.12); border: none; cursor: pointer; padding: 0; transition: all 0.3s; }
        .lgp-dot.active { width: 20px; border-radius: 3px; }

        /* Sidebar */
        .lgp-sidebar { display: flex; flex-direction: column; gap: 20px; }
        .lgp-sidebar-section {
          background: var(--lgp-glass);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--lgp-border);
          border-radius: 16px;
          overflow: hidden;
        }
        .lgp-sidebar-heading {
          font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;
          color: var(--lgp-muted);
          padding: 16px 18px 12px;
          border-bottom: 1px solid var(--lgp-border);
        }

        .lgp-token-grid { padding: 14px 18px; display: flex; flex-direction: column; gap: 10px; }
        .lgp-token-row { display: flex; align-items: center; gap: 10px; }
        .lgp-token-swatch { width: 22px; height: 22px; border-radius: 6px; border: 1px solid; flex-shrink: 0; }
        .lgp-token-name { font-size: 11px; font-family: monospace; color: var(--lgp-muted); }
        .lgp-token-val { font-size: 10px; color: rgba(255,255,255,0.35); }

        .lgp-mini-tracklist { padding: 8px; display: flex; flex-direction: column; gap: 2px; }
        .lgp-mini-track {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 10px;
          border-radius: 10px;
          background: none;
          border: 1px solid transparent;
          cursor: pointer; text-align: left;
          transition: all 0.2s;
          color: var(--lgp-text);
          width: 100%;
        }
        .lgp-mini-track:hover { background: var(--lgp-glass); }
        .lgp-mini-track-art { width: 32px; height: 32px; border-radius: 6px; flex-shrink: 0; border: 1px solid; }
        .lgp-mini-track-info { flex: 1; overflow: hidden; }
        .lgp-mini-track-title { font-size: 12px; font-weight: 500; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .lgp-mini-track-artist { font-size: 10px; color: var(--lgp-muted); display: block; }
        .lgp-mini-track-dur { font-size: 10px; color: var(--lgp-muted); flex-shrink: 0; }

        /* ── Player component ── */
        .lgp-player {
          width: 100%; max-width: 340px;
          background: rgba(0,0,0,0.3);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 24px;
          display: flex; flex-direction: column; gap: 20px;
          position: relative; overflow: hidden;
        }
        .lgp-player-bg { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
        .lgp-player > *:not(.lgp-player-bg) { position: relative; z-index: 1; }

        .lgp-album-art { width: 100%; aspect-ratio: 1; border-radius: 14px; overflow: hidden; }
        .lgp-art-inner {
          width: 100%; height: 100%;
          position: relative;
          display: flex; align-items: flex-end;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          overflow: hidden;
        }
        .lgp-art-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .lgp-art-label { position: relative; z-index: 1; padding: 12px 14px; background: linear-gradient(transparent, rgba(0,0,0,0.6)); width: 100%; }
        .lgp-art-album { font-size: 11px; font-weight: 500; letter-spacing: 0.5px; color: rgba(255,255,255,0.7); text-transform: uppercase; }
        .lgp-art-pulse {
          position: absolute; inset: 4px;
          border: 1px solid;
          border-radius: 12px;
          animation: artPulse 2s ease-in-out infinite;
        }
        @keyframes artPulse { 0%,100% { opacity:0.4; transform: scale(1); } 50% { opacity:0; transform: scale(1.05); } }

        .lgp-track-info { text-align: center; }
        .lgp-track-title { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
        .lgp-track-artist { font-size: 13px; color: var(--lgp-text2); }

        .lgp-progress-wrap { display: flex; flex-direction: column; gap: 6px; }
        .lgp-progress {
          -webkit-appearance: none; width: 100%; height: 4px;
          background: rgba(255,255,255,0.1); border-radius: 2px; cursor: pointer; outline: none;
        }
        .lgp-progress::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: var(--acc); box-shadow: 0 0 8px var(--acc); }
        .lgp-progress-times { display: flex; justify-content: space-between; font-size: 11px; color: var(--lgp-muted); }

        .lgp-controls { display: flex; align-items: center; justify-content: center; gap: 16px; }
        .lgp-ctrl-btn {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
          color: var(--lgp-text2); width: 38px; height: 38px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;
        }
        .lgp-ctrl-btn:hover { background: rgba(255,255,255,0.08); color: var(--lgp-text); }
        .lgp-play-btn {
          background: rgba(255,255,255,0.06); border: 1px solid;
          color: var(--lgp-text); width: 54px; height: 54px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
          transition: all 0.25s; backdrop-filter: blur(10px);
        }
        .lgp-play-btn:hover { transform: scale(1.08); background: rgba(255,255,255,0.1); }

        .lgp-volume { display: flex; align-items: center; gap: 10px; color: var(--lgp-muted); }
        .lgp-volume-slider {
          -webkit-appearance: none; flex: 1; height: 3px;
          background: rgba(255,255,255,0.1); border-radius: 2px; cursor: pointer; outline: none;
        }
        .lgp-volume-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 10px; height: 10px; border-radius: 50%; background: var(--acc); }

        /* Track list component */
        .lgp-tracklist { width: 100%; display: flex; flex-direction: column; gap: 2px; }
        .lgp-track-row {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 14px; border-radius: 10px;
          background: none; border: 1px solid transparent;
          cursor: pointer; text-align: left; color: var(--lgp-text);
          width: 100%; transition: all 0.2s; position: relative; overflow: hidden;
        }
        .lgp-track-row:hover { background: rgba(255,255,255,0.03); }
        .lgp-track-num { font-size: 11px; color: var(--lgp-muted); width: 24px; flex-shrink: 0; display: flex; align-items: center; }
        .lgp-track-row-info { flex: 1; overflow: hidden; }
        .lgp-track-row-title { font-size: 13px; font-weight: 500; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .lgp-track-row-artist { font-size: 11px; color: var(--lgp-muted); display: block; }
        .lgp-track-dur { font-size: 11px; color: var(--lgp-muted); flex-shrink: 0; }

        /* Controls showcase */
        .lgp-controls-showcase { width: 100%; display: flex; flex-direction: column; gap: 24px; }
        .lgp-ctrl-section { display: flex; flex-direction: column; gap: 10px; }
        .lgp-ctrl-section-label { font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--lgp-muted); }
        .lgp-ctrl-pills { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .lgp-pill {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: var(--lgp-text2); padding: 10px 18px; border-radius: 50px;
          font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s;
        }
        .lgp-pill:hover { background: rgba(255,255,255,0.08); }
        .lgp-pill-accent { background: rgba(255,255,255,0.06); }
        .lgp-pill-sm { padding: 7px 14px; font-size: 11px; }
        .lgp-volume-full { display: flex; align-items: center; gap: 10px; color: var(--lgp-muted); }

        /* Visualizer */
        .lgp-viz-showcase { width: 100%; display: flex; flex-direction: column; gap: 16px; }
        .lgp-viz-label { font-size: 12px; font-weight: 500; color: var(--lgp-text2); display: flex; align-items: center; gap: 6px; }
        .lgp-viz-panel {
          background: rgba(0,0,0,0.3); border: 1px solid; border-radius: 12px;
          padding: 20px; display: flex; flex-direction: column; gap: 16px;
          position: relative; overflow: hidden;
        }
        .lgp-viz-glow { position: absolute; inset: 0; z-index: 0; }
        .lgp-viz-panel > *:not(.lgp-viz-glow) { position: relative; z-index: 1; }
        .lgp-viz-spectrum { display: flex; gap: 4px; align-items: flex-end; height: 40px; }
        .lgp-spec-bar { flex: 1; border-radius: 2px 2px 0 0; }
        .lgp-viz-tokens { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
        .lgp-viz-token { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 10px 12px; }
        .lgp-viz-token-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--lgp-muted); display: block; margin-bottom: 4px; }
        .lgp-viz-token-val { font-size: 13px; font-weight: 600; font-family: monospace; display: block; }

        /* Waveform */
        .lgp-wave { display: flex; align-items: center; gap: 2px; height: 36px; }
        .lgp-wave-bar {
          flex: 1; border-radius: 1px;
          height: 20%;
          opacity: 0.5;
          transform-origin: center;
        }
        .lgp-wave-bar.playing {
          animation: waveBar 0.8s ease-in-out infinite alternate;
          opacity: 0.8;
        }
        @keyframes waveBar {
          from { height: 15%; opacity: 0.4; }
          to   { height: 85%; opacity: 0.9; }
        }

        /* Slide animations */
        @keyframes lgpSlideIn  { from { opacity:0; transform: translateX(40px); } to { opacity:1; transform: translateX(0); } }
        .lgp-slide-in { animation: lgpSlideIn 0.28s cubic-bezier(0.4,0,0.2,1) both; }
        .lgp-slide-out-right { opacity:0; transform: translateX(-40px); transition: all 0.28s; }
        .lgp-slide-out-left  { opacity:0; transform: translateX(40px); transition: all 0.28s; }
      `}</style>
    </div>
  );
}
