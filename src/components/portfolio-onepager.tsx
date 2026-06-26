"use client";

import { useState } from "react";
import { portfolioFocuses, portfolioSocials } from "@/lib/portfolio";
import type { InstagramMediaItem } from "@/lib/instagram";
import { ThemeSwitcher } from "./theme-switcher";
import Image from "next/image";
import type { PortfolioArticleWithImages } from "@/lib/portfolio-sync";
import { Calendar, Image as ImageIcon, ChevronDown, Eye, ArrowUpRight, Layers } from "lucide-react";
import dynamic from "next/dynamic";

const LandingBackground = dynamic(
  () => import("./landing-background").then((m) => m.LandingBackground),
  { ssr: false }
);

interface PortfolioOnepagerProps {
  instagramMedia: InstagramMediaItem[];
  articles: PortfolioArticleWithImages[];
}

// Helper to determine locale dynamically (fallback to Hungarian)
const locale = "hu";

export function PortfolioOnepager({ instagramMedia, articles }: PortfolioOnepagerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | "CAR_DESIGN" | "OTHER">("ALL");
  const enabledSocials = portfolioSocials.filter((s) => s.href);

  const publicArticles = articles.filter((a) => a.visible);
  const filteredArticles = publicArticles.filter((article) => {
    if (selectedCategory === "ALL") return true;
    return article.category === selectedCategory;
  });

  return (
    <div className="portfolio-shell min-h-screen text-white font-sans overflow-x-hidden selection:bg-white/20 selection:text-white">
      {/* 3D Interactive Background */}
      <LandingBackground />

      {/* Marquee Ticker */}
      <div className="portfolio-ticker w-full border-b border-white/[0.06] py-2.5 overflow-hidden flex items-center relative z-10">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mx-6">
              FLZ Works · Design · Engineering · Machine Experience · 2026 ·
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Hero Bento — 8 cols */}
        <div className="portfolio-bento-hero lg:col-span-8 flex flex-col justify-between min-h-[420px] p-10">
          {/* Shimmer top edge */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          <header className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/30 mb-4">
                Portfolio · 2026
              </p>
              <h1 className="text-7xl md:text-[96px] font-black uppercase tracking-tighter leading-[0.88] mb-5">
                FLZ
                <br />
                <span className="portfolio-text-glow">WORKS</span>
              </h1>
              <p className="text-white/40 font-mono text-sm max-w-md leading-relaxed">
                3D automotive design, systems architecture, high-performance web, and prototype engineering.
              </p>
            </div>
            <ThemeSwitcher />
          </header>

          <div className="flex flex-wrap gap-3 mt-auto pt-8">
            {enabledSocials.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="portfolio-social-btn inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-full"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {social.label}
                  <ArrowUpRight className="h-3 w-3 opacity-50" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Index Focus Bento — 4 cols */}
        <div className="portfolio-bento-card lg:col-span-4 flex flex-col p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
          <div className="flex items-center gap-2 mb-7">
            <Layers className="h-3.5 w-3.5 text-white/30" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
              Index Focus
            </h2>
          </div>
          <div className="flex flex-col gap-7 flex-1 justify-center">
            {portfolioFocuses.map((focus, i) => (
              <div key={focus.id} className="flex flex-col group cursor-default">
                <span className="text-[10px] font-mono text-white/20 mb-1 tracking-widest">
                  0{i + 1}
                </span>
                <h3 className="text-2xl lg:text-3xl font-black uppercase tracking-tight text-white/80 group-hover:text-white transition-colors duration-300">
                  {focus.label}
                </h3>
                <div className="h-px w-0 group-hover:w-full bg-gradient-to-r from-[var(--accent-aqua)] to-transparent transition-all duration-500 mt-1.5" />
              </div>
            ))}
          </div>
        </div>

        {/* ── Archive Section ── */}
        <div className="lg:col-span-12 mt-6">
          {/* Section heading */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/25 mb-2">
                Design Archive
              </p>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none portfolio-section-title">
                {locale === "hu" ? "Archívum" : "Archive"}
              </h2>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 portfolio-filter-bar p-1.5 rounded-2xl shrink-0 self-start md:self-auto">
              {[
                { id: "ALL" as const, label: locale === "hu" ? "Összes" : "All" },
                { id: "CAR_DESIGN" as const, label: "3D Autó" },
                { id: "OTHER" as const, label: locale === "hu" ? "Egyéb" : "Other" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`portfolio-filter-btn px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                    selectedCategory === cat.id ? "portfolio-filter-active" : "portfolio-filter-inactive"
                  } ${cat.id === "CAR_DESIGN" && selectedCategory === cat.id ? "portfolio-filter-cyan" : ""}
                  ${cat.id === "OTHER" && selectedCategory === cat.id ? "portfolio-filter-purple" : ""}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredArticles.length === 0 ? (
              <div className="col-span-full py-20 text-center portfolio-empty-state rounded-3xl">
                <p className="text-sm font-black uppercase tracking-widest text-white/30">
                  {locale === "hu" ? "Nincsenek cikkek ebben a kategóriában" : "No projects in this category"}
                </p>
                <p className="text-xs font-mono text-white/15 mt-2">
                  {locale === "hu" ? "Válassz másik szűrőt" : "Select another filter"}
                </p>
              </div>
            ) : (
              filteredArticles.map((article, i) => {
                const isExpanded = expandedId === article.id;
                const isCar = article.category === "CAR_DESIGN";

                return (
                  <div
                    key={article.id}
                    className={`portfolio-archive-card relative flex flex-col group transition-all duration-500 cursor-pointer overflow-hidden rounded-2xl ${
                      isExpanded
                        ? "col-span-full md:col-span-full xl:col-span-full"
                        : "min-h-[260px]"
                    }`}
                    onClick={() => {
                      if (!isExpanded) setExpandedId(article.id);
                    }}
                  >
                    {/* Card shimmer top */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                    {/* Category accent line */}
                    <div className={`absolute left-0 top-0 bottom-0 w-[2px] ${
                      isCar ? "bg-gradient-to-b from-cyan-400/80 via-cyan-500/30 to-transparent" : "bg-gradient-to-b from-purple-400/80 via-purple-500/30 to-transparent"
                    }`} />

                    <div className="relative p-7 flex flex-col h-full">
                      {/* Meta row */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                            isCar
                              ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                              : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          }`}>
                            {isCar ? "3D Auto" : (locale === "hu" ? "Egyéb" : "Other")}
                          </span>
                          <span className="text-[9px] font-mono text-white/25 uppercase tracking-widest">
                            #{String(i + 1).padStart(3, "0")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-white/25">
                            <Calendar className="h-2.5 w-2.5" />
                            {article.date === "N/A" ? "N/A" : article.date.replace(/-/g, ".")}
                          </span>
                          {article.images.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-white/25">
                              <ImageIcon className="h-2.5 w-2.5" />
                              {article.images.length}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className={`font-black uppercase tracking-tight leading-tight text-white/90 group-hover:text-white transition-colors duration-300 ${isExpanded ? "text-3xl md:text-4xl" : "text-xl"}`}>
                          {article.title}
                        </h3>
                        {isExpanded && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedId(null);
                            }}
                            className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition"
                          >
                            <ChevronDown className="h-4 w-4 rotate-180" />
                          </button>
                        )}
                      </div>

                      {/* Description */}
                      <p className={`font-mono text-sm leading-relaxed transition-all duration-300 ${
                        isExpanded
                          ? "text-white/60 mt-2 mb-6"
                          : "text-white/35 line-clamp-2 mt-auto"
                      }`}>
                        {article.description || "Portfolio project folder synced from repository."}
                      </p>

                      {/* Hover arrow (not expanded) */}
                      {!isExpanded && (
                        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white/50">
                            Megnyit <ArrowUpRight className="h-3 w-3" />
                          </div>
                        </div>
                      )}

                      {/* Expanded: Image gallery */}
                      {isExpanded && article.images.length > 0 && (
                        <div className="mt-2 pt-6 border-t border-white/[0.06] space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                            Média Galéria · {article.images.length} kép
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                            {article.images.map((img) => {
                              const imgPath = `/api/portfolio/media/${article.folderName}/${img}`;
                              return (
                                <div
                                  key={img}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveImage(imgPath);
                                  }}
                                  className="group/img relative aspect-video cursor-zoom-in overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.06] transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-black/40"
                                >
                                  <Image
                                    src={imgPath}
                                    alt={img}
                                    fill
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 12vw"
                                    className="object-cover transition duration-500 group-hover/img:scale-105"
                                    unoptimized
                                  />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition duration-300 flex items-center justify-center">
                                    <Eye className="h-4 w-4 text-white" />
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

        {/* Instagram Grid */}
        {instagramMedia.length > 0 && (
          <div className="lg:col-span-12 mt-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/25 mb-2">
                  Live Feed · Instagram
                </p>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-white/70">
                  Transmission<br />
                  <span className="portfolio-text-glow">Log</span>
                </h2>
              </div>
              <p className="text-[10px] font-mono text-white/20 mt-3 md:mt-0 uppercase tracking-widest">
                @flzworks · IG Signal
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {instagramMedia.map((item) => (
                <a
                  key={item.id}
                  href={item.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="relative aspect-square overflow-hidden rounded-2xl group bg-white/[0.03] border border-white/[0.06] transition-all duration-300 hover:border-white/20"
                >
                  {(item.thumbnail_url || item.media_url) && (
                    <Image
                      src={item.thumbnail_url || item.media_url || ""}
                      alt={item.caption || "Instagram post"}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover opacity-40 group-hover:opacity-80 transition-all duration-500 grayscale group-hover:grayscale-0 scale-105 group-hover:scale-100"
                      unoptimized
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition duration-300">
                    <ArrowUpRight className="h-4 w-4 text-white" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Footer spacer */}
        <div className="lg:col-span-12 mt-12 pt-8 border-t border-white/[0.05] flex items-center justify-between">
          <p className="text-[10px] font-mono text-white/15 uppercase tracking-widest">
            FLZ Works · {new Date().getFullYear()}
          </p>
          <p className="text-[10px] font-mono text-white/15 uppercase tracking-widest">
            Design · Engineering · Architecture
          </p>
        </div>

      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/96 p-4 backdrop-blur-sm cursor-zoom-out"
        >
          <div className="relative max-h-full max-w-7xl aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <Image
              src={activeImage}
              alt="Expanded view"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <div className="absolute top-5 right-5 text-white/40 hover:text-white transition font-black uppercase tracking-widest text-[10px] bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md cursor-pointer">
            ✕ Bezárás
          </div>
        </div>
      )}
    </div>
  );
}
