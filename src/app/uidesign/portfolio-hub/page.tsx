"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { relativeAge } from "@/lib/flz-date";
import { TelemetryConsent } from "@/components/telemetry-consent";
import { TELEMETRY_READY_EVENT, trackTelemetryEvent } from "@/lib/telemetry-client";

// ── Design token CSS (flz-works DS, scoped to this page) ─────────────────────
const DS_TOKENS = `
  .flz-hub-root {
    --flz-font-display: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif;
    --flz-font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
    --flz-font-mono: "SFMono-Regular", "SF Mono", ui-monospace, Menlo, Monaco, Consolas, monospace;
    font-synthesis: none;

    --flz-text-primary: #F4F2EF;
    --flz-text-secondary: rgba(244,242,239,0.62);
    --flz-text-muted: rgba(244,242,239,0.55);

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

    --flz-radius-sm: 12px;
    --flz-radius-md: 20px;
    --flz-radius-lg: 28px;
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
  /* ── Entrance / transition motion ──────────────────────────────────────── */
  @keyframes flz-rise {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes flz-tile-in {
    from { opacity: 0; transform: translateY(10px) scale(.985); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes flz-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes flz-modal-in {
    from { opacity: 0; transform: translateY(10px) scale(.97); }
    to   { opacity: 1; transform: none; }
  }

  /* Staggered section reveal on mount */
  .flz-enter {
    animation: flz-rise .52s var(--flz-ease-glass) both;
    animation-delay: var(--flz-delay, 0ms);
  }
  /* Routing-well swap between work / search */
  .flz-view {
    animation: flz-rise .34s var(--flz-ease-glass) both;
  }
  /* Grid tiles — re-staggers when the filter changes */
  .flz-tile-in {
    animation: flz-tile-in .46s var(--flz-ease-glass) both;
    animation-delay: var(--flz-delay, 0ms);
  }
  .flz-backdrop { animation: flz-fade-in .2s var(--flz-ease-std) both; }
  .flz-modal    { animation: flz-modal-in .28s var(--flz-ease-glass) both; }

  @media (prefers-reduced-motion: reduce) {
    .flz-orb { animation-duration: 1ms !important; animation-iteration-count: 1 !important; }
    .flz-enter, .flz-view, .flz-tile-in, .flz-backdrop, .flz-modal {
      animation-duration: 1ms !important;
      animation-delay: 0ms !important;
    }
    .flz-tile, .flz-tile-arr, .flz-railbtn, .flz-chip, .flz-iconbtn, .flz-btn-solid {
      transition-duration: 1ms !important;
    }
    .flz-tile:hover, .flz-railbtn:hover, .flz-tile:hover .flz-tile-arr { transform: none; }
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
    font: 500 13px/1 var(--flz-font-sans);
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
    font: 500 13px/1 var(--flz-font-sans);
    border: none; cursor: pointer; transition: background .16s;
    white-space: nowrap;
  }
  .flz-btn-solid:hover { background: #fff; }

  .flz-stat-tile {
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 12px 14px; border-radius: var(--flz-radius-md);
    background: #1c1a17; border: 1px solid rgba(255,255,255,.10);
  }

  .flz-iconbtn:focus-visible,
  .flz-chip:focus-visible,
  .flz-btn-solid:focus-visible {
    outline: 2px solid rgba(255,255,255,.6);
    outline-offset: 2px;
  }

  .flz-badge {
    display: inline-flex; align-items: center; gap: 6px; height: 22px;
    padding: 0 9px; border-radius: 999px;
    background: rgba(244,242,239,.15); border: 1px solid rgba(244,242,239,.22);
    font: 500 10.5px/1 var(--flz-font-mono);
    letter-spacing: .06em; text-transform: uppercase; color: #F4F2EF;
    backdrop-filter: blur(8px); white-space: nowrap;
  }
  .flz-badge-dot {
    width: 6px; height: 6px; border-radius: 50%; background: #4ade80; flex-shrink: 0;
  }

  /* ── Mobile layout ─────────────────────────────────────────────────────── */
  @media (max-width: 640px) {
    /* Root: allow scroll on mobile */
    .flz-hub-root { overflow: visible !important; }
    /* Content wrapper: stack vertically, tight padding, room for bottom bar */
    .flz-content {
      flex-direction: column !important;
      padding: 24px 16px 88px !important;
      gap: 16px !important;
      min-height: 100vh;
      min-height: 100dvh;
    }
    /* IconRail → fixed bottom bar */
    .flz-rail {
      position: fixed !important;
      bottom: 0; left: 0; right: 0;
      z-index: 40;
      width: auto !important;
      flex-direction: row !important;
      align-self: stretch !important;
      border-radius: 0 !important;
      padding: 10px 0 max(10px, env(safe-area-inset-bottom)) !important;
      justify-content: center;
      gap: 20px !important;
    }
    /* MainSlab: full-bleed, tighter padding */
    .flz-slab {
      border-radius: 20px !important;
      padding: 20px !important;
      gap: 18px !important;
      min-height: 0 !important;
      overflow: visible !important;
    }
    /* Hero row: stack headline + stats */
    .flz-hero {
      flex-direction: column !important;
      gap: 18px !important;
      align-items: flex-start !important;
    }
    /* Don't let the headline stretch */
    .flz-hero > *:first-child {
      flex: none !important;
    }
    /* Stat tiles: equal-width row */
    .flz-stats {
      width: 100%;
      flex-shrink: 1 !important;
      gap: 8px !important;
    }
    .flz-stat-tile {
      width: 0 !important;
      height: auto !important;
      min-width: 0 !important;
      padding: 10px 10px !important;
      flex: 1 1 0% !important;
      aspect-ratio: 1;
    }
    /* Filter chips: horizontal scroll */
    .flz-filters {
      flex-wrap: nowrap !important;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .flz-filters::-webkit-scrollbar { display: none; }
    /* Main content area: stack grid + right column */
    .flz-main-area {
      flex-direction: column !important;
      gap: 18px !important;
      min-height: auto !important;
      flex: none !important;
      overflow: visible !important;
    }
    .flz-main-area > div:first-child {
      overflow: visible !important;
      min-height: auto !important;
      flex: none !important;
    }
    /* Project grid: 2 columns, auto rows */
    .flz-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      grid-template-rows: auto auto auto !important;
      gap: 10px !important;
    }
    /* Right column: full width, stack */
    .flz-sidebar {
      width: 100% !important;
      flex-direction: column !important;
      height: auto !important;
    }
    /* Featured card: minimum height for the image */
    .flz-featured { min-height: 320px !important; flex: none !important; }
    /* Contact modal: near-full-width */
    .flz-modal { width: calc(100vw - 32px) !important; max-width: 560px !important; }
    /* Contact modal close button: keep inside viewport */
    .flz-modal-close { top: -10px !important; right: -4px !important; }
    /* Pager row header: wrap */
    .flz-pager-row { flex-wrap: wrap; gap: 10px !important; }
    .flz-pager-row .flz-iconbtn.glass { width: 28px !important; height: 28px !important; }
    /* ContactCard internals: stack on mobile */
    .flz-contact-inner { flex-direction: column !important; }
    .flz-contact-qr { width: 100% !important; flex-direction: row !important; padding: 10px 14px !important; border-radius: 12px !important; }
  }

  /* HIG-inspired visual skin. Structure and responsive layout stay intact. */
  .flz-hub-root {
    --flz-text-primary: #1d1d1f;
    --flz-text-secondary: rgba(29,29,31,.68);
    --flz-text-muted: rgba(29,29,31,.46);
    --flz-glass-fill-raised: rgba(255,255,255,.7);
    --flz-glass-border: 1px solid rgba(255,255,255,.88);
    --flz-border-strong: rgba(29,29,31,.18);
    background:
      radial-gradient(circle at 84% 2%, rgba(202,218,244,.78), transparent 32rem),
      radial-gradient(circle at 10% 96%, rgba(247,219,205,.48), transparent 36rem),
      linear-gradient(180deg, #fbfbfd 0%, #f5f5f7 48%, #ececef 100%) !important;
    color-scheme: light;
  }
  .flz-hub-root > .flz-orb:nth-of-type(1) { background: radial-gradient(closest-side,rgba(132,177,244,.34),transparent) !important; }
  .flz-hub-root > .flz-orb:nth-of-type(2) { background: radial-gradient(closest-side,rgba(245,194,170,.24),transparent) !important; }
  .flz-hub-root > .flz-orb:nth-of-type(3) { background: radial-gradient(closest-side,rgba(176,160,224,.2),transparent) !important; }
  .flz-slab {
    background: linear-gradient(145deg,rgba(255,255,255,.76),rgba(247,247,250,.7));
    border: 1px solid rgba(255,255,255,.9);
    box-shadow: inset 0 0 0 1px rgba(29,29,31,.05), 0 34px 90px rgba(37,39,46,.14);
    backdrop-filter: blur(34px) saturate(165%);
    -webkit-backdrop-filter: blur(34px) saturate(165%);
  }
  .flz-stat-tile,
  .flz-tile,
  .flz-sidebar > * {
    background-color: rgba(255,255,255,.7) !important;
    border-color: rgba(255,255,255,.88) !important;
    box-shadow: inset 0 0 0 1px rgba(29,29,31,.075), 0 14px 34px rgba(37,39,46,.075);
  }
  .flz-tile:hover {
    border-color: rgba(29,29,31,.14) !important;
    box-shadow: inset 0 0 0 1px rgba(29,29,31,.08), 0 22px 46px rgba(37,39,46,.13);
  }
  .flz-chip { border-color: rgba(29,29,31,.08); background: rgba(29,29,31,.035); color: rgba(29,29,31,.66); }
  .flz-chip:hover { background: rgba(29,29,31,.075); color: #1d1d1f; }
  .flz-chip.active { background: #1d1d1f; border-color: #1d1d1f; color: #fff; box-shadow: 0 7px 18px rgba(29,29,31,.16); }
  .flz-iconbtn { color: #1d1d1f; }
  .flz-iconbtn.solid { background: #1d1d1f; color: #fff; box-shadow: 0 7px 18px rgba(29,29,31,.18); }
  .flz-iconbtn.glass { background: rgba(255,255,255,.66); border-color: rgba(29,29,31,.08); }
  .flz-btn-solid { background: #1d1d1f; color: #fff; box-shadow: 0 10px 24px rgba(29,29,31,.16); }
  .flz-iconbtn:active,
  .flz-chip:active,
  .flz-btn-solid:active { transform: scale(.96); }
  .flz-iconbtn:focus-visible,
  .flz-chip:focus-visible,
  .flz-btn-solid:focus-visible { outline: 3px solid rgba(10,132,255,.62); outline-offset: 3px; }
  .flz-badge { background: rgba(29,29,31,.7); border-color: rgba(255,255,255,.28); color: #fff; }
  .flz-modal { filter: drop-shadow(0 28px 70px rgba(37,39,46,.22)); }

  /* Motion layer: transform/opacity only, so the preserved layout never shifts. */
  @keyframes flz-shell-in {
    from { opacity: 0; transform: translateY(18px) scale(.992); filter: blur(6px); }
    to { opacity: 1; transform: none; filter: blur(0); }
  }
  @keyframes flz-rail-in {
    from { opacity: 0; transform: translateX(-14px) scale(.94); }
    to { opacity: 1; transform: none; }
  }
  @keyframes flz-stat-pop {
    from { opacity: 0; transform: translateY(10px) scale(.96); }
    to { opacity: 1; transform: none; }
  }
  @keyframes flz-panel-rise {
    from { opacity: 0; transform: translateY(12px) scale(.985); }
    to { opacity: 1; transform: none; }
  }
  @keyframes flz-control-pop {
    0% { transform: scale(.96); }
    70% { transform: scale(1.025); }
    100% { transform: none; }
  }
  .flz-slab { animation: flz-shell-in .68s var(--flz-ease-glass) both; }
  .flz-rail { animation: flz-rail-in .58s var(--flz-ease-glass) 120ms both; }
  .flz-stats .flz-stat-tile { animation: flz-stat-pop .48s var(--flz-ease-glass) backwards; }
  .flz-stats .flz-stat-tile:nth-child(1) { animation-delay: 140ms; }
  .flz-stats .flz-stat-tile:nth-child(2) { animation-delay: 190ms; }
  .flz-stats .flz-stat-tile:nth-child(3) { animation-delay: 240ms; }
  .flz-sidebar > * { animation: flz-panel-rise .55s var(--flz-ease-glass) backwards; }
  .flz-sidebar > :nth-child(1) { animation-delay: 280ms; }
  .flz-sidebar > :nth-child(2) { animation-delay: 340ms; }
  .flz-chip.active { animation: flz-control-pop .3s var(--flz-ease-glass); }
  .flz-stat-tile { transition: transform .25s var(--flz-ease-glass), box-shadow .25s var(--flz-ease-glass); }
  .flz-iconbtn { transition: background .16s, color .16s, transform .2s var(--flz-ease-glass), box-shadow .2s var(--flz-ease-glass); }

  @media (hover: hover) {
    .flz-stat-tile:hover { transform: translateY(-2px); box-shadow: inset 0 0 0 1px rgba(29,29,31,.08), 0 18px 38px rgba(37,39,46,.11); }
    .flz-iconbtn:hover { transform: scale(1.045); }
  }
  @media (prefers-reduced-motion: reduce) {
    .flz-slab,
    .flz-rail,
    .flz-stats .flz-stat-tile,
    .flz-sidebar > *,
    .flz-chip.active { animation: none !important; }
    .flz-stat-tile:hover,
    .flz-iconbtn:hover { transform: none !important; }
  }
`;

