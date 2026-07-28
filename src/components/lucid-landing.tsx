"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { InstagramMediaItem } from "@/lib/instagram";
import type { PortfolioArticleWithImages } from "@/lib/portfolio-sync";

// ── Icons ─────────────────────────────────────────────────────────────────────

function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function MailIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 7L2 7" />
    </svg>
  );
}

function DownloadIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ArrowUpRight({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 17L17 7M7 7h10v10" />
    </svg>
  );
}

// ── Primitives ────────────────────────────────────────────────────────────────

/** Dark smoked glass sub-panel */
function D({ children, style, r = 12 }: { children: React.ReactNode; style?: React.CSSProperties; r?: number }) {
  return (
    <div style={{
      position: "relative", overflow: "hidden",
      background: "rgba(20,18,15,0.52)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: r,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
      ...style,
    }}>
      {children}
    </div>
  );
}

/** Cream/light sub-panel */
function L({ children, style, r = 12 }: { children: React.ReactNode; style?: React.CSSProperties; r?: number }) {
  return (
    <div style={{
      background: "rgba(250,246,240,0.92)",
      border: "1px solid rgba(20,18,15,0.08)",
      borderRadius: r,
      ...style,
    }}>
      {children}
    </div>
  );
}

/** Mono uppercase label */
function Label({
  children,
  dim = false,
  style,
  as: Tag = "span",
}: {
  children: React.ReactNode;
  dim?: boolean;
  style?: React.CSSProperties;
  as?: "span" | "h2" | "h3";
}) {
  return (
    <Tag style={{
      display: "block",
      fontFamily: "var(--lucid-font-mono)",
      fontSize: 12, letterSpacing: "0.13em",
      textTransform: "uppercase",
      color: dim ? "rgba(250,246,240,0.62)" : "rgba(250,246,240,0.68)",
      margin: 0,
      ...style,
    }}>
      {children}
    </Tag>
  );
}

