"use client";

import { useState } from "react";
import { portfolioFocuses, portfolioSocials } from "@/lib/portfolio";
import type { InstagramMediaItem } from "@/lib/instagram";
import { ThemeSwitcher } from "./theme-switcher";
import Image from "next/image";
import type { PortfolioArticleWithImages } from "@/lib/portfolio-sync";
import { Calendar, Image as ImageIcon, ChevronDown, Eye, ArrowUpRight, Layers, Radio, Shield, Zap } from "lucide-react";
import dynamic from "next/dynamic";

const LandingBackground = dynamic(
  () => import("./landing-background").then((m) => m.LandingBackground),
  { ssr: false }
);

interface PortfolioOnepagerProps {
  instagramMedia: InstagramMediaItem[];
  articles: PortfolioArticleWithImages[];
}

const locale = "hu";

export function PortfolioOnepager({ instagramMedia, articles }: PortfolioOnepagerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  // Default to CAR_DESIGN to immediately showcase high-end automotive 3D projects
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | "CAR_DESIGN" | "OTHER">("CAR_DESIGN");
  const [uiHidden, setUiHidden] = useState(false);
  const [activeFocusTab, setActiveFocusTab] = useState<string>(portfolioFocuses[0]?.id || "");

  const enabledSocials = portfolioSocials.filter((s) => s.href);
  const publicArticles = articles.filter((a) => a.visible);
  const filteredArticles = publicArticles.filter((article) => {
    if (selectedCategory === "ALL") return true;
    return article.category === selectedCategory;
  });

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="portfolio-shell min-h-screen text-white font-sans overflow-x-hidden selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* 3D Interactive Background */}
      <LandingBackground />

      {/* ── Top HUD Navigation Bar ── */}
      <header className={`hud-nav fixed top-6 left-4 right-4 max-w-7xl lg:mx-auto z-40 rounded-full px-6 py-3.5 flex items-center justify-between transition-all duration-700 ${
        uiHidden ? "opacity-0 translate-y-[-20px] pointer-events-none" : "opacity-100 translate-y-0"
      }`}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => scrollToSection("hero")}>
            <div className="h-7 w-7 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Zap className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            </div>
            <span className="text-sm font-black uppercase tracking-[0.2em] text-white">
              FLZ<span className="text-cyan-400">WORKS</span>
            </span>
          </div>

          {/* Navigation Anchors */}
          <nav className="hidden md:flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.06] rounded-full p-1.5 px-3">
            <button
              onClick={() => scrollToSection("hero")}
              className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/[0.06] transition-all duration-300"
            >
              Fókusz
            </button>
            <button
              onClick={() => scrollToSection("archive")}
              className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/[0.06] transition-all duration-300"
            >
              Archívum
            </button>
            {instagramMedia.length > 0 && (
              <button
                onClick={() => scrollToSection("signals")}
                className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/[0.06] transition-all duration-300"
              >
                Jelek
              </button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Signal Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="hud-pulse-bubble" />
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-400">
              SIGNAL ACTIVE
            </span>
          </div>

          {/* Quick Showroom Mode Button */}
          <button
            onClick={() => setUiHidden(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-[10px] font-black uppercase tracking-widest text-white/80 hover:text-white transition-all duration-300 active:scale-95 cursor-pointer shadow-lg"
          >
            <Eye className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden md:inline">Showroom Mode</span>
          </button>

          <ThemeSwitcher />
        </div>
      </header>

      {/* ── Main Viewport Content ── */}
      <main className={`relative z-10 max-w-7xl mx-auto px-4 pt-32 pb-24 transition-all duration-700 ${
        uiHidden ? "opacity-0 scale-98 pointer-events-none" : "opacity-100 scale-100"
      }`}>
        
        {/* Above-the-fold Stage: Left panel occupies 4 columns, leaving 8 columns completely unhindered for 3D view */}
        <div id="hero" className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[70vh] items-start pt-6">
          
          {/* Unified Hero & Focus Floating Panel */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            <div className="hud-panel flex flex-col justify-between p-8 rounded-3xl relative overflow-hidden group">
              {/* Shimmer top border */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-400/80">
                    AUTOMOTIVE & SYSTEMS
                  </span>
                </div>

                <h1 className="text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-6 portfolio-text-glow">
                  FLZ
                  <br />
                  WORKS
                </h1>

                <p className="text-white/60 font-mono text-xs leading-relaxed mb-8">
                  Fotorealisztikus 3D gépjárműtervezés, rendszerarchitektúra, nagyteljesítményű webrenderelés és prototípus-fejlesztés.
                </p>
              </div>

              {/* Index Focus Pill Selector */}
              <div className="pt-6 border-t border-white/[0.06]">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="h-3.5 w-3.5 text-white/40" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                    Index Fókusz
                  </h2>
                </div>

                <div className="flex flex-col gap-2">
                  {portfolioFocuses.map((focus, i) => {
                    const isActive = activeFocusTab === focus.id;
                    return (
                      <div
                        key={focus.id}
                        onClick={() => setActiveFocusTab(focus.id)}
                        className={`group/focus flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all duration-300 ${
                          isActive
                            ? "bg-cyan-500/10 border-cyan-500/30 shadow-lg shadow-cyan-500/10 text-white"
                            : "bg-white/[0.02] border-white/[0.05] text-white/60 hover:text-white hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-mono tracking-widest ${isActive ? "text-cyan-400" : "text-white/30"}`}>
                            0{i + 1}
                          </span>
                          <span className="text-xs font-black uppercase tracking-wider">
                            {focus.label}
                          </span>
                        </div>
                        <div className={`h-1.5 w-1.5 rounded-full transition-transform duration-300 ${
                          isActive ? "bg-cyan-400 scale-125 shadow-sm shadow-cyan-400" : "bg-white/20 group-hover/focus:bg-white/40"
                        }`} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/[0.06]">
                {enabledSocials.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/60 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.18] transition-all duration-300 shadow-md"
                    >
                      <Icon className="h-3 w-3 text-cyan-400" />
                      {social.label}
                      <ArrowUpRight className="h-2.5 w-2.5 opacity-50" />
                    </a>
                  );
                })}
              </div>

            </div>
          </div>

          {/* Completely empty right 8 columns allowing the 3D car to be perfectly visible and unhindered */}
          <div className="lg:col-span-8 hidden lg:block pointer-events-none" />

        </div>

        {/* ── Design Archive Section ── */}
        <div id="archive" className="mt-20 pt-16 border-t border-white/[0.06]">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/40">
                  DESIGN ARCHIVE · REPOSITORY
                </p>
              </div>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none portfolio-section-title">
                {locale === "hu" ? "Archívum" : "Archive"}
              </h2>
            </div>

            {/* Category Filters */}
            <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.08] p-1.5 rounded-2xl shrink-0 backdrop-blur-xl shadow-xl">
              {[
                { id: "ALL" as const, label: locale === "hu" ? "Összes" : "All" },
                { id: "CAR_DESIGN" as const, label: "3D Autó" },
                { id: "OTHER" as const, label: locale === "hu" ? "Egyéb" : "Other" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                    selectedCategory === cat.id
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/20"
                      : "text-white/40 hover:text-white hover:bg-white/[0.05] border border-transparent"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredArticles.length === 0 ? (
              <div className="col-span-full py-28 text-center border border-dashed border-white/[0.08] bg-white/[0.01] rounded-3xl backdrop-blur-md">
                <p className="text-sm font-black uppercase tracking-widest text-white/40">
                  {locale === "hu" ? "Nincsenek cikkek ebben a kategóriában" : "No projects in this category"}
                </p>
                <p className="text-xs font-mono text-white/20 mt-2">
                  {locale === "hu" ? "Válassz másik szűrőt a megtekintéshez" : "Select another filter to view"}
                </p>
              </div>
            ) : (
              filteredArticles.map((article, i) => {
                const isExpanded = expandedId === article.id;
                const isCar = article.category === "CAR_DESIGN";

                return (
                  <div
                    key={article.id}
                    className={`hud-card relative flex flex-col group cursor-pointer overflow-hidden rounded-3xl ${
                      isExpanded
                        ? "col-span-full md:col-span-full xl:col-span-full ring-1 ring-cyan-500/30"
                        : "min-h-[280px]"
                    }`}
                    onClick={() => {
                      if (!isExpanded) setExpandedId(article.id);
                    }}
                  >
                    {/* Shimmer top */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                    {/* Left category accent bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${
                      isCar ? "bg-gradient-to-b from-cyan-400 via-cyan-600/30 to-transparent" : "bg-gradient-to-b from-purple-400 via-purple-600/30 to-transparent"
                    }`} />

                    <div className="relative p-8 flex flex-col h-full">
                      
                      {/* Meta Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                            isCar
                              ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                              : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          }`}>
                            {isCar ? "3D Auto" : (locale === "hu" ? "Egyéb" : "Other")}
                          </span>
                          <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                            #{String(i + 1).padStart(3, "0")}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-white/40">
                            <Calendar className="h-3 w-3 text-cyan-400" />
                            {article.date === "N/A" ? "N/A" : article.date.replace(/-/g, ".")}
                          </span>
                          {article.images.length > 0 && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-white/40">
                              <ImageIcon className="h-3 w-3 text-cyan-400" />
                              {article.images.length}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <h3 className={`font-black uppercase tracking-tight leading-tight text-white/90 group-hover:text-white transition-colors duration-300 ${
                          isExpanded ? "text-3xl md:text-5xl text-cyan-300" : "text-2xl"
                        }`}>
                          {article.title}
                        </h3>
                        {isExpanded && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedId(null);
                            }}
                            className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition cursor-pointer"
                          >
                            <ChevronDown className="h-5 w-5 rotate-180" />
                          </button>
                        )}
                      </div>

                      {/* Description */}
                      <p className={`font-mono text-sm leading-relaxed transition-all duration-300 ${
                        isExpanded
                          ? "text-white/70 mt-2 mb-8 max-w-4xl"
                          : "text-white/40 line-clamp-2 mt-auto"
                      }`}>
                        {article.description || "Portfolio project folder synced from repository."}
                      </p>

                      {/* Hover action indicator */}
                      {!isExpanded && (
                        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20">
                            Megnyit <ArrowUpRight className="h-3 w-3" />
                          </div>
                        </div>
                      )}

                      {/* Expanded Gallery */}
                      {isExpanded && article.images.length > 0 && (
                        <div className="mt-4 pt-8 border-t border-white/[0.06] space-y-6">
                          <h4 className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400/80 flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-cyan-400" />
                            Média Galéria · {article.images.length} kép
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                            {article.images.map((img) => {
                              const imgPath = `/api/portfolio/media/${article.folderName}/${img}`;
                              return (
                                <div
                                  key={img}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveImage(imgPath);
                                  }}
                                  className="group/img relative aspect-video cursor-zoom-in overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.08] transition-all duration-400 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10"
                                >
                                  <Image
                                    src={imgPath}
                                    alt={img}
                                    fill
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 12vw"
                                    className="object-cover transition duration-500 group-hover/img:scale-105"
                                    unoptimized
                                  />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                    <Eye className="h-5 w-5 text-cyan-400" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* ── Transmission Log (Instagram Signals) ── */}
        {instagramMedia.length > 0 && (
          <div id="signals" className="mt-28 pt-16 border-t border-white/[0.06]">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/40">
                    LIVE FEED · INSTAGRAM
                  </p>
                </div>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-white/80">
                  Transmission<br />
                  <span className="portfolio-text-glow">Log</span>
                </h2>
              </div>
              <p className="text-xs font-mono text-white/30 mt-3 md:mt-0 uppercase tracking-widest bg-white/[0.03] px-4 py-2 rounded-xl border border-white/[0.06]">
                @flzworks · IG Signal
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {instagramMedia.map((item) => (
                <a
                  key={item.id}
                  href={item.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="relative aspect-square overflow-hidden rounded-3xl group bg-white/[0.03] border border-white/[0.08] transition-all duration-400 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/10"
                >
                  {(item.thumbnail_url || item.media_url) && (
                    <Image
                      src={item.thumbnail_url || item.media_url || ""}
                      alt={item.caption || "Instagram post"}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover opacity-50 group-hover:opacity-90 transition-all duration-500 grayscale group-hover:grayscale-0 scale-105 group-hover:scale-100"
                      unoptimized
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center gap-2 bg-cyan-500/20 backdrop-blur-md border border-cyan-500/40 px-3 py-1.5 rounded-full">
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300">Signal</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-cyan-300" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── Floating Footer Marquee Ticker ── */}
        <div className="mt-28 pt-8 border-t border-white/[0.06] flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 overflow-hidden w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl py-3 px-6 backdrop-blur-xl shadow-xl">
            <div className="flex whitespace-nowrap animate-marquee">
              {Array.from({ length: 10 }).map((_, i) => (
                <span key={i} className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30 mx-8">
                  FLZ WORKS · DESIGN · ENGINEERING · MACHINE EXPERIENCE · 2026 ·
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between px-2 text-[11px] font-mono text-white/20 uppercase tracking-widest">
          <p>FLZ Works · {new Date().getFullYear()}</p>
          <p>Design · Engineering · Architecture</p>
        </div>

      </main>

      {/* ── Floating Showroom Mode Toggle Button ── */}
      <button
        onClick={() => setUiHidden(!uiHidden)}
        className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-full border shadow-2xl backdrop-blur-2xl transition-all duration-400 hover:scale-105 active:scale-95 cursor-pointer ${
          uiHidden
            ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-cyan-500/20 ring-2 ring-cyan-400/20"
            : "bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.15] text-white/70 hover:text-white"
        }`}
        title={uiHidden ? "Show UI" : "Showroom Mode (Hide UI)"}
        aria-label="Toggle Showroom Mode"
      >
        <Eye className={`h-5 w-5 transition-transform duration-300 ${uiHidden ? "text-cyan-300 animate-pulse" : "text-cyan-400"}`} />
        <span className="text-xs font-black uppercase tracking-widest">
          {uiHidden ? "Show UI" : "Clean Mode"}
        </span>
      </button>

      {/* ── Lightbox Modal ── */}
      {activeImage && (
        <div
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6 backdrop-blur-2xl cursor-zoom-out animate-fadeIn"
        >
          <div className="relative max-h-[90vh] max-w-7xl aspect-video w-full rounded-3xl overflow-hidden border border-white/[0.15] shadow-2xl shadow-black/80">
            <Image
              src={activeImage}
              alt="Expanded view"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <div className="absolute top-8 right-8 text-white/60 hover:text-white transition font-black uppercase tracking-widest text-xs bg-white/[0.08] hover:bg-white/[0.15] px-6 py-3 rounded-full border border-white/[0.15] backdrop-blur-2xl shadow-2xl cursor-pointer">
            ✕ Bezárás
          </div>
        </div>
      )}

    </div>
  );
}
