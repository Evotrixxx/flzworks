"use client";

import { useState, useEffect, useCallback } from "react";

interface Sample {
  slug: string;
  name: string;
  tagline: string;
  tags: string[];
  accent: string;
  glow: string;
  description: string;
  /** Standalone static site, served from /public */
  url: string;
}

const SAMPLES: Sample[] = [
  {
    slug: "lucent-ui",
    name: "Lucent UI",
    tagline: "Interactive WebGL Lens Gallery",
    tags: ["WebGL", "Magnifying Lens", "Shader", "Gallery"],
    accent: "#d1b894",
    glow: "rgba(209, 184, 148, 0.32)",
    description:
      "A full-screen WebGL exhibition where a customizable squircle lens magnifies and refracts the artwork beneath your cursor. Tune lens size, zoom, shape and bezel glow in real time, then crossfade between gallery pieces.",
    url: "/uidesign/lucent-ui/index.html",
  },
  {
    slug: "liquid-glass",
    name: "Liquid Glass Player",
    tagline: "WebGL Glassmorphism Music Player",
    tags: ["WebGL", "Glassmorphism", "SVG Filter", "Audio UI"],
    accent: "#60a5fa",
    glow: "rgba(96, 165, 250, 0.32)",
    description:
      "A frosted-glass music player floating over a living liquid WebGL backdrop with chromatic aberration and a cursor-driven refraction lens. Animated visualizer, scrubbable timeline, volume and an expandable playlist.",
    url: "/uidesign/liquid-glass/index.html",
  },
];