/** Large display numeral stat */
function Stat({ val, unit, label, light }: { val: string; unit?: string; label: string; light?: boolean }) {
  const base = light ? "#14120F" : "#FAF6F0";
  const muted = light ? "rgba(20,18,15,0.72)" : "rgba(250,246,240,0.65)";
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
        <span style={{ fontFamily: "var(--lucid-font-display)", fontWeight: 700, fontSize: 34, lineHeight: 1, letterSpacing: "-0.03em", color: base, fontFeatureSettings: '"tnum" 1, "cv05" 1' }}>{val}</span>
        {unit && <span style={{ fontFamily: "var(--lucid-font-mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: muted, marginBottom: 2 }}>{unit}</span>}
      </div>
      <span style={{ fontFamily: "var(--lucid-font-mono)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: muted, display: "block", marginTop: 2 }}>{label}</span>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface LucidLandingProps {
  instagramMedia: InstagramMediaItem[];
  articles: PortfolioArticleWithImages[];
}

const SKILLS = [
  { icon: "🎮", label: "Game Dev", tags: ["Godot", "C#", "Multiplayer", "Level Design"] },
  { icon: "🎨", label: "3D · Visual", tags: ["Blender", "Photoshop", "Environment Art"] },
  { icon: "💻", label: "Web · Backend", tags: ["PHP", "JavaScript", "SQL", "HTML5", "CSS3", "Bootstrap 5"] },
  { icon: "🤖", label: "AI · Tools", tags: ["Ollama", "PowerShell", "Python"] },
];

export function LucidLanding({ instagramMedia, articles }: LucidLandingProps) {
  const [vcardDone, setVcardDone] = useState(false);
  const [activeNav, setActiveNav] = useState<"home" | "projects" | "contact">("home");

  const homeRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const sectionRefs = useRef({ home: homeRef, projects: projectsRef, contact: contactRef }).current;

  const scrollToSection = useCallback((id: "home" | "projects" | "contact") => {
    setActiveNav(id);
    const target = sectionRefs[id].current;
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [sectionRefs]);

  useEffect(() => {
    const entries = (["home", "projects", "contact"] as const)
      .map((id) => ({ id, el: sectionRefs[id].current }))
      .filter((e): e is { id: typeof e.id; el: HTMLDivElement } => e.el !== null);

    const observer = new IntersectionObserver(
      (observed) => {
        const visible = observed
          .filter((o) => o.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const match = entries.find((e) => e.el === visible.target);
          if (match) setActiveNav(match.id);
        }
      },
      { threshold: [0.2, 0.5] }
    );

    entries.forEach((e) => observer.observe(e.el));
    return () => observer.disconnect();
  }, [sectionRefs]);

  const downloadVCard = useCallback(() => {
    const vcard = [
      "BEGIN:VCARD", "VERSION:3.0",
      "N:Flosz;Bence;Norbert;;", "FN:Bence Flosz", "ORG:FLZ Works",
      "TITLE:Gazdaságinformatikus (BGE) | Indie Game Developer & Studio Founder | Backend Developer",
      "EMAIL;TYPE=PREF,INTERNET:floszbeni@gmail.com",
      "TEL;TYPE=CELL:+36206282353",
      "URL:https://flz.works",
      "X-SOCIALPROFILE;type=linkedin:https://www.linkedin.com/in/bence-flosz-56134535a/",
      "X-SOCIALPROFILE;type=github:https://github.com/Flzvision",
      "END:VCARD",
    ].join("\n");
    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "bence_flosz.vcf";
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    setVcardDone(true);
    setTimeout(() => setVcardDone(false), 2200);
  }, []);

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────────────────── */}
      <div style={{
        minHeight: "100svh",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "clamp(12px, 2.5vw, 28px)",
        background: "var(--lucid-backdrop-dusk)",
        backgroundAttachment: "fixed",
        fontFamily: "var(--lucid-font-ui)",
      }}>

        {/* ── OUTER GLASS SHELL ─────────────────────────────────────────── */}
        <div style={{
          position: "relative",
          width: "100%", maxWidth: 1100,
          borderRadius: 24,
          background: "rgba(28,24,20,0.52)",
          border: "1px solid rgba(255,255,255,0.13)",
          backdropFilter: "blur(44px) saturate(175%)",
          WebkitBackdropFilter: "blur(44px) saturate(175%)",
          boxShadow: "0 52px 120px -32px rgba(10,8,6,0.75), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(255,255,255,0.05)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          animation: "lucid-shell-in 0.7s cubic-bezier(0.22,1,0.36,1) both",
        }}>

          {/* Specular gradient overlay */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none", zIndex: 0,
            background: "linear-gradient(180deg, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.03) 20%, transparent 55%)",
          }} />

          {/* ── NAV BAR ─────────────────────────────────────────────────── */}
          <div className="lucid-top-bar" style={{
            position: "relative", zIndex: 2,
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 18px 12px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}>
            {/* Brand */}
            <span style={{
              fontFamily: "var(--lucid-font-display)", fontWeight: 800, fontSize: 17,
              letterSpacing: "-0.03em", color: "#FAF6F0", userSelect: "none", flexShrink: 0,
            }}>
              FLZ
            </span>

            {/* Divider */}
            <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.12)", marginLeft: 4, marginRight: 4, flexShrink: 0 }} />

            {/* Segment nav */}
            <div style={{
              display: "flex", gap: 2, padding: 3,
              background: "rgba(0,0,0,0.28)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 999,
            }}>
              {(["home", "projects", "contact"] as const).map((id) => (
                <button
                  key={id}
                  className="lucid-nav-pill"
                  onClick={() => scrollToSection(id)}
                  style={{
                    background: activeNav === id ? "rgba(250,246,240,0.92)" : "transparent",
                    color: activeNav === id ? "#14120F" : "rgba(250,246,240,0.68)",
                    boxShadow: activeNav === id ? "0 1px 6px rgba(0,0,0,0.2)" : "none",
                  }}
                >
                  {id.charAt(0).toUpperCase() + id.slice(1)}
                </button>
              ))}
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Live dot */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginRight: 8 }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "rgba(140,230,160,0.85)",
                animation: "lucid-pulse-dot 2s ease-in-out infinite",
              }} />
              <Label dim style={{ fontSize: 11 }}>Available</Label>
            </div>

            {/* Icon buttons */}
            <div style={{ display: "flex", gap: 6 }}>
              <a href="https://github.com/Flzvision" target="_blank" rel="noopener noreferrer" className="lucid-icon-btn" aria-label="GitHub">
                <GithubIcon size={13} />
              </a>
              <a href="https://www.linkedin.com/in/bence-flosz-56134535a/" target="_blank" rel="noopener noreferrer" className="lucid-icon-btn" aria-label="LinkedIn">
                <LinkedInIcon size={13} />
              </a>
              <a href="mailto:floszbeni@gmail.com" className="lucid-icon-btn" aria-label="Email">
                <MailIcon size={13} />
              </a>
            </div>
          </div>

          {/* ── BODY ────────────────────────────────────────────────────── */}
          <div className="lucid-body-grid" style={{
            position: "relative", zIndex: 1,
            flex: 1,
          }}>

            {/* ── SIDEBAR ─────────────────────────────────────────────── */}
            <div style={{
              borderRight: "1px solid rgba(255,255,255,0.08)",
              display: "flex", flexDirection: "column",
              animation: "lucid-fade-up 0.6s 0.15s cubic-bezier(0.22,1,0.36,1) both",
            }}>

              {/* Identity section */}
              <div ref={homeRef} style={{ padding: "22px 18px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <Label dim style={{ marginBottom: 10 }}>Identity</Label>
                <h1 style={{
                  margin: 0,
                  fontFamily: "var(--lucid-font-display)", fontWeight: 800,
                  fontSize: 54, lineHeight: 0.88,
                  letterSpacing: "-0.04em", color: "#FAF6F0",
                }}>
                  FLZ
                </h1>
                <p style={{
                  margin: "6px 0 0",
                  fontFamily: "var(--lucid-font-mono)", fontSize: 11,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "rgba(250,246,240,0.62)",
                }}>
                  Bence Flosz
                </p>
                <p style={{
                  margin: "6px 0 0",
                  fontFamily: "var(--lucid-font-mono)", fontSize: 11,
                  letterSpacing: "0.13em", textTransform: "uppercase",
                  color: "rgba(250,246,240,0.62)", lineHeight: 1.55,
                }}>
                  Gazdaságinformatikus (BGE)<br />Indie Game Developer & Studio Founder<br />Backend Developer
                </p>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 10px", marginTop: 18 }}>
                  <Stat val={articles.length > 0 ? String(articles.length) : "6"} label="Portfolio items" />
                  <Stat val="B2" label="English" />
                  <Stat val="3+" unit="yr" label="Experience" />
                  <Stat val="4" unit="plr" label="Co-op target" />
                </div>
              </div>

              {/* Current build card */}
              <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <D style={{ padding: "12px 14px" }} r={12}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
                    <div style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: "rgba(140,230,160,0.85)",
                      animation: "lucid-pulse-dot 2s 0.4s ease-in-out infinite",
                    }} />
                    <Label dim style={{ fontSize: 11 }}>Active Build</Label>
                  </div>
                  <p style={{
                    margin: "0 0 4px",
                    fontFamily: "var(--lucid-font-display)", fontWeight: 700, fontSize: 14,
                    letterSpacing: "-0.02em", color: "#FAF6F0", lineHeight: 1.2,
                  }}>
                    4-Player Co-op Game
                  </p>
                  <Label dim>Liminal · Dreamcore · Godot C#</Label>
                </D>
              </div>

              {/* Skills */}
              <div style={{ flex: 1, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ padding: "10px 18px 4px" }}>
                  <Label dim as="h2">Skills</Label>
                </div>
                {SKILLS.map((s) => (
                  <div key={s.label} className="lucid-skill-row">
                    <span style={{ fontSize: 14, lineHeight: 1, marginTop: 1, flexShrink: 0 }}>{s.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <span style={{
                        display: "block",
                        fontFamily: "var(--lucid-font-mono)", fontSize: 12,
                        letterSpacing: "0.12em", textTransform: "uppercase",
                        color: "rgba(250,246,240,0.78)", marginBottom: 4,
                      }}>
                        {s.label}
                      </span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {s.tags.map((t) => (
                          <span key={t} style={{
                            fontFamily: "var(--lucid-font-mono)", fontSize: 11,
                            letterSpacing: "0.1em", textTransform: "uppercase",
                            padding: "2px 7px", borderRadius: 999,
                            background: "rgba(255,255,255,0.07)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "rgba(250,246,240,0.66)",
                          }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Education footer */}
              <div style={{ padding: "12px 18px" }}>
                <Label dim as="h2" style={{ fontSize: 11 }}>Education</Label>
                <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div>
                    <p style={{ margin: 0, fontFamily: "var(--lucid-font-display)", fontWeight: 600, fontSize: 11.5, color: "rgba(250,246,240,0.85)" }}>
                      BGE — Gazdaságinformatika BSc
                    </p>
                    <Label dim style={{ fontSize: 10, marginTop: 1 }}>Budapesti Gazdasági Egyetem · 2025 – Jelenleg</Label>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontFamily: "var(--lucid-font-display)", fontWeight: 600, fontSize: 11.5, color: "rgba(250,246,240,0.75)" }}>
                      PPKE — Mérnökinformatikus
                    </p>
                    <Label dim style={{ fontSize: 10, marginTop: 1 }}>Pázmány Péter Katolikus Egyetem · 2023 – 2024</Label>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontFamily: "var(--lucid-font-display)", fontWeight: 600, fontSize: 11.5, color: "rgba(250,246,240,0.75)" }}>
                      Schola Europa Akadémia
                    </p>
                    <Label dim style={{ fontSize: 10, marginTop: 1 }}>Szoftverfejlesztő és -tesztelő · 2021 – 2023</Label>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontFamily: "var(--lucid-font-display)", fontWeight: 600, fontSize: 11.5, color: "rgba(250,246,240,0.75)" }}>
                      Óbudai Gimnázium
                    </p>
                    <Label dim style={{ fontSize: 10, marginTop: 1 }}>Érettségi · 2017 – 2021</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* ── MAIN CONTENT ──────────────────────────────────────────── */}
            <div style={{
              display: "flex", flexDirection: "column",
              animation: "lucid-fade-up 0.6s 0.25s cubic-bezier(0.22,1,0.36,1) both",
            }}>

              {/* Hero area */}
              <div ref={projectsRef} className="lucid-hero-grid" style={{
                flex: 1, padding: "clamp(18px,2.5vw,32px)",
              }}>

                {/* ── Headline row ── */}
                <div className="lucid-hero-headline" style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
                  <div>
                    <Label dim style={{ marginBottom: 10 }}>Portfolio · Budapest · 2026</Label>
                    <h2 style={{
                      margin: 0,
                      fontFamily: "var(--lucid-font-display)", fontWeight: 700,
                      fontSize: "clamp(26px, 3.6vw, 42px)",
                      lineHeight: 1.0, letterSpacing: "-0.035em",
                      color: "#FAF6F0",
                    }}>
                      Building worlds.<br />
                      <span style={{ color: "rgba(250,246,240,0.65)" }}>Shipping products.</span>
                    </h2>
                  </div>

                  {/* Stat pair — top right */}
                  <div style={{ display: "flex", gap: 20, flexShrink: 0 }}>
                    <Stat val="4" unit="PLR" label="Co-op" />
                    <Stat val="3+" unit="YRS" label="Dev" />
                  </div>
                </div>

                {/* ── Bio card (main left) ── */}
                <L style={{ padding: "18px 20px", alignSelf: "start" }}>
                  <h2 style={{
                    margin: "0 0 10px",
                    fontFamily: "var(--lucid-font-mono)", fontSize: 11,
                    letterSpacing: "0.13em", textTransform: "uppercase",
                    color: "rgba(20,18,15,0.72)",
                  }}>
                    About
                  </h2>
                  <p style={{
                    margin: "0 0 14px",
                    fontFamily: "var(--lucid-font-ui)", fontSize: 14.5, lineHeight: 1.65,
                    color: "rgba(20,18,15,0.78)",
                  }}>
                    Business Informatics student at BGE and indie game studio founder. I build 4-player co-op games with a liminal/dreamcore aesthetic using Godot&nbsp;+&nbsp;Blender, and full-stack web platforms. Goal: release commercially on Steam.
                  </p>

                  {/* Experience pills */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[
                      { name: "Független Játékfejlesztő", role: "Studio Setup · 2024–Jelenleg" },
                      { name: "Boredo Systems", role: "Backend Dev · 2024–25" },
                      { name: "Freelance", role: "Marketing · 2023–24" },
                    ].map((e) => (
                      <div key={e.name} style={{
                        padding: "8px 12px",
                        background: "rgba(20,18,15,0.06)",
                        border: "1px solid rgba(20,18,15,0.09)",
                        borderRadius: 12,
                      }}>
                        <div style={{
                          fontFamily: "var(--lucid-font-display)", fontWeight: 700,
                          fontSize: 12, color: "#14120F",
                        }}>
                          {e.name}
                        </div>
                        <div style={{
                          fontFamily: "var(--lucid-font-mono)", fontSize: 11,
                          letterSpacing: "0.11em", textTransform: "uppercase",
                          color: "rgba(20,18,15,0.72)", marginTop: 2,
                        }}>
                          {e.role}
                        </div>
                      </div>
                    ))}
                  </div>
                </L>

                {/* ── Right mini-cards column ── */}
                <div className="lucid-hero-side" style={{
                  display: "flex", flexDirection: "column", gap: 10,
                }}>
                  {/* Steam target */}
                  <L style={{ padding: "14px" }} r={12}>
                    <div style={{
                      fontFamily: "var(--lucid-font-mono)", fontSize: 11,
                      letterSpacing: "0.13em", textTransform: "uppercase",
                      color: "rgba(20,18,15,0.72)", marginBottom: 5,
                    }}>
                      Target
                    </div>
                    <div style={{ fontFamily: "var(--lucid-font-display)", fontWeight: 700, fontSize: 14, color: "#14120F" }}>
                      Steam
                    </div>
                    <div style={{
                      fontFamily: "var(--lucid-font-mono)", fontSize: 11,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      color: "rgba(20,18,15,0.72)", marginTop: 2,
                    }}>
                      Commercial release
                    </div>
                  </L>

                  {/* Also: Roblox */}
                  <D style={{ padding: "14px" }} r={12}>
                    <Label dim style={{ marginBottom: 4 }}>Also</Label>
                    <div style={{ fontFamily: "var(--lucid-font-display)", fontWeight: 700, fontSize: 13, color: "#FAF6F0" }}>
                      Roblox Studio
                    </div>
                    <Label dim style={{ marginTop: 2, fontSize: 11 }}>Early game dev roots</Label>
                  </D>

                  {/* Instagram */}
                  {instagramMedia.length > 0 && (
                    <D style={{ padding: "12px" }} r={12}>
                      <Label dim style={{ marginBottom: 8 }}>Instagram</Label>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {instagramMedia.slice(0, 4).map((item) => (
                          <a key={item.id} href={item.permalink} target="_blank" rel="noopener noreferrer"
                            style={{ flex: "0 0 36px", width: 36, height: 36, borderRadius: 8, overflow: "hidden", position: "relative", display: "block", border: "1px solid rgba(255,255,255,0.1)" }}
                            aria-label="Instagram post"
                          >
                            {item.media_type !== "VIDEO" && item.media_url && (
                              <Image src={item.media_url} alt="" fill style={{ objectFit: "cover" }} sizes="36px" />
                            )}
                          </a>
                        ))}
                      </div>
                    </D>
                  )}
                </div>

                {/* ── Portfolio archive ── */}
                {articles.length > 0 && (
                  <div className="lucid-hero-archive">
                    <Link href="/autosalon" className="lucid-link-chip" style={{ gap: 8 }}>
                      <span>View portfolio archive</span>
                      <span style={{ opacity: 0.4 }}>· {articles.length} items</span>
                      <ArrowUpRight size={10} />
                    </Link>
                  </div>
                )}
              </div>

              {/* ── ACTION STRIP ───────────────────────────────────────── */}
              <div ref={contactRef} style={{
                borderTop: "1px solid rgba(255,255,255,0.08)",
                padding: "13px 24px",
                display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
                animation: "lucid-fade-up 0.6s 0.35s cubic-bezier(0.22,1,0.36,1) both",
              }}>

                {/* vCard primary CTA */}
                <button
                  id="lucid-vcard-btn"
                  className="lucid-cta-primary"
                  onClick={downloadVCard}
                  aria-label="Download vCard"
                >
                  <DownloadIcon size={12} />
                  {vcardDone ? "Saved ✓" : "vCard"}
                </button>

                {/* Separator */}
                <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.1)", margin: "0 2px" }} />

                {/* Link chips */}
                <a href="mailto:floszbeni@gmail.com" id="lucid-email-link" className="lucid-link-chip">
                  <MailIcon size={10} />
                  floszbeni@gmail.com
                </a>

                <a href="https://github.com/Flzvision" id="lucid-github-link" target="_blank" rel="noopener noreferrer" className="lucid-link-chip">
                  <GithubIcon size={10} />
                  Flzvision
                </a>

                <a href="https://www.linkedin.com/in/bence-flosz-56134535a/" id="lucid-linkedin-link" target="_blank" rel="noopener noreferrer" className="lucid-link-chip">
                  <LinkedInIcon size={10} />
                  LinkedIn
                </a>

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Autopiac — dark CTA */}
                <Link href="/autosalon" id="lucid-autopiac-link" className="lucid-cta-dark">
                  Portfolio Archive
                  <ArrowUpRight size={11} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

