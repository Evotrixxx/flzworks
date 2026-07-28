"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import type { InstagramMediaItem } from "@/lib/instagram";
import type { PortfolioArticleWithImages } from "@/lib/portfolio-sync";

// ── SVG Icon helpers ──────────────────────────────────────────────────────────

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

function EmailIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 7L2 7" />
    </svg>
  );
}

function DownloadIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function CarIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17m-2 0a2 2 0 104 0 2 2 0 10-4 0" />
      <path d="M17 17m-2 0a2 2 0 104 0 2 2 0 10-4 0" />
      <path d="M5 17H3v-6l2-5h14l2 5v6h-2m-7 0H7" />
      <path d="M3 11h18" />
    </svg>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const SKILLS = [
  {
    id: "gamedev",
    label: "Game Dev",
    icon: "🎮",
    tags: ["Godot", "C#", "Multiplayer", "Lobby Systems", "Level Design"],
    note: "4-player co-op · liminal/dreamcore",
  },
  {
    id: "3d",
    label: "3D · Visual",
    icon: "🎨",
    tags: ["Blender", "Photoshop", "3D Env", "Dreamcore Worlds", "Asset Pipeline"],
    note: "Environment · character · lighting",
  },
  {
    id: "backend",
    label: "Backend · Web",
    icon: "💻",
    tags: ["Next.js", "PHP", "JavaScript", "SQL", "Prisma"],
    note: "CRM · marketplace · APIs",
  },
  {
    id: "ai",
    label: "AI · Automation",
    icon: "🤖",
    tags: ["Ollama", "PowerShell", "Python", "LLMs", "Scripting"],
    note: "Local models · automation pipelines",
  },
];

const BIO = "Business Informatics student at BGE · Indie Game Studio founder · 3D artist & backend engineer. Building a 4-player co-op game with a liminal dreamcore aesthetic in Godot + Blender.";

// ── Sub-components ─────────────────────────────────────────────────────────────

function SkillCard({ skill }: { skill: typeof SKILLS[0] }) {
  return (
    <div
      className="lucid-panel-clear"
      style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>{skill.icon}</span>
        <span
          style={{
            font: "var(--lucid-type-label)",
            letterSpacing: "var(--lucid-tracking-label)",
            textTransform: "uppercase",
            color: "var(--lucid-text-primary)",
          }}
        >
          {skill.label}
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {skill.tags.map((tag) => (
          <span key={tag} className="lucid-chip">{tag}</span>
        ))}
      </div>
      <span
        style={{
          font: "var(--lucid-type-caption)",
          letterSpacing: "var(--lucid-tracking-caption)",
          color: "var(--lucid-text-muted)",
          textTransform: "uppercase",
        }}
      >
        {skill.note}
      </span>
    </div>
  );
}

