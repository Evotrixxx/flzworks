"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface ShowcaseCard {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  tags: string[];
  accentColor: string;
  accentGlow: string;
  description: string;
  previewElements: PreviewElement[];
}

interface PreviewElement {
  type: "button" | "card" | "input" | "badge" | "slider";
  label: string;
  color?: string;
}

const SHOWCASES: ShowcaseCard[] = [
  {
    id: "lucent-ui",
    slug: "lucent-ui",
    name: "Lucent UI",
    tagline: "Liquid Glass Asset Library",
    tags: ["WebGL", "Glassmorphism", "Refraction", "Dark Mode"],
    accentColor: "#d1b894",
    accentGlow: "rgba(209, 184, 148, 0.4)",
    description:
      "A premium design system featuring physical WebGL refraction. Every component warps and magnifies the background grid as your cursor passes through, creating realistic optical depth.",
    previewElements: [
      { type: "button", label: "Refractive Primary", color: "#d1b894" },
      { type: "card", label: "Glass Panel", color: "rgba(255,255,255,0.06)" },
      { type: "input", label: "Search Database", color: "#d1b894" },
      { type: "badge", label: "Active", color: "#34d399" },
    ],
  },
  {
    id: "liquid-glass",
    slug: "liquid-glass",
    name: "Liquid Glass Player",
    tagline: "Frosted Music Interface",
    tags: ["Glassmorphism", "iOS Style", "Animation", "Blur"],
    accentColor: "#60a5fa",
    accentGlow: "rgba(96, 165, 250, 0.4)",
    description:
      "A cinematic music player built on layered backdrop-filter blur and frosted glass panels. Rich colour bleeds from album art through every control surface.",
    previewElements: [
      { type: "button", label: "▶ Play", color: "#60a5fa" },
      { type: "slider", label: "Track Position", color: "#60a5fa" },
      { type: "badge", label: "Now Playing", color: "#818cf8" },
      { type: "card", label: "Album Art", color: "rgba(96,165,250,0.12)" },
    ],
  },
];

