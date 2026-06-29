"use client";

import { useState, useEffect } from "react";
import type { InstagramMediaItem } from "@/lib/instagram";
import Image from "next/image";
import type { PortfolioArticleWithImages } from "@/lib/portfolio-sync";
import { Image as ImageIcon, Eye, ArrowUpRight, Radio, Zap, X, Calendar, ChevronDown } from "lucide-react";
import { LandingParallax } from "./landing-parallax";

interface PortfolioOnepagerProps {
  instagramMedia: InstagramMediaItem[];
  articles: PortfolioArticleWithImages[];
}

export function PortfolioOnepager({ instagramMedia, articles }: PortfolioOnepagerProps) {
  const [selectedArticle, setSelectedArticle] = useState<PortfolioArticleWithImages | null>(null);
  const [activeGallery, setActiveGallery] = useState<{
    folderName: string;
    images: string[];
    index: number;
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | "AUTOMOTIVE" | "BRICKWORKS" | "GAMES" | "MEDIA">("ALL");
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

  // Lock scroll when lightbox or detail modal is active
  useEffect(() => {
    if (activeGallery || selectedArticle) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeGallery, selectedArticle]);

  // Click or keypress to exit showroom mode
  useEffect(() => {
    if (!uiHidden) return;
    const handleExitShowroom = () => {
      setUiHidden(false);
    };
    window.addEventListener("click", handleExitShowroom);
    window.addEventListener("keydown", handleExitShowroom);
    return () => {
      window.removeEventListener("click", handleExitShowroom);
      window.removeEventListener("keydown", handleExitShowroom);
    };
  }, [uiHidden]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!activeGallery) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveGallery(null);
      } else if (e.key === "ArrowRight") {
        setActiveGallery((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            index: (prev.index + 1) % prev.images.length,
          };
        });
      } else if (e.key === "ArrowLeft") {
        setActiveGallery((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            index: (prev.index - 1 + prev.images.length) % prev.images.length,
          };
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeGallery]);

  const publicArticles = articles.filter((a) => a.visible);
  const filteredArticles = publicArticles.filter((article) => {
    const cat = article.category.toUpperCase();
    const title = article.title.toLowerCase();
    const folder = article.folderName.toLowerCase();
    
    if (selectedCategory === "ALL") return true;
    
    if (selectedCategory === "AUTOMOTIVE") {
      return cat === "CAR_DESIGN" || cat === "AUTOMOTIVE" || title.includes("mirsairen") || title.includes("hydra");
    }
    
    if (selectedCategory === "BRICKWORKS") {
      return cat === "BRICKWORKS" || title.includes("brick") || folder.includes("lego");
    }
    
    if (selectedCategory === "GAMES") {
      return cat === "GAMES" || title.includes("game") || folder.includes("godot");
    }
    
    if (selectedCategory === "MEDIA") {
      return cat === "MEDIA" || cat === "OTHER" || title.includes("poster") || title.includes("brosure") || title.includes("present");
    }
    
    return cat === selectedCategory;
  });

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div className="portfolio-shell min-h-screen text-white font-sans overflow-x-hidden selection:bg-white/20 selection:text-white">
      <LandingParallax />

      {/* ── Navigation ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 w-full border-b border-white/5 bg-black/40 backdrop-blur-md transition-all duration-700 ${
          uiHidden ? "opacity-0 -translate-y-full pointer-events-none" : "opacity-100 translate-y-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-8 md:px-20 h-16 flex items-center justify-between">
          <button
            onClick={() => {
              setSelectedCategory("ALL");
              scrollToSection("hero");
            }}
            className="font-serif text-[18px] font-semibold tracking-[0.15em] text-white hover:opacity-80 transition-opacity cursor-pointer uppercase select-none"
          >
            FLZ
          </button>
          <nav className="flex items-center gap-6 md:gap-8">
            {[
              { label: "Automotive", category: "AUTOMOTIVE" as const },
              { label: "Brickworks", category: "BRICKWORKS" as const },
              { label: "Games", category: "GAMES" as const },
              { label: "Media", category: "MEDIA" as const },
            ].map((item) => (
              <button
                key={item.category}
                onClick={() => {
                  setSelectedCategory(item.category);
                  scrollToSection("archive");
                }}
                className={`font-mono text-[9px] tracking-[0.25em] uppercase transition-all duration-350 cursor-pointer ${
                  selectedCategory === item.category
                    ? "text-white font-medium border-b border-white/30 pb-1 -mb-1"
                    : "text-white/45 hover:text-white/90"
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => scrollToSection("signals")}
              className="font-mono text-[9px] tracking-[0.25em] uppercase text-white/45 hover:text-white/90 transition-all duration-350 cursor-pointer"
            >
              Kontakt
            </button>
          </nav>
        </div>
        <div
          className="h-[1px] bg-white/25 transition-all duration-75"
          style={{ width: `${scrollProgress}%` }}
        />
      </header>

      <main
        className={`relative z-10 pb-24 transition-all duration-700 ${
          uiHidden ? "opacity-0 scale-[0.98] pointer-events-none" : "opacity-100 scale-100"
        }`}
      >
        {/* ── Running Ticker ── */}
        <div className="w-full overflow-hidden border-t border-b border-white/15 py-4 bg-white/[0.01]">
          <div className="flex whitespace-nowrap animate-marquee">
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className="font-mono text-[9px] tracking-[0.35em] text-white/25 uppercase mx-4">
                3D Automotive Design <span className="inline-block w-1 h-1 bg-white/20 rounded-full mx-3 align-middle" />
                System Architecture <span className="inline-block w-1 h-1 bg-white/20 rounded-full mx-3 align-middle" />
                High-Performance Rendering <span className="inline-block w-1 h-1 bg-white/20 rounded-full mx-3 align-middle" />
                Prototype Development <span className="inline-block w-1 h-1 bg-white/20 rounded-full mx-3 align-middle" />
                FLZ Works · 2026 <span className="inline-block w-1 h-1 bg-white/20 rounded-full mx-3 align-middle" />
                Machine Experience <span className="inline-block w-1 h-1 bg-white/20 rounded-full mx-3 align-middle" />
              </span>
            ))}
          </div>
        </div>

        {/* ── Narrative Section 1: Process ── */}
        <section className="py-40 px-8 md:px-20 max-w-3xl mx-auto text-center">
          <span className="font-mono text-[8px] tracking-[0.35em] text-white/30 uppercase mb-6 block">// 01 — Process</span>
          <h2 className="font-serif text-4xl md:text-6xl font-light leading-tight text-white mb-6">
            Where precision<br /><span className="text-white/40 italic">meets craft.</span>
          </h2>
          <p className="text-sm text-white/55 leading-relaxed max-w-lg mx-auto font-mono">
            Every project begins with a deep technical study of form, material, and motion. From initial layout to high-fidelity rendering, the workflow is engineered for absolute photorealism.
          </p>
        </section>

        {/* ── Archive ── */}
        <section id="archive" className="pt-24 max-w-7xl mx-auto px-8 md:px-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-t border-white/5 pt-16">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Radio className="h-3 w-3 text-white/30 animate-pulse" />
                <p className="font-mono text-[9px] tracking-[0.4em] text-white/40 uppercase">
                  02 — Archive
                </p>
              </div>
              <h2 className="text-5xl md:text-7xl font-semibold uppercase tracking-tighter leading-none portfolio-section-title">
                Selected <span className="italic font-light text-white/45">Works</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.length === 0 ? (
              <div className="py-24 text-center border border-dashed border-white/[0.05] rounded-2xl col-span-full">
                <p className="text-[10px] font-mono tracking-widest uppercase text-white/60">
                  No projects in this category
                </p>
              </div>
            ) : (
              filteredArticles.map((article, i) => {
                const isCar = article.category === "CAR_DESIGN";
                const firstImg = article.images.length > 0
                  ? `/api/portfolio/media/${article.folderName}/${article.images[0]}`
                  : null;

                return (
                  <article
                    key={article.id}
                    className="portfolio-archive-card group relative flex flex-col cursor-pointer rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 transition-colors"
                    onMouseMove={handleMouseMove}
                    onClick={() => setSelectedArticle(article)}
                  >
                    <div className="absolute top-4 left-4 z-10 font-mono text-[9px] tracking-widest text-white/30 group-hover:text-white/60 transition-colors">
                      #{String(i + 1).padStart(3, "0")}
                    </div>

                    <div className="relative w-full overflow-hidden bg-neutral-950/40 border-b border-white/5">
                      {firstImg ? (
                        <div className="relative aspect-[4/3] w-full overflow-hidden">
                          <Image
                            src={firstImg}
                            alt={article.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 30vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="relative aspect-[4/3] w-full flex items-center justify-center bg-neutral-900 text-white/10 font-mono text-[10px] tracking-widest uppercase">
                          No Media
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <div className="p-6 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className={`text-[8px] font-mono tracking-[0.2em] px-2 py-0.5 rounded border ${
                          isCar
                            ? "text-white/70 border-white/[0.1] bg-transparent"
                            : "text-white/50 border-white/[0.05] bg-transparent"
                        }`}>
                          {isCar ? "3D Auto" : "Design"}
                        </span>
                      </div>

                      <h3 className="font-serif text-xl font-medium text-white/90 group-hover:text-white transition-colors">
                        {article.title}
                      </h3>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        {/* ── Narrative Section 2: Interface ── */}
        <section className="py-40 px-8 md:px-20 max-w-3xl mx-auto text-center">
          <span className="font-mono text-[8px] tracking-[0.35em] text-white/30 uppercase mb-6 block">// 03 — Interface</span>
          <h2 className="font-serif text-4xl md:text-6xl font-light leading-tight text-white mb-6">
            Systems built<br /><span className="text-white/40 italic">to feel.</span>
          </h2>
          <p className="text-sm text-white/55 leading-relaxed max-w-lg mx-auto font-mono">
            Every interface choice is rooted in physics and kinetics. The user interface is designed to carry weight, inertia, and memory — behaving like physical hardware rather than a flat digital screen.
          </p>
        </section>

        {/* ── Identity Strip ── */}
        <section className="py-24 max-w-7xl mx-auto px-8 md:px-20 border-t border-b border-white/5 my-20 flex flex-col md:flex-row items-start gap-12 md:gap-20">
          <div className="font-serif text-8xl md:text-9xl font-light italic text-white/10 leading-none select-none">
            F
          </div>
          <div className="space-y-6 max-w-2xl">
            <h3 className="font-serif text-3xl md:text-4xl font-normal text-white">
              FLZ · Studio
            </h3>
            <p className="text-sm text-white/55 font-mono leading-relaxed">
              An independent creative coding and design studio. We specialize in photorealistic 3D automotive design, system architecture, high-performance web rendering, and prototype development. High fidelity in every layer.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {["Blender", "Godot", "Three.js", "Next.js", "TypeScript", "Figma", "3D Automotive", "System Architecture", "Shaders"].map((tag) => (
                <span key={tag} className="font-mono text-[9px] tracking-wider uppercase px-3 py-1 border border-white/10 rounded-md text-white/50 hover:text-white hover:border-white/25 transition-colors">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Instagram Signals ── */}
        {instagramMedia.length > 0 && (
          <section id="signals" className="mt-28 pt-16 border-t border-white/[0.05] max-w-7xl mx-auto px-8 md:px-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-3 w-3 text-white/40 animate-pulse" />
                  <p className="text-[9px] font-mono tracking-[0.4em] text-white/30 uppercase">
                    Signals
                  </p>
                </div>
                <h2 className="text-4xl md:text-6xl font-semibold font-serif uppercase tracking-tighter leading-none text-white/85">
                  Works & <span className="portfolio-text-glow">Log</span>
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
        <footer className="mt-28 pt-8 border-t border-white/[0.04] overflow-hidden max-w-7xl mx-auto px-8 md:px-20">
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
        </footer>
      </main>

      {/* ── Immersive Project Detail Modal ── */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-3xl p-4 md:p-10 overflow-y-auto animate-fadeIn"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="relative w-full max-w-5xl bg-neutral-950/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 scale-100 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
              <div>
                <span className="text-[9px] font-mono tracking-widest uppercase text-white/40">
                  {selectedArticle.category === "CAR_DESIGN" ? "3D Automotive" : "Design & Dev"}
                </span>
                <h3 className="font-serif text-2xl md:text-3xl font-semibold text-white mt-1">
                  {selectedArticle.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Description */}
              <div className="max-w-3xl">
                <p className="text-sm md:text-base text-white/70 leading-relaxed font-mono">
                  {selectedArticle.description || "Project description and technical specifications."}
                </p>
              </div>

              {/* Media Grid */}
              {selectedArticle.images.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-[9px] font-mono tracking-widest uppercase text-white/30 flex items-center gap-2">
                    <ImageIcon className="h-3 w-3" />
                    Project Media ({selectedArticle.images.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedArticle.images.map((img, idx) => {
                      const imgPath = `/api/portfolio/media/${selectedArticle.folderName}/${img}`;
                      return (
                        <div
                          key={img}
                          onClick={() => {
                            setActiveGallery({
                              folderName: selectedArticle.folderName,
                              images: selectedArticle.images,
                              index: idx,
                            });
                          }}
                          className="relative aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/30 cursor-zoom-in transition-all duration-300 group"
                        >
                          <Image
                            src={imgPath}
                            alt={img}
                            fill
                            sizes="(max-width: 768px) 50vw, 30vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            unoptimized
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox ── */}
      {activeGallery && (
        <div
          onClick={() => setActiveGallery(null)}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/98 p-4 md:p-10 backdrop-blur-3xl cursor-zoom-out animate-fadeIn"
        >
          {/* Main Image Viewport */}
          <div
            className="relative w-full max-w-6xl aspect-video rounded-2xl overflow-hidden border border-white/[0.08] bg-black/50 shadow-2xl transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={`/api/portfolio/media/${activeGallery.folderName}/${activeGallery.images[activeGallery.index]}`}
              alt="Expanded view"
              fill
              className="object-contain animate-scaleIn"
              unoptimized
            />
          </div>

          {/* Navigation Overlay Elements */}
          {activeGallery.images.length > 1 && (
            <>
              <button
                className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.18] text-white flex items-center justify-center cursor-pointer transition-all duration-250 z-55"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveGallery((prev) =>
                    prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : null
                  );
                }}
                aria-label="Previous image"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <button
                className="absolute right-6 md:left-auto md:right-10 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.18] text-white flex items-center justify-center cursor-pointer transition-all duration-250 z-55"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveGallery((prev) =>
                    prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : null
                  );
                }}
                aria-label="Next image"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}

          {/* Top HUD Bar */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none z-55">
            <span className="text-[10px] font-mono text-white/40 tracking-wider">
              {activeGallery.images[activeGallery.index]}
            </span>
            <button
              onClick={() => setActiveGallery(null)}
              className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.18] text-[9px] font-black uppercase tracking-widest text-white/70 hover:text-white transition-all cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          {/* Bottom Index indicator */}
          <div className="absolute bottom-6 text-[10px] font-mono text-white/50 tracking-widest bg-black/40 px-3 py-1.5 rounded-full border border-white/[0.04]">
            {activeGallery.index + 1} / {activeGallery.images.length}
          </div>
        </div>
      )}
    </div>
  );
}
