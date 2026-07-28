"use client";

import { useEffect, useState } from "react";

// ── Design token CSS (flz-works DS, scoped to this page) ─────────────────────
const DS_TOKENS = `
  @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Geist:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap");

  .flz-hub-root {
    --flz-font-display: "Space Grotesk", "Helvetica Neue", Helvetica, sans-serif;
    --flz-font-sans: "Geist", "Helvetica Neue", Helvetica, sans-serif;
    --flz-font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

    --flz-text-primary: #F4F2EF;
    --flz-text-secondary: rgba(244,242,239,0.62);
    --flz-text-muted: rgba(244,242,239,0.42);

    --flz-glass-fill: rgba(255,255,255,0.08);
    --flz-glass-fill-raised: rgba(255,255,255,0.14);
    --flz-glass-fill-sunken: rgba(0,0,0,0.22);
    --flz-glass-border: 1px solid rgba(255,255,255,0.18);
    --flz-glass-specular: inset 0 1px 0 rgba(255,255,255,.22), inset 0 -1px 0 rgba(255,255,255,.06);
    --flz-glass-inner-glow: inset 0 0 28px rgba(255,255,255,.06);
    --flz-shadow-md: 0 8px 24px rgba(0,0,0,.42);
    --flz-shadow-lg: 0 18px 48px rgba(0,0,0,.55);
    --flz-shadow-xl: 0 32px 80px rgba(0,0,0,.65);
    --flz-blur-sm: 10px;
    --flz-blur-xl: 44px;
    --flz-saturate: 180%;

    --flz-border-hairline: rgba(255,255,255,0.10);
    --flz-border-glass: rgba(255,255,255,0.18);
    --flz-border-strong: rgba(255,255,255,0.34);
    --flz-accent-soft: rgba(255,255,255,0.10);

    --flz-fs-label: 11px;
    --flz-ls-label: 0.10em;
    --flz-fs-body-sm: 13px;
    --flz-fs-body: 15px;
    --flz-fs-h3: 20px;
    --flz-ls-h3: -0.014em;
    --flz-fw-regular: 400;
    --flz-fw-medium: 500;
    --flz-fw-semibold: 600;

    --flz-radius-pill: 999px;
    --flz-ease-glass: cubic-bezier(.22,1,.36,1);
    --flz-ease-std: cubic-bezier(.4,0,.2,1);
    --flz-dur-fast: 160ms;
    --flz-dur-base: 240ms;
  }

  @keyframes flz-drift1 {
    0%   { transform: translate3d(0,0,0) scale(1); }
    50%  { transform: translate3d(90px,54px,0) scale(1.14); }
    100% { transform: translate3d(0,0,0) scale(1); }
  }
  @keyframes flz-drift2 {
    0%   { transform: translate3d(0,0,0) scale(1.06); }
    50%  { transform: translate3d(-120px,-40px,0) scale(.92); }
    100% { transform: translate3d(0,0,0) scale(1.06); }
  }
  @keyframes flz-drift3 {
    0%   { transform: translate3d(0,0,0) scale(.96); }
    50%  { transform: translate3d(60px,-70px,0) scale(1.2); }
    100% { transform: translate3d(0,0,0) scale(.96); }
  }
  @media (prefers-reduced-motion: reduce) {
    .flz-orb { animation-duration: 1ms !important; animation-iteration-count: 1 !important; }
  }

  .flz-tile { cursor: pointer; transition: transform .28s cubic-bezier(.22,1,.36,1), box-shadow .28s cubic-bezier(.22,1,.36,1); }
  .flz-tile:hover { transform: translateY(-3px); }
  .flz-tile-arr { transition: transform .28s cubic-bezier(.22,1,.36,1); }
  .flz-tile:hover .flz-tile-arr { transform: translate(3px,-3px); }

  .flz-railbtn { transition: transform .2s cubic-bezier(.22,1,.36,1); }
  .flz-railbtn:hover { transform: translateY(-2px); }

  .flz-chip {
    display: inline-flex; align-items: center; height: 32px; padding: 0 14px;
    border-radius: 999px; border: 1px solid rgba(255,255,255,.18);
    font: 500 13px/1 "Geist","Helvetica Neue",sans-serif;
    color: rgba(244,242,239,.62); background: transparent;
    cursor: pointer; transition: background .16s, color .16s, border-color .16s;
    white-space: nowrap;
  }
  .flz-chip:hover { background: rgba(255,255,255,.08); color: #F4F2EF; }
  .flz-chip.active {
    background: rgba(255,255,255,.18); color: #F4F2EF;
    border-color: rgba(255,255,255,.36);
  }

  .flz-iconbtn {
    width: 40px; height: 40px; border-radius: 999px;
    display: flex; align-items: center; justify-content: center;
    border: none; cursor: pointer; transition: background .16s;
    color: #F4F2EF;
  }
  .flz-iconbtn.solid { background: rgba(255,255,255,.22); }
  .flz-iconbtn.ghost { background: transparent; }
  .flz-iconbtn.glass {
    width: 32px; height: 32px;
    background: rgba(255,255,255,.12);
    border: 1px solid rgba(255,255,255,.18);
  }
  .flz-iconbtn:hover { background: rgba(255,255,255,.28); }

  .flz-btn-solid {
    display: inline-flex; align-items: center; height: 32px; padding: 0 16px;
    border-radius: 999px; background: #F4F2EF; color: #0B0B0C;
    font: 500 13px/1 "Geist","Helvetica Neue",sans-serif;
    border: none; cursor: pointer; transition: background .16s;
    white-space: nowrap;
  }
  .flz-btn-solid:hover { background: #fff; }

  .flz-stat-tile {
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 12px 14px; border-radius: 16px;
    background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.18);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.22);
  }

  .flz-badge {
    display: inline-flex; align-items: center; gap: 6px; height: 22px;
    padding: 0 9px; border-radius: 999px;
    background: rgba(244,242,239,.15); border: 1px solid rgba(244,242,239,.22);
    font: 500 10.5px/1 "JetBrains Mono",ui-monospace,monospace;
    letter-spacing: .06em; text-transform: uppercase; color: #F4F2EF;
    backdrop-filter: blur(8px); white-space: nowrap;
  }
  .flz-badge-dot {
    width: 6px; height: 6px; border-radius: 50%; background: #4ade80; flex-shrink: 0;
  }
`;