export default function UiDesignPreviewer() {
  const [active, setActive] = useState(0);

  const go = useCallback((dir: number) => {
    setActive((prev) => (prev + dir + SAMPLES.length) % SAMPLES.length);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const current = SAMPLES[active];
  const prev = SAMPLES[(active - 1 + SAMPLES.length) % SAMPLES.length];
  const next = SAMPLES[(active + 1) % SAMPLES.length];

  return (
    <div
      className="prev-root"
      style={
        { "--accent": current.accent, "--glow": current.glow } as React.CSSProperties
      }
    >
      {/* Per-sample ambient wash */}
      <div
        className="prev-ambient"
        style={{
          background: `radial-gradient(ellipse 60% 55% at 50% 42%, ${current.glow}, transparent 70%)`,
        }}
      />

      {/* Navigation arrows */}
      <button
        className="prev-arrow prev-arrow-left"
        onClick={() => go(-1)}
        aria-label={`Previous — ${prev.name}`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span className="prev-arrow-peek">{prev.name}</span>
      </button>
      <button
        className="prev-arrow prev-arrow-right"
        onClick={() => go(1)}
        aria-label={`Next — ${next.name}`}
      >
        <span className="prev-arrow-peek">{next.name}</span>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Horizontally sliding stage */}
      <div className="prev-stage">
        <div
          className="prev-track"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {SAMPLES.map((s, i) => (
            <div className="prev-slide" key={s.slug} aria-hidden={i !== active}>
              {/* Standardized browser frame */}
              <div
                className="prev-frame"
                style={{ borderColor: `${s.accent}33` }}
              >
                <div className="prev-browserbar">
                  <span className="prev-tl" style={{ background: "#ff5f57" }} />
                  <span className="prev-tl" style={{ background: "#febc2e" }} />
                  <span className="prev-tl" style={{ background: "#28c840" }} />
                  <div className="prev-url">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    flz.works/uidesign/{s.slug}
                  </div>
                  <a
                    className="prev-open"
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    title="Open standalone in new tab"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>
                <div className="prev-viewport">
                  {/* Each sample is its own isolated static site */}
                  <iframe
                    src={s.url}
                    title={s.name}
                    className="prev-iframe"
                  />
                </div>
              </div>

              {/* Standardized caption */}
              <div className="prev-caption">
                <div className="prev-cap-left">
                  <span className="prev-index">
                    {String(i + 1).padStart(2, "0")} / {String(SAMPLES.length).padStart(2, "0")}
                  </span>
                  <h1 className="prev-name" style={{ color: s.accent }}>
                    {s.name}
                  </h1>
                  <p className="prev-tagline">{s.tagline}</p>
                </div>
                <div className="prev-cap-right">
                  <p className="prev-desc">{s.description}</p>
                  <div className="prev-tags">
                    {s.tags.map((t) => (
                      <span key={t} className="prev-tag">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots + hint */}
      <div className="prev-dots">
        {SAMPLES.map((s, i) => (
          <button
            key={s.slug}
            className={`prev-dot ${i === active ? "active" : ""}`}
            style={i === active ? { background: current.accent } : {}}
            onClick={() => setActive(i)}
            aria-label={`Go to ${s.name}`}
          />
        ))}
      </div>
      <div className="prev-hint">
        <span>&larr; &rarr;</span> arrow keys to switch sample
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        .prev-root {
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

        .prev-ambient {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          transition: background 0.7s ease;
        }
        .prev-root::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 52px 52px;
          mask-image: radial-gradient(ellipse 70% 60% at 50% 45%, rgba(0,0,0,0.6), transparent 80%);
        }

        /* Sliding stage */
        .prev-stage {
          position: relative;
          z-index: 5;
          width: 100%;
          overflow: hidden;
        }
        .prev-track {
          display: flex;
          width: 100%;
          transition: transform 0.55s cubic-bezier(0.65, 0, 0.2, 1);
          will-change: transform;
        }
        .prev-slide {
          flex: 0 0 100%;
          min-width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 22px;
          padding: 28px 96px 12px;
        }

        /* Browser frame */
        .prev-frame {
          width: 100%;
          max-width: 1180px;
          border: 1px solid;
          border-radius: 16px;
          overflow: hidden;
          background: rgba(8, 8, 14, 0.8);
          box-shadow: 0 0 60px var(--glow), 0 30px 70px rgba(0,0,0,0.55);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .prev-browserbar {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 40px;
          padding: 0 14px;
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .prev-tl {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          flex-shrink: 0;
          opacity: 0.9;
        }
        .prev-url {
          display: flex;
          align-items: center;
          gap: 7px;
          margin: 0 auto;
          padding: 5px 16px;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 7px;
          font-size: 12px;
          letter-spacing: 0.3px;
          color: rgba(255,255,255,0.5);
        }
        .prev-url svg { color: rgba(255,255,255,0.3); }
        .prev-open {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 7px;
          color: rgba(255,255,255,0.45);
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .prev-open:hover {
          background: rgba(255,255,255,0.07);
          color: var(--accent);
        }
        .prev-viewport {
          width: 100%;
          height: clamp(360px, 56vh, 660px);
          background: #04040a;
        }
        .prev-iframe {
          width: 100%;
          height: 100%;
          border: 0;
          display: block;
        }

        /* Caption */
        .prev-caption {
          width: 100%;
          max-width: 1180px;
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 40px;
          align-items: start;
          padding: 0 4px;
        }
        .prev-cap-left { display: flex; flex-direction: column; gap: 6px; }
        .prev-index {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.25);
        }
        .prev-name {
          margin: 2px 0 0;
          font-size: 30px;
          font-weight: 600;
          letter-spacing: 0.5px;
          line-height: 1.05;
        }
        .prev-tagline {
          margin: 0;
          font-size: 13px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
        }
        .prev-cap-right { display: flex; flex-direction: column; gap: 14px; }
        .prev-desc {
          margin: 0;
          font-size: 13.5px;
          line-height: 1.7;
          color: rgba(255,255,255,0.55);
        }
        .prev-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .prev-tag {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 3px 9px;
          border-radius: 20px;
        }

        /* Arrows */
        .prev-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 30;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          color: rgba(255,255,255,0.55);
          cursor: pointer;
          transition: all 0.2s;
        }
        .prev-arrow:hover {
          background: rgba(255,255,255,0.09);
          border-color: var(--accent);
          color: #fff;
          box-shadow: 0 0 24px var(--glow);
        }
        .prev-arrow-left { left: 26px; }
        .prev-arrow-right { right: 26px; }
        .prev-arrow-peek {
          position: absolute;
          white-space: nowrap;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.5px;
          color: rgba(255,255,255,0.5);
          opacity: 0;
          transition: opacity 0.2s;
          pointer-events: none;
        }
        .prev-arrow-left .prev-arrow-peek { left: calc(100% + 12px); }
        .prev-arrow-right .prev-arrow-peek { right: calc(100% + 12px); }
        .prev-arrow:hover .prev-arrow-peek { opacity: 1; }

        /* Dots + hint */
        .prev-dots {
          position: absolute;
          bottom: 22px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 30;
          display: flex;
          gap: 9px;
        }
        .prev-dot {
          width: 8px;
          height: 8px;
          padding: 0;
          border: none;
          border-radius: 50%;
          background: rgba(255,255,255,0.16);
          cursor: pointer;
          transition: all 0.3s;
        }
        .prev-dot.active { width: 24px; border-radius: 4px; }
        .prev-hint {
          position: absolute;
          bottom: 22px;
          right: 32px;
          z-index: 30;
          font-size: 11px;
          color: rgba(255,255,255,0.22);
          letter-spacing: 0.4px;
        }
        .prev-hint span { font-weight: 600; color: rgba(255,255,255,0.4); }

        @media (max-width: 900px) {
          .prev-slide { padding: 18px 64px 12px; }
          .prev-caption { grid-template-columns: 1fr; gap: 16px; }
          .prev-viewport { height: clamp(300px, 46vh, 520px); }
          .prev-name { font-size: 24px; }
          .prev-hint { display: none; }
        }
        @media (max-width: 560px) {
          .prev-arrow { width: 42px; height: 42px; }
          .prev-arrow-left { left: 10px; }
          .prev-arrow-right { right: 10px; }
          .prev-slide { padding: 14px 56px 12px; }
        }
      `}</style>
    </div>
  );
}
