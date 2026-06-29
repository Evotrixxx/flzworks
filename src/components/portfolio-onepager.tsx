"use client";

import { useState, useEffect } from "react";
import type { InstagramMediaItem } from "@/lib/instagram";
import Image from "next/image";
import type { PortfolioArticleWithImages } from "@/lib/portfolio-sync";
import { Calendar, Image as ImageIcon, ChevronDown, Eye, ArrowUpRight, Radio, Zap } from "lucide-react";
import { LandingParallax } from "./landing-parallax";

interface PortfolioOnepagerProps {
  instagramMedia: InstagramMediaItem[];
  articles: PortfolioArticleWithImages[];
}

const locale = "hu";

export function PortfolioOnepager({ instagramMedia, articles }: PortfolioOnepagerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | "CAR_DESIGN" | "OTHER">("ALL");
  const [uiHidden, setUiHidden] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) setScrollProgress((window.scrollY / totalHeight) * 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const publicArticles = articles.filter((a) => a.visible);
  const filteredArticles = publicArticles.filter((article) =>
    selectedCategory === "ALL" ? true : article.category === selectedCategory
  );

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="portfolio-shell min-h-screen text-white font-sans overflow-x-hidden selection:bg-cyan-500/20 selection:text-cyan-300">
      <LandingParallax />

      {/* ── Navigation ── */}
      <header
        className={`hud-nav fixed top-5 left-4 right-4 max-w-7xl lg:mx-auto z-40 rounded-full px-5 py-3 flex items-center justify-between transition-all duration-700 overflow-hidden ${
          uiHidden ? "opacity-0 -translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"
        }`}
      >
        <button
          onClick={() => scrollToSection("hero")}
          className="text-xs font-black uppercase tracking-[0.22em] text-white cursor-pointer"
        >
          FLZ<span className="text-cyan-400/80">·</span>WORKS
        </button>

        <nav className="flex items-center gap-0.5">
          {[
            { label: "Home", id: "hero" },
            { label: locale === "hu" ? "Archívum" : "Archive", id: "archive" },
            ...(instagramMedia.length > 0 ? [{ label: "Signals", id: "signals" }] : []),
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white/40 hover:text-white hover:bg-white/[0.06] transition-all duration-200 cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </nav>



        <div
          className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-75"
          style={{ width: `${scrollProgress}%` }}
        />
      </header>

      {/* ── Hero ── */}
      <section
        id="hero"
        className={`relative min-h-screen flex flex-col transition-all duration-700 ${
          uiHidden ? "opacity-0 scale-[0.98] pointer-events-none" : "opacity-100 scale-100"
        }`}
      >
        {/* Content pinned to bottom */}
        <div className="mt-auto relative z-10 px-6 lg:px-10 pb-14">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">

              {/* Wordmark */}
              <div className="font-black uppercase leading-[0.82] select-none">
                <span
                  className="block text-[23vw] lg:text-[13vw]"
                  style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.14)", color: "transparent" }}
                >
                  FLZ
                </span>
                <span className="block text-[23vw] lg:text-[13vw] portfolio-text-glow">
                  WORKS
                </span>
              </div>

              {/* Right info */}
              <div className="flex flex-col items-start lg:items-end gap-5 lg:mb-1.5">
                <div className="lg:text-right">
                  <p className="text-[8px] font-black uppercase tracking-[0.45em] text-white/40 mb-2.5">
                    Portfólió & Bemutatkozás
                  </p>
                  <p className="text-[13px] text-white/55 font-mono leading-[1.8]">
                    Automotive Design · 3D Engineering<br />
                    Machine Experience
                  </p>
                </div>

                <div className="flex items-center gap-5">
                  <div>
                    <div className="text-2xl font-black text-white tabular-nums">
                      {publicArticles.length.toString().padStart(2, "0")}
                    </div>
                    <div className="text-[8px] uppercase tracking-widest text-white/30 mt-0.5">
                      Completed Projects
                    </div>
                  </div>
                  <div className="w-px h-9 bg-white/[0.07]" />
                  <div>
                    <div className="text-2xl font-black text-cyan-400/80">2026</div>
                    <div className="text-[8px] uppercase tracking-widest text-white/30 mt-0.5">Active</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollToSection("archive")}
                    className="px-5 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] text-[9px] font-black uppercase tracking-widest text-white/80 hover:text-white transition-all cursor-pointer"
                  >
                    {locale === "hu" ? "Archívum" : "Archive"}
                  </button>
                  <button
                    onClick={() => setUiHidden(true)}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-full border border-cyan-500/25 bg-cyan-500/8 text-[9px] font-black uppercase tracking-widest text-cyan-400/70 hover:text-cyan-300 hover:bg-cyan-500/15 transition-all cursor-pointer"
                  >
                    <Eye className="h-3 w-3" />
                    Showroom
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="relative z-10 flex flex-col items-center gap-2 pb-5 mt-5 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
          onClick={() => scrollToSection("archive")}
        >
          <div className="h-9 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent animate-pulse" />
          <span className="text-[7px] font-mono uppercase tracking-[0.35em] text-white/60">scroll</span>
        </div>
      </section>

      {/* ── Main Content ── */}
      <main
        className={`relative z-10 max-w-7xl mx-auto px-4 pb-24 transition-all duration-700 ${
          uiHidden ? "opacity-0 scale-[0.98] pointer-events-none" : "opacity-100 scale-100"
        }`}
      >
        {/* ── Archive ── */}
        <section id="archive" className="pt-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-t border-white/[0.05] pt-16">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Radio className="h-3 w-3 text-cyan-400/70 animate-pulse" />
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/60">
                  Design Archive · Repository
                </p>
              </div>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none portfolio-section-title">
                {locale === "hu" ? "Archívum" : "Archive"}
              </h2>
            </div>

            <div className="flex items-center gap-1 bg-white/[0.02] border border-white/[0.05] p-1 rounded-xl shrink-0">
              {[
                { id: "ALL" as const, label: locale === "hu" ? "Összes" : "All" },
                { id: "CAR_DESIGN" as const, label: "3D Autó" },
                { id: "OTHER" as const, label: locale === "hu" ? "Egyéb" : "Other" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-white/[0.07] text-white border border-white/[0.12]"
                      : "text-white/60 hover:text-white/75 border border-transparent"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredArticles.length === 0 ? (
              <div className="col-span-full py-24 text-center border border-dashed border-white/[0.05] rounded-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60">
                  {locale === "hu" ? "Nincsenek cikkek ebben a kategóriában" : "No projects in this category"}
                </p>
              </div>
            ) : (
              filteredArticles.map((article, i) => {
                const isExpanded = expandedId === article.id;
                const isCar = article.category === "CAR_DESIGN";

                return (
                  <article
                    key={article.id}
                    className={`hud-card group relative flex flex-col cursor-pointer rounded-2xl overflow-hidden ${
                      isExpanded
                        ? "col-span-full ring-1 ring-white/[0.1]"
                        : `min-h-[260px] ${i === 0 ? "md:col-span-2" : ""}`
                    }`}
                    onClick={() => { if (!isExpanded) setExpandedId(article.id); }}
                  >
                    {!isExpanded && (
                      <div className="card-ghost-index">
                        #{String(i + 1).padStart(3, "0")}
                      </div>
                    )}

                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent pointer-events-none" />

                    <div className={`absolute left-0 top-0 bottom-0 w-[2px] ${
                      isCar
                        ? "bg-gradient-to-b from-cyan-500/70 via-cyan-600/15 to-transparent"
                        : "bg-gradient-to-b from-purple-500/70 via-purple-600/15 to-transparent"
                    }`} />

                    <div className="relative p-7 flex flex-col h-full gap-4">
                      <div className="flex items-center justify-between">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                          isCar
                            ? "text-cyan-400/80 border-cyan-500/20 bg-cyan-500/8"
                            : "text-purple-400/80 border-purple-500/20 bg-purple-500/8"
                        }`}>
                          {isCar ? "3D Auto" : "Design"}
                        </span>
                        <div className="flex items-center gap-3 text-[9px] font-mono text-white/60">
                          {article.date !== "N/A" && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-2.5 w-2.5" />
                              {article.date.replace(/-/g, ".")}
                            </span>
                          )}
                          {article.images.length > 0 && (
                            <span className="flex items-center gap-1">
                              <ImageIcon className="h-2.5 w-2.5" />
                              {article.images.length}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <h3 className={`font-black uppercase tracking-tight leading-tight text-white/95 group-hover:text-white transition-colors ${
                          isExpanded ? "text-3xl md:text-5xl" : "text-xl"
                        }`}>
                          {article.title}
                        </h3>
                        {isExpanded && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setExpandedId(null); }}
                            className="shrink-0 h-9 w-9 flex items-center justify-center rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-white transition cursor-pointer"
                          >
                            <ChevronDown className="h-4 w-4 rotate-180" />
                          </button>
                        )}
                      </div>

                      <p className={`font-mono text-sm leading-relaxed ${
                        isExpanded ? "text-white/80 mb-4 max-w-3xl" : "text-white/60 line-clamp-2 mt-auto"
                      }`}>
                        {article.description || "Portfolio project synced from repository."}
                      </p>

                      {!isExpanded && (
                        <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-white/60">
                            {locale === "hu" ? "Megnyit" : "Open"} <ArrowUpRight className="h-3 w-3" />
                          </div>
                        </div>
                      )}

                      {isExpanded && article.images.length > 0 && (
                        <div className="mt-2 pt-6 border-t border-white/[0.05]">
                          <h4 className="text-[8px] font-black uppercase tracking-[0.35em] text-white/45 mb-4 flex items-center gap-1.5">
                            <ImageIcon className="h-3 w-3" />
                            {locale === "hu" ? "Média Galéria" : "Media Gallery"} · {article.images.length}
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                            {article.images.map((img) => {
                              const imgPath = `/api/portfolio/media/${article.folderName}/${img}`;
                              return (
                                <div
                                  key={img}
                                  onClick={(e) => { e.stopPropagation(); setActiveImage(imgPath); }}
                                  className="relative aspect-video cursor-zoom-in overflow-hidden rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.18] transition-all duration-300"
                                >
                                  <Image
                                    src={imgPath}
                                    alt={img}
                                    fill
                                    sizes="(max-width: 640px) 50vw, 12vw"
                                    className="object-cover transition-transform duration-500 hover:scale-105"
                                    unoptimized
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        {/* ── Instagram Signals ── */}
        {instagramMedia.length > 0 && (
          <section id="signals" className="mt-28 pt-16 border-t border-white/[0.05]">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-3 w-3 text-cyan-400/70 animate-pulse" />
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/45">
                    Projektek
                  </p>
                </div>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-white/85">
                  Munkák & <span className="portfolio-text-glow">Log</span>
                </h2>
              </div>
              <p className="text-[9px] font-mono text-white/40 mt-3 md:mt-0 uppercase tracking-widest border border-white/[0.05] px-4 py-2 rounded-xl">
                @flzworks
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {instagramMedia.map((item) => (
                <a
                  key={item.id}
                  href={item.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="relative aspect-square overflow-hidden clip-squircle group bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.14] transition-all duration-300"
                >
                  {(item.thumbnail_url || item.media_url) && (
                    <Image
                      src={item.thumbnail_url || item.media_url || ""}
                      alt={item.caption || "Instagram post"}
                      fill
                      sizes="(max-width: 768px) 50vw, 20vw"
                      className="object-cover opacity-70 group-hover:opacity-100 transition-all duration-400 grayscale-[20%] group-hover:grayscale-0"
                      unoptimized
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition duration-200">
                    <ArrowUpRight className="h-4 w-4 text-white/85" />
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ── Footer ── */}
        <div className="mt-28 pt-8 border-t border-white/[0.04] overflow-hidden">
          <div className="flex items-center overflow-hidden w-full py-2">
            <div className="flex whitespace-nowrap animate-marquee">
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} className="text-[9px] font-black uppercase tracking-[0.4em] text-white/25 mx-8">
                  FLZ WORKS · DESIGN · ENGINEERING · MACHINE EXPERIENCE · 2026 ·
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between px-1 mt-4 text-[9px] font-mono text-white/25 uppercase tracking-widest">
            <p>FLZ Works · {new Date().getFullYear()}</p>
            <p>Design · Engineering · Architecture</p>
          </div>
        </div>
      </main>



      {/* ── Lightbox ── */}
      {activeImage && (
        <div
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/96 p-6 backdrop-blur-2xl cursor-zoom-out animate-fadeIn"
        >
          <div className="relative max-h-[90vh] max-w-7xl aspect-video w-full rounded-2xl overflow-hidden border border-white/[0.08]">
            <Image src={activeImage} alt="Expanded view" fill className="object-contain" unoptimized />
          </div>
          <div className="absolute top-8 right-8 text-white/65 hover:text-white transition text-[9px] font-black uppercase tracking-widest bg-white/[0.05] hover:bg-white/[0.1] px-5 py-3 rounded-full border border-white/[0.08] cursor-pointer">
            ✕ {locale === "hu" ? "Bezárás" : "Close"}
          </div>
        </div>
      )}
    </div>
  );
}