// ── Static data ──────────────────────────────────────────────────────────────
const PROJECTS = [
  { id: 1, tools: "Blender · ZBrush",        title: "Ronin — swordsman",   cat: "Characters", age: "2 days ago",   grad: "radial-gradient(120% 130% at 24%  6%,rgba(216,195,166,.62),rgba(120,96, 72,.12) 55%,transparent 76%)" },
  { id: 2, tools: "Blender · Substance",      title: "Kessler R-7 coupe",  cat: "Automotive", age: "1 week ago",   grad: "radial-gradient(120% 130% at 78%  6%,rgba(169,182,160,.58),rgba(95,107,82,.12) 55%,transparent 76%)" },
  { id: 3, tools: "Unity · Godot",            title: "Dust Runner demo",   cat: "Gameplay",   age: "2 weeks ago",  grad: "radial-gradient(120% 130% at 30% 82%,rgba(176,166,192,.55),rgba(95, 86,112,.12) 55%,transparent 76%)" },
  { id: 4, tools: "HLSL · Niagara",           title: "Impact VFX pack",    cat: "Assets",     age: "3 weeks ago",  grad: "radial-gradient(120% 130% at 72% 24%,rgba(199,169,160,.58),rgba(122,90, 80,.12) 55%,transparent 76%)" },
  { id: 5, tools: "Unity · C#",               title: "Skybound ch.3 boss", cat: "Gameplay",   age: "last month",   grad: "radial-gradient(120% 130% at 20% 28%,rgba(201,183,154,.58),rgba(138,122,85,.12) 55%,transparent 76%)" },
  { id: 6, tools: "Blender · Hard-surface",   title: "Modular crate kit",  cat: "Assets",     age: "last month",   grad: "radial-gradient(120% 130% at 62% 72%,rgba(159,180,184,.55),rgba(86, 108,112,.12) 55%,transparent 76%)" },
];

const FILTERS = ["All", "Assets", "Characters", "Gameplay", "Automotive"];

