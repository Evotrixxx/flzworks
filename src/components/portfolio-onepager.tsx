"use client";

import { useState } from "react";
import { portfolioFocuses, portfolioSocials } from "@/lib/portfolio";
import type { InstagramMediaItem } from "@/lib/instagram";
import { ThemeSwitcher } from "./theme-switcher";
import Image from "next/image";
import type { PortfolioArticleWithImages } from "@/lib/portfolio-sync";
import { Calendar, Image as ImageIcon, ChevronDown, Eye } from "lucide-react";

interface PortfolioOnepagerProps {
  instagramMedia: InstagramMediaItem[];
  articles: PortfolioArticleWithImages[];
}

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
    <div className="neo-bg min-h-screen text-white font-sans overflow-x-hidden selection:bg-white selection:text-black">
      {/* Marquee Header */}
      <div className="w-full border-b border-white/10 bg-black py-2 overflow-hidden flex items-center">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="text-xs font-black uppercase tracking-widest text-zinc-500 mx-4">
              FLZ // DESIGN // ENGINEERING // MACHINE EXPERIENCE // 2026 //
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Intro / Hero Bento (Spans 8 cols) */}
        <div className="neo-bento-card p-8 lg:col-span-8 flex flex-col justify-between min-h-[400px]">
          <header className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-7xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-4">
                FLZ<br />
                <span className="neo-text-outline">WORKS</span>
              </h1>
              <p className="text-zinc-400 font-mono text-sm max-w-md">
                Systems architecture, high-performance web, and prototype engineering.
              </p>
            </div>
            <ThemeSwitcher />
          </header>
          
          <div className="flex flex-wrap gap-3 mt-auto">
            {enabledSocials.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="neo-button flex items-center gap-2 px-6 py-3 text-sm"
                >
                  <Icon className="h-4 w-4" />
                  {social.label}
                </a>
              );
            })}
          </div>
        </div>

        {/* Index Bento (Spans 4 cols) */}
        <div className="neo-bento-card p-8 lg:col-span-4 flex flex-col">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6 border-b border-white/10 pb-4">
            Index Focus
          </h2>
          <div className="flex flex-col gap-6 flex-1 justify-center">
            {portfolioFocuses.map((focus, i) => (
              <div key={focus.id} className="flex flex-col group cursor-default">
                <span className="text-xs font-mono text-zinc-600 mb-1">0{i+1}</span>
                <h3 className="text-2xl lg:text-3xl font-black uppercase tracking-tight group-hover:neo-accent-text transition-colors">
                  {focus.label}
                </h3>
              </div>
            ))}
          </div>
        </div>

        {/* Works Bento Grid (Archive) */}
        <div className="lg:col-span-12 mt-8">
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter neo-text-outline mb-4">
            {locale === "hu" ? "Archívum" : "Archive"}
          </h2>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`neo-button text-xs font-mono uppercase tracking-wider px-5 py-2.5 transition-all ${
                selectedCategory === "ALL"
                  ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  : "bg-black text-zinc-400 border-white/10 hover:border-white/30 hover:text-white"
              }`}
            >
              {locale === "hu" ? "Összes Projekt" : "All Projects"}
            </button>
            <button
              onClick={() => setSelectedCategory("CAR_DESIGN")}
              className={`neo-button text-xs font-mono uppercase tracking-wider px-5 py-2.5 transition-all ${
                selectedCategory === "CAR_DESIGN"
                  ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                  : "bg-black text-zinc-400 border-white/10 hover:border-cyan-500/35 hover:text-cyan-400"
              }`}
            >
              {locale === "hu" ? "3D Autótervek" : "3D Car Designs"}
            </button>
            <button
              onClick={() => setSelectedCategory("OTHER")}
              className={`neo-button text-xs font-mono uppercase tracking-wider px-5 py-2.5 transition-all ${
                selectedCategory === "OTHER"
                  ? "bg-purple-500/15 text-purple-400 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                  : "bg-black text-zinc-400 border-white/10 hover:border-purple-500/35 hover:text-purple-400"
              }`}
            >
              {locale === "hu" ? "Egyéb" : "Other"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredArticles.length === 0 ? (
              <div className="col-span-full py-16 text-center text-zinc-500 border border-dashed border-white/10 rounded-2xl">
                <p className="text-lg font-bold font-mono uppercase tracking-wider">
                  {locale === "hu" ? "Nincsenek cikkek ebben a kategóriában" : "No projects in this category"}
                </p>
                <p className="text-xs font-mono text-zinc-600 mt-1">
                  {locale === "hu" ? "Válassz másik szűrőt" : "Select another filter"}
                </p>
              </div>
            ) : (
              filteredArticles.map((article, i) => {
              const isExpanded = expandedId === article.id;
              
              return (
                <div
                  key={article.id}
                  className={`neo-bento-card p-6 flex flex-col justify-between group transition-all duration-500 cursor-pointer ${
                    isExpanded 
                      ? "col-span-full md:col-span-full xl:col-span-full h-auto border-white/30" 
                      : "h-64 hover:border-white/20"
                  }`}
                  onClick={() => {
                    if (!isExpanded) {
                      setExpandedId(article.id);
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-mono text-zinc-500">#{String(i + 1).padStart(3, "0")}</span>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-zinc-500">
                        <Calendar className="h-3 w-3" />
                        {article.date === "N/A" ? "N/A" : article.date.replace(/-/g, ".")}
                      </span>
                      {article.images.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs font-mono text-zinc-500">
                          <ImageIcon className="h-3 w-3" />
                          {article.images.length}
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider border ${
                        article.category === "CAR_DESIGN"
                          ? "bg-cyan-950/30 text-cyan-400 border-cyan-500/20"
                          : "bg-purple-950/30 text-purple-400 border-purple-500/20"
                      }`}>
                        {article.category === "CAR_DESIGN" ? "3D" : "Egyéb"}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <h3 className="text-2xl font-black uppercase tracking-tight leading-none group-hover:text-white text-zinc-200 transition-colors">
                          {article.title}
                        </h3>
                        {isExpanded && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedId(null);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition shrink-0"
                          >
                            <ChevronDown className="h-4 w-4 rotate-180 text-slate-300" />
                          </button>
                        )}
                      </div>
                      
                      {/* Description */}
                      <p className={`text-sm text-zinc-500 leading-relaxed ${isExpanded ? "mt-4 text-zinc-300 bg-white/5 p-4 rounded-xl border border-white/5" : "line-clamp-2"}`}>
                        {article.description || "Portfolio project folder synced from repository."}
                      </p>
                    </div>

                    {/* Expanded Gallery */}
                    {isExpanded && article.images.length > 0 && (
                      <div className="mt-6 border-t border-white/10 pt-5 space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">
                          Galéria
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {article.images.map((img) => {
                            const imgPath = `/api/portfolio/media/${article.folderName}/${img}`;
                            return (
                              <div
                                key={img}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveImage(imgPath);
                                }}
                                className="group relative aspect-video cursor-zoom-in overflow-hidden rounded-lg bg-zinc-900 border border-white/5 transition hover:border-white/20"
                              >
                                <Image
                                  src={imgPath}
                                  alt={img}
                                  fill
                                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 15vw"
                                  className="object-cover transition duration-350 group-hover:scale-103"
                                  unoptimized
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center">
                                  <Eye className="h-5 w-5 text-white" />
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
          <div className="lg:col-span-12 mt-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 border-b border-white/10 pb-4">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Transmission Log</h2>
              <p className="text-xs font-mono text-zinc-500 mt-2 md:mt-0">LIVE FEED // IG</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {instagramMedia.map((item) => (
                <a
                  key={item.id}
                  href={item.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="neo-bento-card aspect-square relative group"
                >
                  {(item.thumbnail_url || item.media_url) && (
                    <Image
                      src={item.thumbnail_url || item.media_url || ""}
                      alt={item.caption || "Instagram post"}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover opacity-50 group-hover:opacity-100 transition-all duration-300 grayscale group-hover:grayscale-0"
                      unoptimized
                    />
                  )}
                  <div className="absolute inset-0 border-[4px] border-transparent group-hover:border-white transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm transition-opacity duration-300 cursor-zoom-out"
        >
          <div className="relative max-h-full max-w-7xl aspect-video w-full">
            <Image
              src={activeImage}
              alt="Expanded view"
              fill
              className="object-contain rounded-lg"
              unoptimized
            />
          </div>
          <div className="absolute top-4 right-4 text-white/65 hover:text-white transition font-black uppercase tracking-widest text-xs bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
            Kattints a bezáráshoz
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to determine locale dynamically (fallback to Hungarian)
const locale = "hu";