function InstagramStrip({ media }: { media: InstagramMediaItem[] }) {
  if (!media.length) return null;
  const shown = media.slice(0, 6);
  return (
    <div style={{ display: "flex", gap: 8, overflow: "hidden" }}>
      {shown.map((item) => (
        <a
          key={item.id}
          href={item.permalink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: "0 0 56px",
            width: 56,
            height: 56,
            borderRadius: "var(--lucid-radius-sm)",
            overflow: "hidden",
            position: "relative",
            border: "var(--lucid-edge-mid)",
            display: "block",
          }}
          aria-label="Instagram post"
        >
          {item.media_type !== "VIDEO" && item.media_url && (
            <Image
              src={item.media_url}
              alt={item.caption?.slice(0, 40) || "Instagram"}
              fill
              style={{ objectFit: "cover" }}
              sizes="56px"
            />
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
  const [vcardStatus, setVcardStatus] = useState<"idle" | "done">("idle");

  const downloadVCard = useCallback(() => {
    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:Flosz;Bence;;;",
      "FN:Bence Flosz",
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
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "bence_flosz.vcf");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setVcardStatus("done");
    setTimeout(() => setVcardStatus("idle"), 2000);
  }, []);

  return (
    <div
      className="lucid-backdrop-dusk"
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "clamp(16px, 4vw, 40px)",
        fontFamily: "var(--lucid-font-ui)",
      }}
    >
      {/* Top mono label */}
      <div
        style={{
          position: "fixed",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          font: "var(--lucid-type-caption)",
          letterSpacing: "var(--lucid-tracking-caption)",
          textTransform: "uppercase",
          color: "rgba(250,246,240,0.5)",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          zIndex: 10,
        }}
      >
        flz.works · 2026
      </div>

      {/* Main layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)",
          gap: "clamp(12px, 2vw, 24px)",
          maxWidth: 1100,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* ── LEFT PANEL: Identity ─────────────────────────────────────────── */}
        <div
          className="lucid-panel-light"
          style={{ padding: "clamp(24px, 3vw, 40px)", display: "flex", flexDirection: "column", gap: 24, minHeight: 520 }}
        >
          {/* Eyebrow */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="lucid-badge">Identity</span>
            <span
              style={{
                font: "var(--lucid-type-caption)",
                letterSpacing: "var(--lucid-tracking-caption)",
                textTransform: "uppercase",
                color: "var(--lucid-text-muted)",
              }}
            >
              Budapest · 2026
            </span>
          </div>

          {/* Wordmark */}
          <div style={{ flex: 1 }}>
            <h1
              style={{
                margin: 0,
                fontFamily: "var(--lucid-font-display)",
                fontWeight: 800,
                fontSize: "clamp(72px, 10vw, 120px)",
                lineHeight: 0.88,
                letterSpacing: "var(--lucid-tracking-display)",
                color: "var(--lucid-ink-900)",
              }}
            >
              FLZ
            </h1>
            <p
              style={{
                margin: "12px 0 0",
                font: "var(--lucid-type-label)",
                letterSpacing: "var(--lucid-tracking-label)",
                textTransform: "uppercase",
                color: "var(--lucid-stone-500)",
              }}
            >
              Indie Game Developer · 3D Artist · Backend Engineer
            </p>
          </div>

          {/* Bio */}
          <p
            style={{
              margin: 0,
              font: "var(--lucid-type-body)",
              color: "var(--lucid-text-secondary)",
              maxWidth: 420,
              lineHeight: 1.6,
            }}
          >
            {BIO}
          </p>

          {/* Current project highlight */}
          <div
            className="lucid-panel-clear"
            style={{ padding: "14px 18px" }}
          >
            <div
              style={{
                font: "var(--lucid-type-caption)",
                letterSpacing: "var(--lucid-tracking-caption)",
                textTransform: "uppercase",
                color: "var(--lucid-text-muted)",
                marginBottom: 4,
              }}
            >
              Current Build
            </div>
            <div
              style={{
                fontFamily: "var(--lucid-font-display)",
                fontWeight: 700,
                fontSize: 17,
                letterSpacing: "var(--lucid-tracking-tight)",
                color: "var(--lucid-text-primary)",
              }}
            >
              4-Player Co-op · Liminal/Dreamcore
            </div>
            <div
              style={{
                font: "var(--lucid-type-caption)",
                letterSpacing: "var(--lucid-tracking-caption)",
                textTransform: "uppercase",
                color: "var(--lucid-text-muted)",
                marginTop: 4,
              }}
            >
              Godot Engine · C# · Blender · Steam target
            </div>
          </div>

          {/* Education row */}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {[
              { label: "BGE", note: "Business Informatics BSc" },
              { label: "Boredo Systems", note: "Backend · 2024–25" },
            ].map((item) => (
              <div key={item.label}>
                <div
                  style={{
                    fontFamily: "var(--lucid-font-display)",
                    fontWeight: 700,
                    fontSize: 13,
                    letterSpacing: "var(--lucid-tracking-tight)",
                    color: "var(--lucid-text-primary)",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    font: "var(--lucid-type-caption)",
                    letterSpacing: "var(--lucid-tracking-caption)",
                    textTransform: "uppercase",
                    color: "var(--lucid-text-muted)",
                    marginTop: 2,
                  }}
                >
                  {item.note}
                </div>
              </div>
            ))}
          </div>

          {/* Instagram strip */}
          {instagramMedia.length > 0 && (
            <div>
              <div
                style={{
                  font: "var(--lucid-type-caption)",
                  letterSpacing: "var(--lucid-tracking-caption)",
                  textTransform: "uppercase",
                  color: "var(--lucid-text-muted)",
                  marginBottom: 8,
                }}
              >
                Recent · Instagram
              </div>
              <InstagramStrip media={instagramMedia} />
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL: Skills + Links ───────────────────────────────────── */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "clamp(10px, 1.5vw, 16px)" }}
        >
          {/* Skill cards grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "clamp(8px, 1.2vw, 12px)",
              flex: 1,
            }}
          >
            {SKILLS.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>

          {/* Portfolio articles count — if any */}
          {articles.length > 0 && (
            <div
              className="lucid-panel-clear"
              style={{
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: "var(--lucid-font-display)",
                    fontWeight: 700,
                    fontSize: 28,
                    letterSpacing: "var(--lucid-tracking-display)",
                    color: "var(--lucid-text-primary)",
                    lineHeight: 1,
                  }}
                >
                  {articles.length}
                </span>
                <span
                  style={{
                    font: "var(--lucid-type-caption)",
                    letterSpacing: "var(--lucid-tracking-caption)",
                    textTransform: "uppercase",
                    color: "var(--lucid-text-muted)",
                    marginLeft: 6,
                  }}
                >
                  portfolio items
                </span>
              </div>
              <Link
                href="/autosalon"
                className="lucid-pill-ink lucid-pill-sm"
                style={{ marginLeft: "auto" }}
              >
                View Archive
              </Link>
            </div>
          )}

          {/* Action links */}
          <div
            className="lucid-panel-light"
            style={{ padding: "20px 24px" }}
          >
            <div
              style={{
                font: "var(--lucid-type-caption)",
                letterSpacing: "var(--lucid-tracking-caption)",
                textTransform: "uppercase",
                color: "var(--lucid-text-muted)",
                marginBottom: 14,
              }}
            >
              Connect
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {/* vCard */}
              <button
                id="lucid-vcard-btn"
                className="lucid-pill-ink"
                onClick={downloadVCard}
                aria-label="Download vCard"
                style={{ gap: 6, fontSize: 13 }}
              >
                <DownloadIcon size={14} />
                {vcardStatus === "done" ? "Saved ✓" : "vCard"}
              </button>

              {/* Email */}
              <a
                id="lucid-email-link"
                href="mailto:floszbeni@gmail.com"
                className="lucid-pill-cream"
                aria-label="Send email"
                style={{ gap: 6, fontSize: 13 }}
              >
                <EmailIcon size={14} />
                Email
              </a>

              {/* GitHub */}
              <a
                id="lucid-github-link"
                href="https://github.com/Flzvision"
                target="_blank"
                rel="noopener noreferrer"
                className="lucid-pill-glass"
                aria-label="GitHub profile"
                style={{ gap: 6, fontSize: 13 }}
              >
                <GithubIcon size={14} />
                GitHub
              </a>

              {/* LinkedIn */}
              <a
                id="lucid-linkedin-link"
                href="https://linkedin.com/in/bence-flosz-56134535a"
                target="_blank"
                rel="noopener noreferrer"
                className="lucid-pill-glass"
                aria-label="LinkedIn profile"
                style={{ gap: 6, fontSize: 13 }}
              >
                <LinkedInIcon size={14} />
                LinkedIn
              </a>

              {/* Autopiac */}
              <Link
                id="lucid-autopiac-link"
                href="/autosalon"
                className="lucid-pill-glass"
                style={{ gap: 6, fontSize: 13 }}
              >
                <CarIcon size={14} />
                Autopiac
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom mono footer */}
      <div
        style={{
          textAlign: "center",
          marginTop: 28,
          font: "var(--lucid-type-caption)",
          letterSpacing: "var(--lucid-tracking-caption)",
          textTransform: "uppercase",
          color: "rgba(250,246,240,0.35)",
        }}
      >
        Flosz Bence · Budapest · Hungary · B2 English
      </div>
    </div>
  );
}