// ── Icon helpers ──────────────────────────────────────────────────────────────
const IconGrid = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.65" y2="16.65"/>
  </svg>
);
const IconMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/>
  </svg>
);
const IconArrow = ({ size = 17, rotate = false }: { size?: number; rotate?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
       style={rotate ? { transform: "rotate(180deg)" } : undefined}>
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconNE = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
  </svg>
);

// ── Sub-components ────────────────────────────────────────────────────────────
function IconRail() {
  const railStyle: React.CSSProperties = {
    position: "relative", flexShrink: 0, width: 64, alignSelf: "center",
    padding: 8, display: "flex", flexDirection: "column", gap: 12, alignItems: "center",
    borderRadius: 999,
    background: "var(--flz-glass-fill-raised)",
    border: "var(--flz-glass-border)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.55),inset 0 -1px 0 rgba(255,255,255,.22),inset 1px 0 0 rgba(255,255,255,.16),inset -1px 0 0 rgba(255,255,255,.16),var(--flz-glass-inner-glow),var(--flz-shadow-lg)",
    backdropFilter: `blur(var(--flz-blur-xl)) saturate(var(--flz-saturate)) brightness(1.06)`,
    WebkitBackdropFilter: `blur(var(--flz-blur-xl)) saturate(var(--flz-saturate)) brightness(1.06)`,
  };
  return (
    <div style={railStyle}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none", background: "linear-gradient(180deg,rgba(255,255,255,.24) 0%,rgba(255,255,255,0) 14%),linear-gradient(0deg,rgba(255,255,255,.14) 0%,rgba(255,255,255,0) 12%)" }} />
      <span className="flz-railbtn"><button className="flz-iconbtn solid" aria-label="Work"><IconGrid /></button></span>
      <span className="flz-railbtn"><button className="flz-iconbtn ghost" aria-label="Search"><IconSearch /></button></span>
      <span className="flz-railbtn"><button className="flz-iconbtn ghost" aria-label="Messages"><IconMail /></button></span>
    </div>
  );
}

function StatTile({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="flz-stat-tile" style={{ minWidth: unit ? 112 : 132 }}>
      <div style={{ font: `500 9.5px/1 var(--flz-font-mono)`, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--flz-text-muted)", marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3 }}>
        <span style={{ font: `500 28px/1 var(--flz-font-display)`, letterSpacing: "-.02em", color: "var(--flz-text-primary)" }}>{value}</span>
        {unit && <span style={{ font: `500 13px/1 var(--flz-font-sans)`, color: "var(--flz-text-secondary)", marginBottom: 2 }}>{unit}</span>}
      </div>
    </div>
  );
}

function ProjectTile({ project }: { project: typeof PROJECTS[number] }) {
  const tileStyle: React.CSSProperties = {
    position: "relative", overflow: "hidden",
    display: "flex", flexDirection: "column", justifyContent: "space-between",
    padding: 15, borderRadius: 22,
    background: "var(--flz-accent-soft)",
    border: "1px solid var(--flz-border-glass)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.34),inset 0 -1px 0 rgba(255,255,255,.12),inset 0 0 20px rgba(255,255,255,.05)",
    textDecoration: "none", color: "inherit",
  };
  return (
    <a href="#" className="flz-tile" style={tileStyle}>
      <div style={{ position: "absolute", inset: 0, background: project.grad }} />
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ font: `500 9.5px/1 var(--flz-font-mono)`, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--flz-text-secondary)" }}>{project.tools}</span>
        <span className="flz-tile-arr" style={{ color: "var(--flz-text-primary)" }}><IconNE /></span>
      </div>
      <div style={{ position: "relative" }}>
        <div style={{ font: `500 20px/1 var(--flz-font-display)`, letterSpacing: "-.02em", color: "var(--flz-text-primary)" }}>{project.title}</div>
        <div style={{ font: `400 var(--flz-fs-body-sm)/1 var(--flz-font-sans)`, color: "var(--flz-text-secondary)", marginTop: 6 }}>{project.cat} · {project.age}</div>
      </div>
    </a>
  );
}

function MainSlab({
  daysBuilding,
  activeFilter,
  setActiveFilter,
  visibleProjects,
}: {
  daysBuilding: string;
  activeFilter: string;
  setActiveFilter: (f: string) => void;
  visibleProjects: typeof PROJECTS;
}) {
  const slabStyle: React.CSSProperties = {
    position: "relative", flex: 1, minWidth: 0,
    display: "flex", flexDirection: "column", gap: 16,
    padding: "26px 28px", boxSizing: "border-box",
    borderRadius: 36,
    background: "var(--flz-glass-fill-raised)",
    border: "var(--flz-glass-border)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.55),inset 0 -1px 0 rgba(255,255,255,.24),inset 1px 0 0 rgba(255,255,255,.16),inset -1px 0 0 rgba(255,255,255,.16),var(--flz-glass-inner-glow),var(--flz-shadow-xl)",
    backdropFilter: `blur(var(--flz-blur-xl)) saturate(var(--flz-saturate)) brightness(1.06)`,
    WebkitBackdropFilter: `blur(var(--flz-blur-xl)) saturate(var(--flz-saturate)) brightness(1.06)`,
  };

  const wellStyle: React.CSSProperties = {
    flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 14,
    padding: 18, borderRadius: 28,
    background: "var(--flz-glass-fill-sunken)",
    border: "1px solid var(--flz-border-hairline)",
    boxShadow: "var(--flz-glass-specular)",
    backdropFilter: `blur(var(--flz-blur-sm)) saturate(var(--flz-saturate))`,
    WebkitBackdropFilter: `blur(var(--flz-blur-sm)) saturate(var(--flz-saturate))`,
  };

  // Pad to 6 tiles (show empty placeholders)
  const tiles = [...visibleProjects];
  while (tiles.length < 6) tiles.push({ id: -tiles.length, tools: "", title: "", cat: "", age: "", grad: "none" });

  return (
    <div style={slabStyle}>
      {/* Glass optics overlays */}
      <div style={{ position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none", zIndex: 3, background: "linear-gradient(180deg,rgba(255,255,255,.22) 0%,rgba(255,255,255,.05) 7%,rgba(255,255,255,0) 22%),linear-gradient(0deg,rgba(255,255,255,.13) 0%,rgba(255,255,255,0) 10%),linear-gradient(105deg,rgba(255,255,255,.1) 0%,rgba(255,255,255,0) 26%)" }} />
      <div style={{ position: "absolute", top: -16, left: "6%", width: 190, height: 52, borderRadius: "50%", background: "radial-gradient(closest-side,rgba(255,255,255,.6),rgba(255,255,255,0))", filter: "blur(11px)", pointerEvents: "none", zIndex: 3 }} />
      <div style={{ position: "absolute", bottom: -14, right: "9%", width: 230, height: 46, borderRadius: "50%", background: "radial-gradient(closest-side,rgba(255,255,255,.42),rgba(255,255,255,0))", filter: "blur(13px)", pointerEvents: "none", zIndex: 3 }} />

      {/* Nav row */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <span style={{ font: `500 22px/1 var(--flz-font-display)`, letterSpacing: "-.04em", color: "var(--flz-text-primary)" }}>
          Flz<span style={{ color: "var(--flz-text-muted)" }}>.</span>works
        </span>
      </div>

      {/* Hero row */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 26 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: "12px 0 0", font: `500 46px/0.96 var(--flz-font-display)`, letterSpacing: "-.032em", color: "var(--flz-text-primary)" }}>
            Games and 3D,<br />built in public.
          </h1>
        </div>
        <div style={{ flexShrink: 0, display: "flex", gap: 12 }}>
          <StatTile label="Building since 2023.09.01" value={daysBuilding} unit="days" />
          <StatTile label="Projects" value="48" />
          <StatTile label="Followers" value="1.2" unit="k" />
          <StatTile label="Wishlists" value="9.4" unit="k" />
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
        {FILTERS.map(f => (
          <button key={f} className={`flz-chip${activeFilter === f ? " active" : ""}`} onClick={() => setActiveFilter(f)}>{f}</button>
        ))}
      </div>

      {/* Main content: routing well + right column */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 18 }}>

        {/* Routing well (sunken glass) */}
        <div style={wellStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ flexShrink: 0, whiteSpace: "nowrap", font: `500 var(--flz-fs-label)/1 var(--flz-font-mono)`, letterSpacing: "var(--flz-ls-label)", textTransform: "uppercase", color: "var(--flz-text-muted)" }}>Recent projects</div>
            <span style={{ flexShrink: 0, whiteSpace: "nowrap", font: `400 var(--flz-fs-body-sm)/1 var(--flz-font-sans)`, color: "var(--flz-text-secondary)" }}>Page 1 of 4</span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button className="flz-iconbtn glass" aria-label="Previous"><IconArrow size={15} rotate /></button>
              <button className="flz-iconbtn glass" aria-label="Next"><IconArrow size={15} /></button>
              <button className="flz-iconbtn glass" aria-label="Grid view"><IconGrid /></button>
            </div>
          </div>

          {/* 3×2 tile grid */}
          <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gridTemplateRows: "1fr 1fr", gap: 12 }}>
            {tiles.slice(0, 6).map((p, i) =>
              p.title
                ? <ProjectTile key={p.id} project={p as typeof PROJECTS[number]} />
                : <div key={i} style={{ borderRadius: 22, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }} />
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ flexShrink: 0, width: 322, display: "flex", flexDirection: "column", gap: 18, minHeight: 0, height: "100%" }}>

          {/* Featured card */}
          <a href="#" className="flz-tile" style={{ flex: "1.25", minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 28, background: "var(--flz-glass-fill-sunken)", border: "var(--flz-glass-border)", boxShadow: "var(--flz-glass-specular)", textDecoration: "none", color: "inherit" }}>
            <div style={{ flex: 1, minHeight: 120, position: "relative", background: "radial-gradient(130% 130% at 28% 12%,#d8c3a6,#7a5f47 55%,#221910)" }}>
              <span style={{ position: "absolute", top: 12, left: 12 }}>
                <span className="flz-badge"><span className="flz-badge-dot" />Featured · latest</span>
              </span>
            </div>
            <div style={{ padding: "15px 16px 16px" }}>
              <div style={{ font: `500 var(--flz-fs-h3)/1.1 var(--flz-font-display)`, letterSpacing: "var(--flz-ls-h3)", color: "var(--flz-text-primary)" }}>Ronin — stylized swordsman</div>
              <div style={{ font: `400 var(--flz-fs-body-sm)/1.45 var(--flz-font-sans)`, color: "var(--flz-text-secondary)", marginTop: 7 }}>Hand-painted, 24k tris, game-ready. Full breakdown, block-out to pose.</div>
            </div>
          </a>

          {/* Discord card */}
          <div style={{ flexShrink: 0, padding: 18, borderRadius: 28, background: "var(--flz-glass-fill-sunken)", border: "var(--flz-glass-border)", boxShadow: "var(--flz-glass-specular)", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, background: "#5865F2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                  <path d="M19.3 5.3A17 17 0 0 0 15 4l-.2.4a15 15 0 0 1 3.7 1.2 13 13 0 0 0-11-.1A14 14 0 0 1 11.3 4L11 3.6A17 17 0 0 0 6.7 5 18 18 0 0 0 3.6 17a17 17 0 0 0 5.2 2.6l.6-.9a11 11 0 0 1-1.8-.9l.4-.3a12 12 0 0 0 10 0l.5.3c-.6.4-1.2.7-1.9.9l.6 1a17 17 0 0 0 5.2-2.7A18 18 0 0 0 19.3 5.3ZM9.4 14.3c-.7 0-1.3-.7-1.3-1.5s.6-1.5 1.3-1.5 1.3.7 1.3 1.5-.6 1.5-1.3 1.5Zm5.2 0c-.7 0-1.3-.7-1.3-1.5s.6-1.5 1.3-1.5 1.3.7 1.3 1.5-.6 1.5-1.3 1.5Z"/>
                </svg>
              </span>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ font: `500 var(--flz-fs-body)/1 var(--flz-font-display)`, color: "var(--flz-text-primary)" }}>The Discord</div>
                <div style={{ font: `500 10px/1 var(--flz-font-mono)`, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--flz-text-muted)", marginTop: 4 }}>Daily WIPs · feedback</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <span style={{ display: "inline-flex", alignItems: "flex-start", gap: 2 }}>
                <span style={{ font: `500 40px/1 var(--flz-font-display)`, letterSpacing: "-.028em", color: "var(--flz-text-primary)" }}>840</span>
                <span style={{ font: `500 var(--flz-fs-body)/1 var(--flz-font-display)`, color: "var(--flz-text-secondary)", marginTop: 4 }}>members</span>
              </span>
              <button className="flz-btn-solid">Join</button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: pager dots + build strip */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, paddingTop: 2 }}>
        <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
          <span style={{ width: 22, height: 6, borderRadius: 99, background: "var(--flz-text-primary)" }} />
          <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--flz-border-strong)" }} />
          <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--flz-border-strong)" }} />
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ font: `500 var(--flz-fs-label)/1 var(--flz-font-mono)`, letterSpacing: "var(--flz-ls-label)", textTransform: "uppercase", color: "var(--flz-text-muted)" }}>Now building · Skybound ch.3</span>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PortfolioHubPage() {
  const [daysBuilding, setDaysBuilding] = useState("—");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const start = new Date("2023-09-01T00:00:00").getTime();
    setDaysBuilding(String(Math.floor((Date.now() - start) / 86400000)));
  }, []);

  const visibleProjects =
    activeFilter === "All" ? PROJECTS : PROJECTS.filter(p => p.cat === activeFilter);

  return (
    <div className="flz-hub-root" style={{ minHeight: "100vh", background: "#0d0b0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <style dangerouslySetInnerHTML={{ __html: DS_TOKENS }} />

      {/* Hub canvas */}
      <div style={{ width: 1360, height: 900, maxWidth: "100%", position: "relative", borderRadius: 44, overflow: "hidden", boxShadow: "0 50px 110px rgba(0,0,0,.6)", fontFamily: "var(--flz-font-sans), sans-serif" }}>

        {/* Warm ground gradients */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(44% 38% at 29% 12%,rgba(214,192,163,.34) 0%,rgba(214,192,163,0) 62%),radial-gradient(56% 52% at 88% 28%,rgba(150,124,95,.22) 0%,rgba(150,124,95,0) 64%),radial-gradient(48% 44% at 6% 94%,rgba(12,10,8,.92) 0%,rgba(12,10,8,0) 66%),linear-gradient(180deg,rgba(14,12,10,.62) 0%,rgba(14,12,10,.1) 26%),linear-gradient(158deg,#332c24 0%,#241f1a 48%,#141110 100%)" }} />

        {/* Animated drift orbs */}
        <div className="flz-orb" style={{ position: "absolute", top: "2%", left: "14%", width: 420, height: 300, borderRadius: "50%", background: "radial-gradient(closest-side,rgba(232,214,189,.5),rgba(232,214,189,0))", filter: "blur(46px)", animation: "flz-drift1 34s ease-in-out infinite", willChange: "transform" }} />
        <div className="flz-orb" style={{ position: "absolute", top: "34%", right: "6%", width: 460, height: 340, borderRadius: "50%", background: "radial-gradient(closest-side,rgba(176,140,102,.38),rgba(176,140,102,0))", filter: "blur(52px)", animation: "flz-drift2 44s ease-in-out infinite", willChange: "transform" }} />
        <div className="flz-orb" style={{ position: "absolute", bottom: "-8%", left: "38%", width: 520, height: 340, borderRadius: "50%", background: "radial-gradient(closest-side,rgba(120,132,150,.22),rgba(120,132,150,0))", filter: "blur(58px)", animation: "flz-drift3 52s ease-in-out infinite", willChange: "transform" }} />
        <div style={{ position: "absolute", bottom: "-6%", right: "5%", width: 380, height: 300, borderRadius: 60, background: "#100d0b", filter: "blur(48px)", opacity: 0.7 }} />

        {/* Dark scrim */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(180deg,rgba(12,10,9,.5) 0%,rgba(12,10,9,.3) 45%,rgba(12,10,9,.58) 100%)" }} />

        {/* UI layer */}
        <div style={{ position: "absolute", inset: 0, display: "flex", gap: 24, padding: "40px 44px", boxSizing: "border-box", zIndex: 1 }}>
          <IconRail />
          <MainSlab
            daysBuilding={daysBuilding}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            visibleProjects={visibleProjects}
          />
        </div>
      </div>

      {/* Hint strip */}
      <p style={{ marginTop: 22, font: `12.5px/1.6 var(--flz-font-sans), sans-serif`, color: "rgba(244,242,239,.5)", maxWidth: 860, textAlign: "center" }}>
        Try next: &ldquo;drop a real room photo behind the glass&rdquo; &middot; &ldquo;make the 6 lanes bigger, drop the right column&rdquo; &middot; &ldquo;warmer / brighter room&rdquo; &middot; &ldquo;open the 3D Characters lane as its own page&rdquo;
      </p>
    </div>
  );
}