// ── Static data ──────────────────────────────────────────────────────────────
const PROJECTS: { id: number; tools: string; title: string; cat: string; age: string; grad: string; link: string; img: string; body: string }[] = [];

const FILTERS = ["All", "Social", "Assets", "Characters", "Gameplay", "Automotive"];

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

type ActiveView = "work" | "search";

// ── Sub-components ────────────────────────────────────────────────────────────
function IconRail({ activeView, setActiveView, contactOpen, setContactOpen }: {
  activeView: ActiveView; setActiveView: (v: ActiveView) => void;
  contactOpen: boolean; setContactOpen: (v: boolean) => void;
}) {
  const railStyle: React.CSSProperties = {
    position: "relative", flexShrink: 0, width: 48, alignSelf: "center",
    padding: 8, display: "flex", flexDirection: "column", gap: 8, alignItems: "center",
    borderRadius: 999,
    background: "var(--flz-glass-fill-raised)",
    border: "var(--flz-glass-border)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.55),inset 0 -1px 0 rgba(255,255,255,.22),inset 1px 0 0 rgba(255,255,255,.16),inset -1px 0 0 rgba(255,255,255,.16),var(--flz-glass-inner-glow),var(--flz-shadow-lg)",
    backdropFilter: `blur(var(--flz-blur-xl)) saturate(var(--flz-saturate)) brightness(1.06)`,
    WebkitBackdropFilter: `blur(var(--flz-blur-xl)) saturate(var(--flz-saturate)) brightness(1.06)`,
  };
  return (
    <div className="flz-rail" style={railStyle}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none", background: "linear-gradient(180deg,rgba(255,255,255,.24) 0%,rgba(255,255,255,0) 14%),linear-gradient(0deg,rgba(255,255,255,.14) 0%,rgba(255,255,255,0) 12%)" }} />
      <span className="flz-railbtn"><button className={`flz-iconbtn ${activeView === "work" ? "solid" : "ghost"}`} aria-label="Work" onClick={() => setActiveView("work")}><IconGrid /></button></span>
      <span className="flz-railbtn"><button className={`flz-iconbtn ${activeView === "search" ? "solid" : "ghost"}`} aria-label="Search" onClick={() => setActiveView("search")}><IconSearch /></button></span>
      <span className="flz-railbtn"><button className={`flz-iconbtn ${contactOpen ? "solid" : "ghost"}`} aria-label="Messages" onClick={() => setContactOpen(!contactOpen)}><IconMail /></button></span>
    </div>
  );
}

