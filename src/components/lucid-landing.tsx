"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import type { InstagramMediaItem } from "@/lib/instagram";
import type { PortfolioArticleWithImages } from "@/lib/portfolio-sync";

// ── SVG Icons ─────────────────────────────────────────────────────────────────

function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function MailIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 7L2 7" />
    </svg>
  );
}

function DownloadIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ArrowRightIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

// ── Shared style constants ─────────────────────────────────────────────────────

const MONO_LABEL: React.CSSProperties = {
  font: "var(--lucid-type-label)",
  letterSpacing: "var(--lucid-tracking-label)",
  textTransform: "uppercase" as const,
};

const MONO_CAPTION: React.CSSProperties = {
  font: "var(--lucid-type-caption)",
  letterSpacing: "var(--lucid-tracking-caption)",
  textTransform: "uppercase" as const,
};

// ── Inner dark sub-panel (nested inside main shell) ───────────────────────────
function DarkCard({
  children,
  style,
  radius = "var(--lucid-radius-md)",
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  radius?: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        background: "color-mix(in srgb, #14120F 52%, transparent)",
        border: "1px solid color-mix(in srgb, #FFFFFF 10%, transparent)",
        borderRadius: radius,
        backdropFilter: "blur(8px) saturate(150%)",
        WebkitBackdropFilter: "blur(8px) saturate(150%)",
        boxShadow: "inset 0 1px 0 color-mix(in srgb, #FFFFFF 12%, transparent)",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Light cream sub-panel (high contrast inside dark shell) ───────────────────
function LightCard({
  children,
  style,
  radius = "var(--lucid-radius-md)",
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  radius?: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        background: "color-mix(in srgb, #FAF6F0 88%, transparent)",
        border: "1px solid color-mix(in srgb, #14120F 8%, transparent)",
        borderRadius: radius,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Stat block — big display numeral over mono label ─────────────────────────
function StatBlock({
  value,
  unit,
  label,
  dark = true,
}: {
  value: string;
  unit?: string;
  label: string;
  dark?: boolean;
}) {
  const textColor = dark ? "var(--lucid-text-on-dark)" : "var(--lucid-text-primary)";
  const mutedColor = dark ? "rgba(250,246,240,0.45)" : "var(--lucid-text-muted)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
        <span
          style={{
            fontFamily: "var(--lucid-font-display)",
            fontWeight: 700,
            fontSize: 36,
            lineHeight: 1,
            letterSpacing: "var(--lucid-tracking-display)",
            color: textColor,
          }}
        >
          {value}
        </span>
        {unit && (
          <span style={{ ...MONO_LABEL, fontSize: 11, color: mutedColor }}>{unit}</span>
        )}
      </div>
      <span style={{ ...MONO_CAPTION, color: mutedColor }}>{label}</span>
    </div>
  );
}

// ── Nav pill segment ──────────────────────────────────────────────────────────
function NavPill({
  label,
  active,
  href,
  onClick,
}: {
  label: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
}) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 30,
    padding: "0 14px",
    borderRadius: "var(--lucid-radius-pill)",
    font: "var(--lucid-type-label)",
    letterSpacing: "var(--lucid-tracking-label)",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "var(--lucid-transition)",
    textDecoration: "none",
    border: "none",
    background: active
      ? "color-mix(in srgb, #FAF6F0 92%, transparent)"
      : "transparent",
    color: active ? "var(--lucid-ink-900)" : "rgba(250,246,240,0.55)",
    boxShadow: active ? "var(--lucid-shadow-sm)" : "none",
  };

  if (href) {
    return (
      <Link href={href} style={base}>
        {label}
      </Link>
    );
  }
  return (
    <button style={base} onClick={onClick}>
      {label}
    </button>
  );
}

// ── Icon round button ─────────────────────────────────────────────────────────
function IconBtn({
  children,
  href,
  onClick,
  label,
  light = false,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  label: string;
  light?: boolean;
}) {
  const base: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: "var(--lucid-radius-pill)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: light
      ? "color-mix(in srgb, #FAF6F0 88%, transparent)"
      : "color-mix(in srgb, #14120F 55%, transparent)",
    border: light
      ? "1px solid color-mix(in srgb, #14120F 10%, transparent)"
      : "1px solid color-mix(in srgb, #FFFFFF 14%, transparent)",
    color: light ? "var(--lucid-ink-900)" : "var(--lucid-cream-25)",
    cursor: "pointer",
    transition: "var(--lucid-transition)",
    textDecoration: "none",
    flexShrink: 0,
  };

  if (href) {
    return (
      <a href={href} style={base} aria-label={label} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <button style={base} onClick={onClick} aria-label={label}>
      {children}
    </button>
  );
}

// ── Skill row inside sidebar ──────────────────────────────────────────────────
function SkillRow({ icon, label, tags }: { icon: string; label: string; tags: string[] }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px" }}>
      <span style={{ fontSize: 16, lineHeight: 1, marginTop: 1 }}>{icon}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
        <span style={{ ...MONO_LABEL, color: "rgba(250,246,240,0.75)", fontSize: 9 }}>
          {label}
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {tags.map((t) => (
            <span
              key={t}
              style={{
                ...MONO_CAPTION,
                fontSize: 8,
                padding: "2px 7px",
                borderRadius: "var(--lucid-radius-pill)",
                background: "color-mix(in srgb, #FFFFFF 10%, transparent)",
                border: "1px solid color-mix(in srgb, #FFFFFF 14%, transparent)",
                color: "rgba(250,246,240,0.5)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Instagram thumbnail strip ─────────────────────────────────────────────────
function InstagramStrip({ media }: { media: InstagramMediaItem[] }) {
  if (!media.length) return null;
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {media.slice(0, 5).map((item) => (
        <a
          key={item.id}
          href={item.permalink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: "0 0 40px",
            width: 40,
            height: 40,
            borderRadius: "var(--lucid-radius-xs)",
            overflow: "hidden",
            position: "relative",
            display: "block",
            border: "1px solid color-mix(in srgb, #FFFFFF 12%, transparent)",
          }}
          aria-label="Instagram post"
        >
          {item.media_type !== "VIDEO" && item.media_url && (
            <Image src={item.media_url} alt="" fill style={{ objectFit: "cover" }} sizes="40px" />
          )}
        </a>
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface LucidLandingProps {
  instagramMedia: InstagramMediaItem[];
  articles: PortfolioArticleWithImages[];
}

export function LucidLanding({ instagramMedia, articles }: LucidLandingProps) {
  const [activeNav, setActiveNav] = useState<"home" | "projects" | "contact">("home");
  const [vcardDone, setVcardDone] = useState(false);

  const downloadVCard = useCallback(() => {
    const vcard = [
      "BEGIN:VCARD", "VERSION:3.0",
      "N:Flosz;Bence;;;", "FN:Bence Flosz",
      "ORG:FLZ Works",
      "TITLE:Game Developer · 3D Artist · Backend Engineer",
      "EMAIL;TYPE=PREF,INTERNET:floszbeni@gmail.com",
      "TEL;TYPE=CELL:+36206282353",
      "URL:https://flz.works",
      "X-SOCIALPROFILE;type=github:https://github.com/Flzvision",
      "X-SOCIALPROFILE;type=linkedin:https://linkedin.com/in/bence-flosz-56134535a",
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
    /* ── Viewport wrapper with dusk backdrop ── */
    <div
      style={{
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(16px, 3vw, 32px)",
        background: "var(--lucid-backdrop-dusk)",
        backgroundAttachment: "fixed",
        fontFamily: "var(--lucid-font-ui)",
      }}
    >
      {/* ══════════════════════════════════════════════════════════════════════
          MAIN GLASS SHELL — the single floating "app window"
          Dark smoked glass, large rounded corners, floats over the backdrop.
          All content lives inside this shell.
          ══════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 1160,
          minHeight: "min(88vh, 740px)",
          borderRadius: 28,
          /* Dark smoked glass */
          background: "color-mix(in srgb, #191713 48%, transparent)",
          border: "1px solid color-mix(in srgb, #FFFFFF 14%, transparent)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          boxShadow:
            "0 48px 120px -32px color-mix(in srgb, #14120F 70%, transparent)," +
            "inset 0 1px 0 color-mix(in srgb, #FFFFFF 20%, transparent)," +
            "inset 0 -1px 1px color-mix(in srgb, #FFFFFF 6%, transparent)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Specular highlight layer */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            background:
              "linear-gradient(180deg, color-mix(in srgb,#FFFFFF 14%,transparent) 0%, color-mix(in srgb,#FFFFFF 3%,transparent) 18%, transparent 45%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* ── TOP NAV BAR ─────────────────────────────────────────────────── */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 20px",
            borderBottom: "1px solid color-mix(in srgb, #FFFFFF 9%, transparent)",
          }}
        >
          {/* Wordmark */}
          <span
            style={{
              fontFamily: "var(--lucid-font-display)",
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: "var(--lucid-tracking-display)",
              color: "var(--lucid-cream-25)",
              marginRight: 8,
              userSelect: "none",
            }}
          >
            FLZ
          </span>

          {/* Segment pills */}
          <div
            style={{
              display: "flex",
              gap: 2,
              background: "color-mix(in srgb, #14120F 40%, transparent)",
              border: "1px solid color-mix(in srgb, #FFFFFF 10%, transparent)",
              borderRadius: "var(--lucid-radius-pill)",
              padding: 3,
            }}
          >
            <NavPill label="Home" active={activeNav === "home"} onClick={() => setActiveNav("home")} />
            <NavPill label="Projects" active={activeNav === "projects"} onClick={() => setActiveNav("projects")} />
            <NavPill label="Contact" active={activeNav === "contact"} onClick={() => setActiveNav("contact")} />
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Right icons */}
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ ...MONO_CAPTION, color: "rgba(250,246,240,0.35)", marginRight: 6, fontSize: 8 }}>
              Budapest · 2026
            </span>
            <IconBtn href="https://github.com/Flzvision" label="GitHub">
              <GithubIcon size={14} />
            </IconBtn>
            <IconBtn href="https://linkedin.com/in/bence-flosz-56134535a" label="LinkedIn">
              <LinkedInIcon size={14} />
            </IconBtn>
            <IconBtn href="mailto:floszbeni@gmail.com" label="Email">
              <MailIcon size={14} />
            </IconBtn>
          </div>
        </div>

        {/* ── BODY — sidebar + main content ──────────────────────────────── */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            flex: 1,
            display: "grid",
            gridTemplateColumns: "220px 1fr",
            gap: 0,
            overflow: "hidden",
          }}
        >
          {/* ── LEFT SIDEBAR ──────────────────────────────────────────────── */}
          <div
            style={{
              borderRight: "1px solid color-mix(in srgb, #FFFFFF 9%, transparent)",
              display: "flex",
              flexDirection: "column",
              gap: 0,
              overflow: "hidden",
            }}
          >
            {/* Identity block */}
            <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid color-mix(in srgb,#FFFFFF 8%,transparent)" }}>
              <div style={{ marginBottom: 14 }}>
                <h1
                  style={{
                    margin: 0,
                    fontFamily: "var(--lucid-font-display)",
                    fontWeight: 800,
                    fontSize: "clamp(42px, 5vw, 60px)",
                    lineHeight: 0.9,
                    letterSpacing: "var(--lucid-tracking-display)",
                    color: "var(--lucid-cream-25)",
                  }}
                >
                  FLZ
                </h1>
                <p style={{ ...MONO_LABEL, fontSize: 8, color: "rgba(250,246,240,0.45)", margin: "8px 0 0" }}>
                  Indie Game Dev · 3D Artist
                </p>
                <p style={{ ...MONO_CAPTION, fontSize: 8, color: "rgba(250,246,240,0.3)", margin: "2px 0 0" }}>
                  Backend Engineer · BGE Student
                </p>
              </div>

              {/* Stat blocks row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <StatBlock value={String(articles.length || "6")} label="Portfolio" />
                <StatBlock value="B2" label="English" />
              </div>
            </div>

            {/* Current project */}
            <DarkCard
              style={{ margin: "12px 12px 0", flexShrink: 0 }}
              radius="var(--lucid-radius-sm)"
            >
              <div style={{ padding: "12px 14px" }}>
                <span style={{ ...MONO_CAPTION, color: "rgba(250,246,240,0.35)" }}>Active Build</span>
                <p
                  style={{
                    margin: "6px 0 4px",
                    fontFamily: "var(--lucid-font-display)",
                    fontWeight: 700,
                    fontSize: 13,
                    letterSpacing: "var(--lucid-tracking-tight)",
                    color: "var(--lucid-cream-25)",
                    lineHeight: 1.2,
                  }}
                >
                  4-Player Co-op
                </p>
                <p style={{ ...MONO_CAPTION, color: "rgba(250,246,240,0.35)", margin: 0 }}>
                  Liminal · Dreamcore · Godot C#
                </p>
              </div>
            </DarkCard>

            {/* Skills */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                marginTop: 8,
                borderTop: "1px solid color-mix(in srgb,#FFFFFF 7%,transparent)",
              }}
            >
              <div style={{ padding: "6px 0" }}>
                {[
                  { icon: "🎮", label: "Game Dev", tags: ["Godot", "C#", "Multiplayer"] },
                  { icon: "🎨", label: "3D · Visual", tags: ["Blender", "Photoshop"] },
                  { icon: "💻", label: "Backend · Web", tags: ["Next.js", "PHP", "SQL"] },
                  { icon: "🤖", label: "AI · Tools", tags: ["Ollama", "PowerShell"] },
                ].map((s) => (
                  <SkillRow key={s.label} {...s} />
                ))}
              </div>
            </div>

            {/* Education footer */}
            <div
              style={{
                padding: "10px 14px",
                borderTop: "1px solid color-mix(in srgb,#FFFFFF 8%,transparent)",
              }}
            >
              <span style={{ ...MONO_CAPTION, color: "rgba(250,246,240,0.3)" }}>
                BGE — Business Informatics BSc
              </span>
            </div>
          </div>

          {/* ── MAIN CONTENT AREA ──────────────────────────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateRows: "1fr auto",
              overflow: "hidden",
            }}
          >
            {/* Hero area */}
            <div
              style={{
                padding: "clamp(20px, 3vw, 36px)",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gridTemplateRows: "auto 1fr auto",
                gap: 20,
                overflow: "hidden",
              }}
            >
              {/* Top row: headline + stats */}
              <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
                {/* Main heading */}
                <div style={{ flex: 1, minWidth: 220 }}>
                  <p style={{ ...MONO_CAPTION, color: "rgba(250,246,240,0.35)", margin: "0 0 10px" }}>
                    Identity · Portfolio · 2026
                  </p>
                  <h2
                    style={{
                      margin: 0,
                      fontFamily: "var(--lucid-font-display)",
                      fontWeight: 700,
                      fontSize: "clamp(28px, 4vw, 44px)",
                      lineHeight: 1.0,
                      letterSpacing: "var(--lucid-tracking-display)",
                      color: "var(--lucid-cream-25)",
                    }}
                  >
                    Building worlds.<br />
                    Shipping products.
                  </h2>
                </div>

                {/* Stat cluster */}
                <div style={{ display: "flex", gap: 32, flexShrink: 0 }}>
                  <div style={{ textAlign: "right" }}>
                    <StatBlock value="4" unit="PLR" label="Co-op players" />
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <StatBlock value="3+" unit="YRS" label="Dev experience" />
                  </div>
                </div>
              </div>

              {/* Bio card */}
              <LightCard style={{ padding: "18px 22px", gridColumn: "1 / 2" }}>
                <span style={{ ...MONO_CAPTION, color: "var(--lucid-text-muted)" }}>About</span>
                <p
                  style={{
                    margin: "8px 0 0",
                    font: "var(--lucid-type-body-sm)",
                    color: "var(--lucid-text-secondary)",
                    lineHeight: 1.65,
                    maxWidth: 460,
                  }}
                >
                  Business Informatics student at BGE and indie game studio founder. I build 4-player co-op games with a liminal/dreamcore aesthetic using Godot + Blender, and full-stack web platforms in Next.js. My goal: release commercially on Steam.
                </p>
                {/* Experience row */}
                <div style={{ display: "flex", gap: 20, marginTop: 14, flexWrap: "wrap" }}>
                  {[
                    { name: "Boredo Systems", role: "Backend Dev · 2024–25" },
                    { name: "Freelance", role: "Marketing · Branding · 2023–24" },
                  ].map((exp) => (
                    <div key={exp.name}>
                      <div
                        style={{
                          fontFamily: "var(--lucid-font-display)",
                          fontWeight: 600,
                          fontSize: 12,
                          color: "var(--lucid-text-primary)",
                        }}
                      >
                        {exp.name}
                      </div>
                      <div style={{ ...MONO_CAPTION, color: "var(--lucid-text-muted)" }}>{exp.role}</div>
                    </div>
                  ))}
                </div>
              </LightCard>

              {/* Right column: mini cards */}
              <div style={{ gridColumn: "2 / 3", gridRow: "2 / 4", display: "flex", flexDirection: "column", gap: 10, width: 190 }}>
                {/* Roblox Studio note */}
                <DarkCard style={{ padding: "14px" }} radius="var(--lucid-radius-sm)">
                  <span style={{ ...MONO_CAPTION, color: "rgba(250,246,240,0.3)" }}>Also</span>
                  <p style={{ margin: "4px 0 0", fontFamily: "var(--lucid-font-display)", fontWeight: 700, fontSize: 13, color: "var(--lucid-cream-25)" }}>
                    Roblox Studio
                  </p>
                  <p style={{ ...MONO_CAPTION, color: "rgba(250,246,240,0.3)", margin: "2px 0 0" }}>
                    Early dev experience
                  </p>
                </DarkCard>

                {/* Steam target */}
                <LightCard style={{ padding: "14px" }} radius="var(--lucid-radius-sm)">
                  <span style={{ ...MONO_CAPTION, color: "var(--lucid-text-muted)" }}>Target</span>
                  <p style={{ margin: "4px 0 0", fontFamily: "var(--lucid-font-display)", fontWeight: 700, fontSize: 13, color: "var(--lucid-text-primary)" }}>
                    Steam Release
                  </p>
                  <p style={{ ...MONO_CAPTION, color: "var(--lucid-text-muted)", margin: "2px 0 0" }}>
                    Indie studio · Commercial
                  </p>
                </LightCard>

                {/* Instagram */}
                {instagramMedia.length > 0 && (
                  <DarkCard style={{ padding: "12px" }} radius="var(--lucid-radius-sm)">
                    <span style={{ ...MONO_CAPTION, color: "rgba(250,246,240,0.3)" }}>Instagram</span>
                    <div style={{ marginTop: 8 }}>
                      <InstagramStrip media={instagramMedia} />
                    </div>
                  </DarkCard>
                )}
              </div>

              {/* Portfolio archive link */}
              {articles.length > 0 && (
                <div style={{ gridColumn: "1 / 2" }}>
                  <Link
                    href="/autosalon"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 18px",
                      borderRadius: "var(--lucid-radius-pill)",
                      background: "color-mix(in srgb,#FFFFFF 9%,transparent)",
                      border: "1px solid color-mix(in srgb,#FFFFFF 14%,transparent)",
                      color: "var(--lucid-cream-25)",
                      font: "var(--lucid-type-button)",
                      letterSpacing: "var(--lucid-tracking-tight)",
                      textDecoration: "none",
                      transition: "var(--lucid-transition)",
                    }}
                  >
                    <span>View portfolio archive</span>
                    <span style={{ ...MONO_CAPTION, color: "rgba(250,246,240,0.45)" }}>
                      · {articles.length} items
                    </span>
                    <ArrowRightIcon size={13} />
                  </Link>
                </div>
              )}
            </div>

            {/* ── BOTTOM ACTION STRIP ──────────────────────────────────────── */}
            <div
              style={{
                borderTop: "1px solid color-mix(in srgb,#FFFFFF 9%,transparent)",
                padding: "14px 28px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <span style={{ ...MONO_CAPTION, color: "rgba(250,246,240,0.3)", marginRight: 4 }}>
                Connect
              </span>

              <button
                id="lucid-vcard-btn"
                onClick={downloadVCard}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  height: 32,
                  padding: "0 14px",
                  borderRadius: "var(--lucid-radius-pill)",
                  background: "var(--lucid-cream-25)",
                  color: "var(--lucid-ink-900)",
                  border: "none",
                  font: "var(--lucid-type-label)",
                  letterSpacing: "var(--lucid-tracking-label)",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "var(--lucid-transition)",
                  boxShadow: "var(--lucid-shadow-sm)",
                }}
                aria-label="Download vCard"
              >
                <DownloadIcon size={12} />
                {vcardDone ? "Saved ✓" : "vCard"}
              </button>

              {[
                { id: "lucid-email-link", href: "mailto:floszbeni@gmail.com", label: "floszbeni@gmail.com" },
                { id: "lucid-github-link", href: "https://github.com/Flzvision", label: "GitHub / Flzvision" },
                { id: "lucid-linkedin-link", href: "https://linkedin.com/in/bence-flosz-56134535a", label: "LinkedIn" },
              ].map((l) => (
                <a
                  key={l.id}
                  id={l.id}
                  href={l.href}
                  target={l.href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    height: 32,
                    padding: "0 14px",
                    borderRadius: "var(--lucid-radius-pill)",
                    background: "color-mix(in srgb,#FFFFFF 8%,transparent)",
                    border: "1px solid color-mix(in srgb,#FFFFFF 12%,transparent)",
                    color: "rgba(250,246,240,0.6)",
                    font: "var(--lucid-type-label)",
                    letterSpacing: "var(--lucid-tracking-label)",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    transition: "var(--lucid-transition)",
                    fontSize: 9,
                  }}
                >
                  {l.label}
                </a>
              ))}

              <div style={{ flex: 1 }} />

              {/* Autopiac link */}
              <Link
                id="lucid-autopiac-link"
                href="/autosalon"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  height: 32,
                  padding: "0 14px",
                  borderRadius: "var(--lucid-radius-pill)",
                  background: "var(--lucid-ink-900)",
                  color: "var(--lucid-cream-25)",
                  font: "var(--lucid-type-label)",
                  letterSpacing: "var(--lucid-tracking-label)",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  border: "1px solid color-mix(in srgb,#FFFFFF 10%,transparent)",
                  boxShadow: "var(--lucid-shadow-md)",
                  transition: "var(--lucid-transition)",
                }}
              >
                Autopiac
                <ArrowRightIcon size={11} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