function MiniPreview({ card }: { card: ShowcaseCard }) {
  return (
    <div
      className="mini-preview"
      style={
        {
          "--accent": card.accentColor,
          "--glow": card.accentGlow,
        } as React.CSSProperties
      }
    >
      {/* Ambient glow */}
      <div
        className="mini-preview-glow"
        style={{ background: card.accentGlow }}
      />

      {/* Grid pattern */}
      <div className="mini-preview-grid" />

      {/* Floating elements */}
      <div className="mini-preview-elements">
        {card.previewElements.map((el, i) => (
          <div key={i} className={`mini-el mini-el-${el.type}`} style={{ "--c": el.color } as React.CSSProperties}>
            {el.type === "button" && (
              <div className="mini-btn" style={{ borderColor: el.color, boxShadow: `0 0 8px ${el.color}40` }}>
                {el.label}
              </div>
            )}
            {el.type === "card" && (
              <div className="mini-card" style={{ borderColor: `${el.color}` }}>
                <div className="mini-card-line" style={{ background: card.accentColor }} />
                <div className="mini-card-line short" />
              </div>
            )}
            {el.type === "input" && (
              <div className="mini-input" style={{ borderColor: `${card.accentColor}60` }}>
                <span style={{ color: `${card.accentColor}80` }}>⌕</span>
                <span>{el.label}</span>
              </div>
            )}
            {el.type === "badge" && (
              <div className="mini-badge" style={{ background: `${el.color}18`, borderColor: `${el.color}40`, color: el.color }}>
                {el.label}
              </div>
            )}
            {el.type === "slider" && (
              <div className="mini-slider-wrap">
                <div className="mini-slider-track">
                  <div className="mini-slider-fill" style={{ background: el.color }} />
                  <div className="mini-slider-thumb" style={{ background: el.color, boxShadow: `0 0 6px ${el.color}` }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UiDesignGallery() {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState<"left" | "right" | null>(null);
  const [animating, setAnimating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = (direction: "left" | "right") => {
    if (animating) return;
    setDir(direction);
    setAnimating(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActive((prev) =>
        direction === "right"
          ? (prev + 1) % SHOWCASES.length
          : (prev - 1 + SHOWCASES.length) % SHOWCASES.length
      );
      setAnimating(false);
      setDir(null);
    }, 320);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") navigate("right");
      if (e.key === "ArrowLeft") navigate("left");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const card = SHOWCASES[active];
  const nextCard = SHOWCASES[(active + 1) % SHOWCASES.length];
  const prevCard = SHOWCASES[(active - 1 + SHOWCASES.length) % SHOWCASES.length];

  return (
    <div className="gallery-root">
      {/* Background ambient */}
      <div
        className="gallery-ambient"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 60%, ${card.accentGlow}, transparent 70%)`,
          transition: "background 0.8s ease",
        }}
      />

      {/* Navigation arrows */}
      <button
        className="gallery-arrow gallery-arrow-left"
        onClick={() => navigate("left")}
        aria-label="Previous"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span className="gallery-arrow-peek">{prevCard.name}</span>
      </button>

      <button
        className="gallery-arrow gallery-arrow-right"
        onClick={() => navigate("right")}
        aria-label="Next"
      >
        <span className="gallery-arrow-peek">{nextCard.name}</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Main card */}
      <div
        className={`gallery-card-wrap ${animating ? `gallery-exit-${dir}` : "gallery-enter"}`}
        key={active}
      >
        <div
          className="gallery-card"
          style={
            {
              "--accent": card.accentColor,
              "--glow": card.accentGlow,
              borderColor: `${card.accentColor}30`,
              boxShadow: `0 0 80px ${card.accentGlow}, 0 40px 80px rgba(0,0,0,0.6)`,
            } as React.CSSProperties
          }
        >
          {/* Left: info */}
          <div className="gallery-card-info">
            <div className="gallery-card-meta">
              <span className="gallery-card-index">
                {String(active + 1).padStart(2, "0")} / {String(SHOWCASES.length).padStart(2, "0")}
              </span>
              <div className="gallery-card-tags">
                {card.tags.map((t) => (
                  <span key={t} className="gallery-tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="gallery-card-title-wrap">
              <h1 className="gallery-card-name" style={{ color: card.accentColor }}>
                {card.name}
              </h1>
              <p className="gallery-card-tagline">{card.tagline}</p>
            </div>
            <p className="gallery-card-desc">{card.description}</p>
            <Link
              href={`/uidesign/${card.slug}`}
              className="gallery-cta"
              style={{
                borderColor: card.accentColor,
                color: card.accentColor,
                boxShadow: `0 0 20px ${card.accentGlow}`,
              }}
            >
              View Showcase
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>

          {/* Right: live mini preview */}
          <div className="gallery-card-preview">
            <MiniPreview card={card} />
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="gallery-dots">
        {SHOWCASES.map((_, i) => (
          <button
            key={i}
            className={`gallery-dot ${i === active ? "active" : ""}`}
            style={i === active ? { background: card.accentColor } : {}}
            onClick={() => {
              if (i > active) navigate("right");
              else if (i < active) navigate("left");
            }}
            aria-label={`Go to ${SHOWCASES[i].name}`}
          />
        ))}
      </div>

      {/* Keyboard hint */}
      <div className="gallery-hint">
        <span>← →</span> arrow keys to navigate
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Inter:wght@300;400;500;600&display=swap');

        .gallery-root {
          width: 100%;
          min-height: calc(100vh - 56px);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: #04040a;
        }

        .gallery-ambient {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        /* Subtle grid */
        .gallery-root::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 52px 52px;
          mask-image: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent 90%);
        }

        .gallery-card-wrap {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1100px;
          padding: 0 80px;
          transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.32s;
        }

        @keyframes gallerySlideIn {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes gallerySlideInLeft {
          from { opacity: 0; transform: translateX(-60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .gallery-enter { animation: gallerySlideIn 0.32s cubic-bezier(0.4, 0, 0.2, 1) both; }
        .gallery-exit-right { opacity: 0; transform: translateX(-60px); transition: all 0.32s; }
        .gallery-exit-left  { opacity: 0; transform: translateX(60px); transition: all 0.32s; }

        .gallery-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          background: rgba(8, 8, 14, 0.75);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid;
          border-radius: 24px;
          overflow: hidden;
          min-height: 500px;
        }

        .gallery-card-info {
          padding: 60px 52px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          justify-content: center;
        }

        .gallery-card-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .gallery-card-index {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
        }

        .gallery-card-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .gallery-tag {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 2px 8px;
          border-radius: 20px;
        }

        .gallery-card-title-wrap {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .gallery-card-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 52px;
          font-weight: 400;
          letter-spacing: 2px;
          line-height: 1.05;
          margin: 0;
        }

        .gallery-card-tagline {
          font-size: 14px;
          font-weight: 400;
          letter-spacing: 0.5px;
          color: rgba(255,255,255,0.45);
          margin: 0;
          text-transform: uppercase;
        }

        .gallery-card-desc {
          font-size: 14px;
          line-height: 1.7;
          color: rgba(255,255,255,0.55);
          margin: 0;
          max-width: 380px;
        }

        .gallery-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 32px;
          border: 1px solid;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          text-decoration: none;
          background: rgba(255,255,255,0.03);
          transition: all 0.25s;
          width: fit-content;
        }
        .gallery-cta:hover {
          background: rgba(255,255,255,0.08);
          transform: translateY(-2px);
          letter-spacing: 2px;
        }

        .gallery-card-preview {
          background: rgba(255,255,255,0.012);
          border-left: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        /* Mini preview */
        .mini-preview {
          width: 100%;
          aspect-ratio: 1;
          max-width: 360px;
          background: rgba(4,4,10,0.8);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 28px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
        }

        .mini-preview-glow {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          top: -60px;
          right: -40px;
          filter: blur(60px);
          opacity: 0.3;
          pointer-events: none;
        }

        .mini-preview-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }

        .mini-preview-elements {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .mini-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 9px 20px;
          border: 1px solid;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.9);
          width: fit-content;
        }

        .mini-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid;
          border-radius: 10px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .mini-card-line {
          height: 4px;
          border-radius: 2px;
          background: rgba(255,255,255,0.15);
          width: 70%;
        }
        .mini-card-line.short { width: 45%; background: rgba(255,255,255,0.07); }

        .mini-input {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(10,10,18,0.7);
          border: 1px solid;
          border-radius: 6px;
          padding: 9px 14px;
          font-size: 12px;
          color: rgba(255,255,255,0.4);
        }

        .mini-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border: 1px solid;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          width: fit-content;
        }

        .mini-slider-wrap { width: 100%; }
        .mini-slider-track {
          position: relative;
          height: 4px;
          background: rgba(255,255,255,0.08);
          border-radius: 2px;
        }
        .mini-slider-fill {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 65%;
          border-radius: 2px;
          opacity: 0.8;
        }
        .mini-slider-thumb {
          position: absolute;
          left: 65%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        /* Arrow buttons */
        .gallery-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.5);
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          overflow: visible;
        }
        .gallery-arrow:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.18);
          color: rgba(255,255,255,0.9);
        }
        .gallery-arrow-left { left: 24px; }
        .gallery-arrow-right { right: 24px; }

        .gallery-arrow-peek {
          position: absolute;
          white-space: nowrap;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.5px;
          color: rgba(255,255,255,0.3);
          transition: color 0.2s, opacity 0.2s;
          opacity: 0;
          pointer-events: none;
        }
        .gallery-arrow-left .gallery-arrow-peek { right: calc(100% + 10px); }
        .gallery-arrow-right .gallery-arrow-peek { left: calc(100% + 10px); }
        .gallery-arrow:hover .gallery-arrow-peek { opacity: 1; color: rgba(255,255,255,0.6); }

        /* Dots */
        .gallery-dots {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          display: flex;
          gap: 10px;
        }

        .gallery-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          padding: 0;
        }
        .gallery-dot.active {
          width: 24px;
          border-radius: 4px;
        }

        .gallery-hint {
          position: absolute;
          bottom: 40px;
          right: 40px;
          font-size: 11px;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.5px;
        }
        .gallery-hint span {
          font-weight: 600;
          color: rgba(255,255,255,0.35);
          letter-spacing: 1px;
        }
      `}</style>
    </div>
  );
}