function SearchView({ allProjects }: { allProjects: typeof PROJECTS }) {
  const [query, setQuery] = useState("");
  const visible = query.trim()
    ? allProjects.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.tools.toLowerCase().includes(query.toLowerCase()) ||
        p.cat.toLowerCase().includes(query.toLowerCase())
      )
    : allProjects;

  const tiles = [...visible];
  while (tiles.length < 6) tiles.push({ id: -tiles.length, tools: "", title: "", cat: "", age: "", grad: "none", link: "", img: "", body: "" });

  return (
    <div className="flz-view" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 20, background: "#1c1a17", border: "1px solid rgba(255,255,255,.10)" }}>
        <IconSearch />
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search projects, tools, categories…"
          style={{ flex: 1, background: "none", border: "none", outline: "none", font: `400 15px/1 var(--flz-font-sans)`, color: "var(--flz-text-primary)", caretColor: "var(--flz-text-primary)" }}
        />
        {query && (
          <button onClick={() => setQuery("")} aria-label="Clear search" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--flz-text-muted)", lineHeight: 1, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: "50%" }}>✕</button>
        )}
      </div>
      <div className="flz-grid" style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gridAutoRows: "minmax(180px, 1fr)", gap: 12 }}>
        {tiles.map((p, i) => (
          <div
            key={p.title ? p.id : `empty${i}`}
            className="flz-tile-in"
            style={{ "--flz-delay": `${i * 45}ms`, display: "flex", minWidth: 0, minHeight: 0 } as React.CSSProperties}
          >
            {p.title
              ? <ProjectTile project={p as typeof PROJECTS[number]} />
              : <div style={{ flex: 1, borderRadius: 28, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactCard() {
  const downloadVCard = () => {
    trackTelemetryEvent("vcard_download", "main");
    const vcard = [
      "BEGIN:VCARD", "VERSION:3.0",
      "FN:Bence Flosz", "N:Flosz;Bence;;;",
      "ORG:FLZ Works",
      "TITLE:3D Artist & Game Developer",
      "EMAIL:hi@flz.works",
      "URL:https://flz.works",
      "END:VCARD",
    ].join("\n");
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "flz.vcf"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 14, overflow: "hidden" }}>
      <div style={{ font: `500 9.5px/1 var(--flz-font-mono)`, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--flz-text-muted)" }}>Contact</div>
      <div className="flz-contact-inner" style={{ display: "flex", gap: 14, flex: 1, minHeight: 0 }}>
        {/* ID Card */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 0, padding: "18px 20px", borderRadius: 20, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.14)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.18)" }}>
          <div style={{ font: `500 9px/1 var(--flz-font-mono)`, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(255,196,88,.8)", borderBottom: "1px solid rgba(255,255,255,.1)", paddingBottom: 12, marginBottom: 16 }}>FLZ WORKS // IDENTITY CARD</div>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flex: 1 }}>
            <div style={{ width: 72, height: 88, borderRadius: 12, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", overflow: "hidden", flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size contact portrait */}
              <img src="/profile.jpg" alt="Bence Flosz" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["NAME", "Bence Flosz"],
                ["HANDLE", "@flz"],
                ["ROLE", "3D Artist & Game Dev"],
                ["EMAIL", "hi@flz.works"],
                ["WEB", "flz.works"],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ font: `500 8.5px/1 var(--flz-font-mono)`, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--flz-text-muted)", marginBottom: 2 }}>{label}</div>
                  <div style={{ font: `500 13px/1 var(--flz-font-display)`, color: "var(--flz-text-primary)" }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={downloadVCard} style={{ marginTop: 18, width: "100%", padding: "10px 0", background: "rgba(255,196,88,.15)", border: "1px solid rgba(255,196,88,.3)", borderRadius: 12, cursor: "pointer", font: `700 9px/1 var(--flz-font-mono)`, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(255,196,88,.9)", transition: "background .14s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,196,88,.25)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,196,88,.15)")}
          >[ Download vCard ]</button>
        </div>
        {/* QR */}
        <div className="flz-contact-qr" style={{ flexShrink: 0, width: 120, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 12, borderRadius: 20, background: "#fff" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://flz.works" alt="QR" style={{ display: "block", width: "100%", height: "auto" }} />
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="flz-stat-tile" style={{ width: 100, height: 100 }}>
      <div style={{ font: `500 9.5px/1 var(--flz-font-mono)`, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--flz-text-muted)", marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3 }}>
        <span style={{ font: `500 24px/1 var(--flz-font-display)`, letterSpacing: "-.02em", color: "var(--flz-text-primary)" }}>{value}</span>
        {unit && <span style={{ font: `500 12px/1 var(--flz-font-sans)`, color: "var(--flz-text-secondary)", marginBottom: 2 }}>{unit}</span>}
      </div>
    </div>
  );
}

function ProjectTile({ project }: { project: typeof PROJECTS[number] }) {
  const tileStyle: React.CSSProperties = {
    position: "relative", overflow: "hidden",
    flex: 1, minWidth: 0, minHeight: 0,
    display: "flex", flexDirection: "column", justifyContent: "space-between",
    padding: 15, borderRadius: 28,
    background: "#1c1a17",
    border: "1px solid rgba(255,255,255,.10)",
    textDecoration: "none", color: "inherit",
  };
  // "Link" in the studio editor is what the tile opens; without one it stays inert.
  const external = /^https?:\/\//i.test(project.link);
  return (
    <a
      href={project.link || "#"}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flz-tile"
      style={tileStyle}
    >
      <div style={{ position: "absolute", inset: 0, background: project.grad }} />
      {project.img && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- author-supplied URL, no loader */}
          <img
            src={project.img}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          {/* Keeps the title and meta legible over any photo. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg,rgba(12,10,9,.15) 0%,rgba(12,10,9,.35) 45%,rgba(12,10,9,.82) 100%)",
            }}
          />
        </>
      )}
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ font: `500 9.5px/1 var(--flz-font-mono)`, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--flz-text-secondary)" }}>{project.tools}</span>
        <span className="flz-tile-arr" style={{ color: "var(--flz-text-primary)" }}><IconNE /></span>
      </div>
      <div style={{ position: "relative" }}>
        <div style={{ font: `500 20px/1 var(--flz-font-display)`, letterSpacing: "-.02em", color: "var(--flz-text-primary)" }}>{project.title}</div>
        {project.body && (
          <p
            style={{
              font: `400 var(--flz-fs-body-sm)/1.4 var(--flz-font-sans)`,
              color: "var(--flz-text-secondary)",
              margin: "6px 0 0",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {project.body}
          </p>
        )}
        <div style={{ font: `400 var(--flz-fs-body-sm)/1 var(--flz-font-sans)`, color: "var(--flz-text-secondary)", marginTop: 6 }}>
          {[project.cat, project.age].filter(Boolean).join(" · ")}
        </div>
      </div>
    </a>
  );
}

function DiscordCard({ url }: { url: string }) {
  const cardStyle: React.CSSProperties = {
    flexShrink: 0, padding: 18, borderRadius: 28,
    background: "#1c1a17", border: "1px solid rgba(255,255,255,.10)",
    display: "flex", flexDirection: "column", gap: 14,
    textDecoration: "none", color: "inherit",
  };

  const inner = (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <span style={{ width: 38, height: 38, borderRadius: 12, background: "#5865F2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
            <path d="M19.3 5.3A17 17 0 0 0 15 4l-.2.4a15 15 0 0 1 3.7 1.2 13 13 0 0 0-11-.1A14 14 0 0 1 11.3 4L11 3.6A17 17 0 0 0 6.7 5 18 18 0 0 0 3.6 17a17 17 0 0 0 5.2 2.6l.6-.9a11 11 0 0 1-1.8-.9l.4-.3a12 12 0 0 0 10 0l.5.3c-.6.4-1.2.7-1.9.9l.6 1a17 17 0 0 0 5.2-2.7A18 18 0 0 0 19.3 5.3ZM9.4 14.3c-.7 0-1.3-.7-1.3-1.5s.6-1.5 1.3-1.5 1.3.7 1.3 1.5-.6 1.5-1.3 1.5Zm5.2 0c-.7 0-1.3-.7-1.3-1.5s.6-1.5 1.3-1.5 1.3.7 1.3 1.5-.6 1.5-1.3 1.5Z"/>
          </svg>
        </span>
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ font: `500 var(--flz-fs-body)/1 var(--flz-font-display)`, color: "var(--flz-text-primary)" }}>The Discord</div>
          <div style={{ font: `500 10px/1 var(--flz-font-mono)`, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--flz-text-muted)", marginTop: 4 }}>Feedback</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <span style={{ display: "inline-flex", alignItems: "flex-start", gap: 2 }}>
          <span style={{ font: `500 40px/1 var(--flz-font-display)`, letterSpacing: "-.028em", color: "var(--flz-text-primary)" }}>soon</span>
        </span>
        {url && <span className="flz-tile-arr" style={{ color: "var(--flz-text-primary)" }}><IconNE /></span>}
      </div>
    </>
  );

  return url ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flz-tile"
      style={cardStyle}
      onClick={() => trackTelemetryEvent("social_open", "main", "discord")}
    >
      {inner}
    </a>
  ) : (
    <div style={cardStyle}>{inner}</div>
  );
}

function MainSlab({
  daysBuilding,
  settings,
  activeFilter,
  setActiveFilter,
  visibleProjects,
  allProjects,
  activeView,
}: {
  daysBuilding: string;
  settings: Record<string, string>;
  activeFilter: string;
  setActiveFilter: (f: string) => void;
  visibleProjects: typeof PROJECTS;
  allProjects: typeof PROJECTS;
  activeView: ActiveView;
}) {
  const [projectPage, setProjectPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(visibleProjects.length / 6));
  const safeProjectPage = Math.min(projectPage, pageCount - 1);

  const slabStyle: React.CSSProperties = {
    position: "relative", flex: 1, minWidth: 0,
    display: "flex", flexDirection: "column", gap: 22,
    padding: 28, boxSizing: "border-box",
    borderRadius: 28, overflow: "hidden",
  };

  const wellStyle: React.CSSProperties = {
    flex: 1, minWidth: 0, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column", gap: 14,
  };

  // Pad to 6 tiles (show empty placeholders)
  const tiles = visibleProjects.slice(safeProjectPage * 6, safeProjectPage * 6 + 6);
  while (tiles.length < 6) tiles.push({ id: -tiles.length, tools: "", title: "", cat: "", age: "", grad: "none", link: "", img: "", body: "" });

  return (
    <div className="flz-slab" style={slabStyle}>
      {/* Glass sheen overlay */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3, background: "linear-gradient(180deg,rgba(255,255,255,.14) 0%,rgba(255,255,255,.03) 7%,rgba(255,255,255,0) 22%),linear-gradient(0deg,rgba(255,255,255,.08) 0%,rgba(255,255,255,0) 10%),linear-gradient(105deg,rgba(255,255,255,.06) 0%,rgba(255,255,255,0) 26%)" }} />
      <div style={{ position: "absolute", top: -16, left: "6%", width: 190, height: 52, borderRadius: "50%", background: "radial-gradient(closest-side,rgba(255,255,255,.5),rgba(255,255,255,0))", filter: "blur(11px)", pointerEvents: "none", zIndex: 3 }} />
      <div style={{ position: "absolute", bottom: -14, right: "9%", width: 230, height: 46, borderRadius: "50%", background: "radial-gradient(closest-side,rgba(255,255,255,.32),rgba(255,255,255,0))", filter: "blur(13px)", pointerEvents: "none", zIndex: 3 }} />

      {/* Nav row */}
      <div className="flz-enter" style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <span style={{ font: `500 22px/1 var(--flz-font-display)`, letterSpacing: "-.04em", color: "var(--flz-text-primary)" }}>
          Flz<span style={{ color: "var(--flz-text-muted)" }}>.</span>works
        </span>
      </div>

      {/* Hero row */}
      <div className="flz-enter flz-hero" style={{ "--flz-delay": "70ms", display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" } as React.CSSProperties}>
        <div style={{ flex: "1 1 340px", minWidth: 0 }}>
          {/* Headline, counters and the Discord link below are edited in /studio. */}
          <h1 style={{ margin: 0, font: `500 clamp(2rem,1.4rem + 2.4vw,2.9rem)/0.98 var(--flz-font-display)`, letterSpacing: "-.032em", color: "var(--flz-text-primary)", whiteSpace: "pre-line" }}>
            {settings.hero_headline?.trim() || "Munca is now\nin development."}
          </h1>
        </div>
        <div className="flz-stats" style={{ flexShrink: 0, display: "flex", gap: 12 }}>
          <StatTile label="Building since" value={daysBuilding} unit="days" />
          <StatTile label="Followers" value={settings.followers_count?.trim() || "soon"} />
          <StatTile label="Wishlists" value={settings.wishlists_count?.trim() || "soon"} />
        </div>
      </div>

      {/* Filter chips */}
      <div className="flz-enter flz-filters" style={{ "--flz-delay": "140ms", display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" } as React.CSSProperties}>
        {FILTERS.map(f => (
          f === "Automotive"
            ? <Link key={f} href="/" className="flz-chip" style={{ textDecoration: "none" }}>{f}</Link>
            : <button key={f} className={`flz-chip${activeFilter === f ? " active" : ""}`} onClick={() => { setProjectPage(0); setActiveFilter(f); }}>{f}</button>
        ))}
      </div>

      {/* Main content: routing well + right column */}
      <div className="flz-enter flz-main-area" style={{ "--flz-delay": "200ms", flex: 1, minHeight: 0, display: "flex", gap: 18 } as React.CSSProperties}>

        {/* Routing well (sunken glass) */}
        <div style={wellStyle}>
          {activeView === "work" && (
            <div className="flz-view" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="flz-pager-row" style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ flexShrink: 0, whiteSpace: "nowrap", font: `500 var(--flz-fs-label)/1 var(--flz-font-mono)`, letterSpacing: "var(--flz-ls-label)", textTransform: "uppercase", color: "var(--flz-text-muted)" }}>Recent projects</div>
                <span style={{ flexShrink: 0, whiteSpace: "nowrap", font: `400 var(--flz-fs-body-sm)/1 var(--flz-font-sans)`, color: "var(--flz-text-secondary)" }}>Page {safeProjectPage + 1} of {pageCount}</span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  <button className="flz-iconbtn glass" aria-label="Previous" disabled={safeProjectPage === 0} onClick={() => setProjectPage(Math.max(0, safeProjectPage - 1))}><IconArrow size={15} rotate /></button>
                  <button className="flz-iconbtn glass" aria-label="Next" disabled={safeProjectPage >= pageCount - 1} onClick={() => setProjectPage(Math.min(pageCount - 1, safeProjectPage + 1))}><IconArrow size={15} /></button>
                </div>
              </div>
              <div className="flz-grid" style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gridTemplateRows: "1fr 1fr", gap: 12 }}>
                {tiles.slice(0, 6).map((p, i) => (
                  <div
                    key={`${activeFilter}-${p.title ? p.id : `empty${i}`}`}
                    className="flz-tile-in"
                    style={{ "--flz-delay": `${i * 45}ms`, display: "flex", minWidth: 0, minHeight: 0 } as React.CSSProperties}
                  >
                    {p.title
                      ? <ProjectTile project={p as typeof PROJECTS[number]} />
                      : <div style={{ flex: 1, borderRadius: 28, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }} />}
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeView === "search" && <SearchView allProjects={allProjects} />}
        </div>

        {/* Right column */}
        <div className="flz-sidebar" style={{ flexShrink: 0, width: 322, display: "flex", flexDirection: "column", gap: 18, minHeight: 0, height: "100%" }}>

          {/* Featured card */}
          <a href="#" className="flz-tile flz-featured" style={{ flex: "1.25", minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 28, background: "#1c1a17", border: "1px solid rgba(255,255,255,.10)", textDecoration: "none", color: "inherit" }}>
            <div style={{ flex: 1, minHeight: 120, position: "relative", overflow: "hidden" }}>
              <iframe src="https://sketchfab.com/models/cbb1b3572d0545f8a8fdbdb09836ebd6/embed?autostart=1&preload=1&transparent=1&ui_hint=0" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} allow="autoplay; fullscreen; xr-spatial-tracking" />
              <span style={{ position: "absolute", top: 12, left: 12, zIndex: 1 }}>
                <span className="flz-badge">Featured · latest</span>
              </span>
            </div>
            <div style={{ padding: "15px 16px 16px" }}>
              <div style={{ font: `500 var(--flz-fs-h3)/1.1 var(--flz-font-display)`, letterSpacing: "var(--flz-ls-h3)", color: "var(--flz-text-primary)" }}>Pentagon Athaan 2026</div>
              <div style={{ font: `400 var(--flz-fs-body-sm)/1.45 var(--flz-font-sans)`, color: "var(--flz-text-secondary)", marginTop: 7 }}>Preview the model</div>
            </div>
          </a>

          {/* Discord card — the invite comes from the studio's site settings */}
          <DiscordCard url={settings.discord_url?.trim() || ""} />
        </div>
      </div>

      {/* Footer: pager dots + build strip */}
      <div className="flz-enter" style={{ "--flz-delay": "270ms", display: "flex", alignItems: "center", gap: 14, paddingTop: 2 } as React.CSSProperties}>

      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PortfolioHubPage() {
  const [daysBuilding, setDaysBuilding] = useState("—");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeView, setActiveView] = useState<ActiveView>("work");
  const [contactOpen, setContactOpen] = useState(false);

  // Dynamic projects & settings state from DB
  const [projectsList, setProjectsList] = useState<typeof PROJECTS>(PROJECTS);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Fetch live projects & admin status
    fetch("/api/flz/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data?.isAdmin) setIsAdmin(true);
        if (data?.projects && Array.isArray(data.projects)) {
          const mapped = data.projects.filter((p: { visible?: boolean }) => p.visible !== false).map((p: {
            id: number;
            tools: string;
            title: string;
            category: string;
            publishedAt: string | null;
            visible?: boolean;
            gradient?: string | null;
            linkUrl?: string | null;
            imageUrl?: string | null;
            body?: string | null;
          }) => ({
            id: p.id,
            tools: p.tools,
            title: p.title,
            cat: p.category,
            age: relativeAge(p.publishedAt),
            grad: p.gradient || "radial-gradient(120% 130% at 24% 6%,rgba(216,195,166,.62),rgba(120,96,72,.12) 55%,transparent 76%)",
            link: p.linkUrl || "",
            img: p.imageUrl || "",
            body: p.body || "",
          }));
          setProjectsList(mapped);
        }
      })
      .catch(() => {});

    // Fetch site settings
    fetch("/api/flz/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings) {
          setSettings(data.settings);
          if (data.settings.building_start_date) {
            const start = new Date(data.settings.building_start_date).getTime();
            if (!isNaN(start)) {
              setDaysBuilding(String(Math.floor((Date.now() - start) / 86400000)));
              return;
            }
          }
        }
        const defaultStart = new Date("2023-09-01T00:00:00").getTime();
        setDaysBuilding(String(Math.floor((Date.now() - defaultStart) / 86400000)));
      })
      .catch(() => {
        const defaultStart = new Date("2023-09-01T00:00:00").getTime();
        setDaysBuilding(String(Math.floor((Date.now() - defaultStart) / 86400000)));
      });
  }, []);

  useEffect(() => {
    if (!contactOpen) return;
    const recordView = () => trackTelemetryEvent("vcard_view", "main");
    recordView();
    window.addEventListener(TELEMETRY_READY_EVENT, recordView);
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setContactOpen(false); };
    document.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener(TELEMETRY_READY_EVENT, recordView);
      document.removeEventListener("keydown", handler);
    };
  }, [contactOpen]);

  const visibleProjects =
    activeFilter === "All" ? projectsList : projectsList.filter(p => p.cat === activeFilter);

  return (
    <div className="flz-hub-root" style={{
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden",
      background: "#100e0c",
      fontFamily: "var(--flz-font-sans), sans-serif",
    }}>
      <style dangerouslySetInnerHTML={{ __html: DS_TOKENS }} />
      <TelemetryConsent site="main" />

      {/* Ambient orbs */}
      <div className="flz-orb" style={{ position: "absolute", top: "2%", left: "14%", width: 420, height: 300, borderRadius: "50%", background: "radial-gradient(closest-side,rgba(232,214,189,.5),rgba(232,214,189,0))", filter: "blur(46px)", animation: "flz-drift1 34s ease-in-out infinite", willChange: "transform", pointerEvents: "none" }} />
      <div className="flz-orb" style={{ position: "absolute", top: "34%", right: "6%", width: 460, height: 340, borderRadius: "50%", background: "radial-gradient(closest-side,rgba(176,140,102,.38),rgba(176,140,102,0))", filter: "blur(52px)", animation: "flz-drift2 44s ease-in-out infinite", willChange: "transform", pointerEvents: "none" }} />
      <div className="flz-orb" style={{ position: "absolute", bottom: "10%", left: "38%", width: 520, height: 340, borderRadius: "50%", background: "radial-gradient(closest-side,rgba(120,132,150,.22),rgba(120,132,150,0))", filter: "blur(58px)", animation: "flz-drift3 52s ease-in-out infinite", willChange: "transform", pointerEvents: "none" }} />

      {/* Admin Quick Editor Badge (Only visible when logged in as Admin) */}
      {isAdmin && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 60 }}>
          <a
            href="/studio/admin"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 999,
              background: "rgba(6, 182, 212, 0.22)",
              border: "1px solid rgba(6, 182, 212, 0.45)",
              color: "#38bdf8",
              font: "600 12px/1 var(--flz-font-mono)",
              textTransform: "uppercase",
              letterSpacing: ".08em",
              backdropFilter: "blur(16px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              textDecoration: "none",
              transition: "transform .2s, background .2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#38bdf8" }} />
            ⚡ Edit FLZ Works
          </a>
        </div>
      )}

      {/* Contact card floater */}
      {contactOpen && (
        <div className="flz-backdrop" style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.4)", backdropFilter: "blur(6px)" }}
          onClick={() => setContactOpen(false)}>
          <div className="flz-modal" style={{ width: 560, position: "relative" }} onClick={e => e.stopPropagation()}>
            <button
              autoFocus
              onClick={() => setContactOpen(false)}
              aria-label="Close contact card"
              className="flz-modal-close"
              style={{ position: "absolute", top: -14, right: -14, zIndex: 10, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.28)", color: "#F4F2EF", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", font: "500 18px/1 system-ui" }}
            >×</button>
            <ContactCard />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flz-content" style={{ position: "relative", zIndex: 1, display: "flex", gap: 24, padding: "40px 44px", minHeight: "100vh", boxSizing: "border-box" }}>
        <IconRail activeView={activeView} setActiveView={setActiveView} contactOpen={contactOpen} setContactOpen={setContactOpen} />
        <MainSlab
          daysBuilding={daysBuilding}
          settings={settings}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          visibleProjects={visibleProjects}
          allProjects={projectsList}
          activeView={activeView}
        />
      </div>
    </div>
  );
}
