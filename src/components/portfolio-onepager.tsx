"use client";

import { useState, useEffect } from "react";
import type { InstagramMediaItem } from "@/lib/instagram";
import Image from "next/image";
import type { PortfolioArticleWithImages } from "@/lib/portfolio-sync";
import { Image as ImageIcon, ArrowUpRight, X, Zap } from "lucide-react";
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
  const [activeSection, setActiveSection] = useState("hero");

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

  // IntersectionObserver for scroll reveals
  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [selectedCategory]); // re-run when category changes (re-renders grid)

  // IntersectionObserver to set active section for side scroll dots
  useEffect(() => {
    const sections = ["hero", "process", "archive", "signals"];
    const observers = sections.map(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        });
      }, { threshold: 0.2 });
      observer.observe(el);
      return { observer, el, id };
    });
    return () => {
      observers.forEach(obs => {
        if (obs) obs.observer.unobserve(obs.el);
      });
    };
  }, []);

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

      {/* ── Floating Pill Nav ── */}
      <nav className={`nav ${uiHidden ? "opacity-0 -translate-y-full pointer-events-none" : "opacity-100 translate-y-0"}`}>
        <span className="nav-logo" onClick={() => scrollToSection("hero")} style={{ cursor: "pointer" }}>FLZ</span>
        <button onClick={() => scrollToSection("hero")} className={`nav-link ${activeSection === "hero" ? "active" : ""}`}>Home</button>
        <button onClick={() => scrollToSection("archive")} className={`nav-link ${activeSection === "archive" ? "active" : ""}`}>Archive</button>
        <button onClick={() => scrollToSection("process")} className={`nav-link ${activeSection === "process" ? "active" : ""}`}>Process</button>
        <button onClick={() => scrollToSection("signals")} className={`nav-link ${activeSection === "signals" ? "active" : ""}`}>Contact</button>
      </nav>

      <main className={`relative z-10 pb-24 transition-all duration-700 ${uiHidden ? "opacity-0 scale-[0.98] pointer-events-none" : "opacity-100 scale-100"}`}>
        
        {/* ── Hero Section ── */}
        <section id="hero" className="hero">
          {/* Wireframe car SVG */}
          <div style={{ position: "absolute", inset: 0, zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ width: "70%", maxWidth: "900px", aspectRatio: "16/7", background: "radial-gradient(ellipse 60% 50% at 50% 55%, rgba(255,255,255,0.04) 0%, transparent 70%)", borderRadius: "4px", position: "relative", overflow: "hidden" }}>
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06 }} viewBox="0 0 800 300" fill="none">
                <line x1="0" y1="200" x2="800" y2="200" stroke="white" strokeWidth="0.5"/>
                <line x1="0" y1="220" x2="800" y2="220" stroke="white" strokeWidth="0.3"/>
                <line x1="100" y1="0" x2="100" y2="300" stroke="white" strokeWidth="0.3"/>
                <line x1="400" y1="0" x2="400" y2="300" stroke="white" strokeWidth="0.3"/>
                <line x1="700" y1="0" x2="700" y2="300" stroke="white" strokeWidth="0.3"/>
                <ellipse cx="200" cy="220" rx="60" ry="18" stroke="white" strokeWidth="0.5"/>
                <ellipse cx="600" cy="220" rx="60" ry="18" stroke="white" strokeWidth="0.5"/>
                <path d="M 120 200 Q 200 120 300 110 L 500 110 Q 600 115 680 200" stroke="white" strokeWidth="0.8" fill="none"/>
                <text x="400" y="80" textAnchor="middle" fill="white" fontFamily="var(--font-mono), monospace" fontSize="8" letterSpacing="4" opacity="0.35">3D AUTOMOTIVE DESIGN</text>
              </svg>
            </div>
          </div>

          <div className="hero-vignette" />

          {/* Side scroll track */}
          <div className="hero-scroll-track">
            <div className={`hero-scroll-dot ${activeSection === "hero" ? "active" : ""}`} onClick={() => scrollToSection("hero")} style={{ cursor: "pointer" }} />
            <div className={`hero-scroll-dot ${activeSection === "process" ? "active" : ""}`} onClick={() => scrollToSection("process")} style={{ cursor: "pointer" }} />
            <div className={`hero-scroll-dot ${activeSection === "archive" ? "active" : ""}`} onClick={() => scrollToSection("archive")} style={{ cursor: "pointer" }} />
            <div className={`hero-scroll-dot ${activeSection === "signals" ? "active" : ""}`} onClick={() => scrollToSection("signals")} style={{ cursor: "pointer" }} />
            <div className="hero-scroll-line" />
          </div>

          <div className="hero-content">
            <div className="hero-eyebrow">Portfolio — Design & Engineering · 2026</div>

            <div className="hero-wordmark">
              <span className="hero-wordmark-line1">FLZ</span>
              <span className="hero-wordmark-line2">Works</span>
            </div>

            <div className="hero-meta">
              <p className="hero-tagline">Photorealistic automotive design, system architecture & high-performance web rendering.</p>
              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="hero-stat-num">12</span>
                  <span className="hero-stat-label">Projects</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-num">5+</span>
                  <span className="hero-stat-label">Years</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-num">∞</span>
                  <span className="hero-stat-label">Precision</span>
                </div>
              </div>
            </div>

            <div className="hero-cta">
              <button onClick={() => scrollToSection("archive")} className="hero-btn hero-btn-primary">View Archive</button>
              <button onClick={() => scrollToSection("process")} className="hero-btn hero-btn-ghost">Scroll to Explore</button>
              <div className="hero-scroll-hint">
                <div className="hero-scroll-hint-line" />
                ↓ scroll to begin
              </div>
            </div>
          </div>
        </section>

        {/* ── Running Ticker ── */}
        <div className="ticker-wrap">
          <div className="ticker-inner">
            {Array.from({ length: 4 }).map((_, idx) => (
              <span key={idx} className="flex items-center">
                <span className="ticker-item">3D Automotive Design<span className="ticker-dot" /></span>
                <span className="ticker-item">System Architecture<span className="ticker-dot" /></span>
                <span className="ticker-item">High-Performance Rendering<span className="ticker-dot" /></span>
                <span className="ticker-item">Prototype Development<span className="ticker-dot" /></span>
                <span className="ticker-item">FLZ Works · 2026<span className="ticker-dot" /></span>
                <span className="ticker-item">Machine Experience<span className="ticker-dot" /></span>
              </span>
            ))}
          </div>
        </div>

        {/* ── Narrative Section 1: Process ── */}
        <section id="process" className="narrative-section reveal">
          <div className="narrative-visual">
            <div className="narrative-img-placeholder fill-1 card-art" style={{ aspectRatio: "4/3" }}>
              <svg width="100%" height="100%" viewBox="0 0 600 450" fill="none">
                <rect width="600" height="450" fill="#0a0a0a"/>
                <circle cx="300" cy="225" r="120" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                <circle cx="300" cy="225" r="80" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
                <line x1="180" y1="225" x2="420" y2="225" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
                <line x1="300" y1="105" x2="300" y2="345" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
                <text x="300" y="235" textAnchor="middle" fill="rgba(255,255,255,0.12)" fontFamily="var(--font-mono), monospace" fontSize="10" letterSpacing="4">DESIGN SYSTEM</text>
                <text x="300" y="260" textAnchor="middle" fill="rgba(255,255,255,0.06)" fontFamily="var(--font-mono), monospace" fontSize="7" letterSpacing="3">PRECISION ENGINEERING</text>
              </svg>
            </div>
            <div className="narrative-visual-tag">3D Auto · 2026</div>
          </div>
          <div className="narrative-text">
            <div className="narrative-label">{"// 01 — Process"}</div>
            <h2 className="narrative-title">Where precision<br /><em>meets craft.</em></h2>
            <p className="narrative-body">Every project begins with a deep technical study of form, material, and motion. From clay model to rendered render, the workflow is engineered for maximum photorealism.</p>
            <span onClick={() => scrollToSection("archive")} className="narrative-link">Explore the process</span>
          </div>
        </section>

        {/* ── Archive ── */}
        <section id="archive" className="pt-24 max-w-7xl mx-auto px-8 md:px-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-t border-white/5 pt-16">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" />
                <p className="font-mono text-[9px] tracking-[0.4em] text-white/40 uppercase">
                  02 — Archive
                </p>
              </div>
              <h2 className="text-5xl md:text-7xl font-semibold uppercase tracking-tighter leading-none">
                Selected <span className="italic font-light text-white/45">Works</span>
              </h2>
            </div>

            {/* Simple monochrome filter pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "All", category: "ALL" as const },
                { label: "3D Auto", category: "AUTOMOTIVE" as const },
                { label: "Brickworks", category: "BRICKWORKS" as const },
                { label: "Games", category: "GAMES" as const },
                { label: "Media", category: "MEDIA" as const },
              ].map((item) => (
                <button
                  key={item.category}
                  onClick={() => setSelectedCategory(item.category)}
                  className={`font-mono text-[9px] tracking-wider uppercase px-3 py-1.5 rounded border transition-all cursor-pointer ${
                    selectedCategory === item.category
                      ? "bg-white/10 text-white border-white/20"
                      : "text-white/45 border-transparent hover:text-white hover:border-white/10"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-white/[0.05] rounded-2xl">
              <p className="text-[10px] font-mono tracking-widest uppercase text-white/60">
                No projects in this category
              </p>
            </div>
          ) : (
            <div className="masonry-grid">
              {filteredArticles.map((article, i) => {
                const sizeClass = i % 3 === 0 ? "masonry-tall" : i % 3 === 1 ? "masonry-wide" : "masonry-square";
                const fillClass = `fill-${(i % 5) + 1}`;
                const firstImg = article.images.length > 0
                  ? `/api/portfolio/media/${article.folderName}/${article.images[0]}`
                  : null;

                const wireframeSVGs = [
                  <svg key="svg1" width="100%" height="100%" viewBox="0 0 400 530" fill="none" className="w-full h-full">
                    <rect width="400" height="530" fill="#0d0d0d"/>
                    <path d="M 60 380 Q 200 280 340 370" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" fill="none"/>
                    <ellipse cx="110" cy="390" rx="45" ry="14" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
                    <ellipse cx="290" cy="390" rx="45" ry="14" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
                    <text x="200" y="200" textAnchor="middle" fill="rgba(255,255,255,0.08)" fontFamily="var(--font-mono), monospace" fontSize="9" letterSpacing="3">MIRSAIREN</text>
                  </svg>,
                  <svg key="svg2" width="100%" height="100%" viewBox="0 0 400 225" fill="none" className="w-full h-full">
                    <rect width="400" height="225" fill="#0f0d0d"/>
                    <path d="M 20 160 L 80 120 Q 200 90 320 120 L 380 160" stroke="rgba(255,255,255,0.07)" strokeWidth="1" fill="none"/>
                    <text x="200" y="120" text-anchor="middle" fill="rgba(255,255,255,0.07)" fontFamily="var(--font-mono), monospace" fontSize="8" letterSpacing="4">HYDRA GTR</text>
                  </svg>,
                  <svg key="svg3" width="100%" height="100%" viewBox="0 0 300 300" fill="none" className="w-full h-full">
                    <rect width="300" height="300" fill="#080c10"/>
                    <rect x="60" y="60" width="180" height="180" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none"/>
                    <rect x="90" y="90" width="120" height="120" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" fill="none"/>
                    <text x="150" y="158" text-anchor="middle" fill="rgba(255,255,255,0.09)" fontFamily="var(--font-mono), monospace" fontSize="8" letterSpacing="2">SYSTEM UI</text>
                  </svg>,
                  <svg key="svg4" width="100%" height="100%" viewBox="0 0 400 225" fill="none" className="w-full h-full">
                    <rect width="400" height="225" fill="#0c0c0c"/>
                    <path d="M 60 165 Q 200 95 340 155" stroke="rgba(255,255,255,0.06)" strokeWidth="1.2" fill="none"/>
                    <ellipse cx="130" cy="175" rx="40" ry="12" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8"/>
                    <ellipse cx="270" cy="175" rx="40" ry="12" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8"/>
                    <text x="200" y="110" text-anchor="middle" fill="rgba(255,255,255,0.07)" fontFamily="var(--font-mono), monospace" fontSize="7" letterSpacing="4">ATHAAN V2</text>
                  </svg>,
                  <svg key="svg5" width="100%" height="100%" viewBox="0 0 400 530" fill="none" className="w-full h-full">
                    <rect width="400" height="530" fill="#0a0c0a"/>
                    <circle cx="200" cy="265" r="100" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                    <path d="M 100 265 L 300 265" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
                    <path d="M 200 165 L 200 365" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
                    <text x="200" y="273" text-anchor="middle" fill="rgba(255,255,255,0.09)" fontFamily="var(--font-mono), monospace" fontSize="9" letterSpacing="3">GODOT</text>
                  </svg>,
                  <svg key="svg6" width="100%" height="100%" viewBox="0 0 300 300" fill="none" className="w-full h-full">
                    <rect width="300" height="300" fill="#0a0a0a"/>
                    <line x1="0" y1="100" x2="300" y2="100" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
                    <line x1="0" y1="200" x2="300" y2="200" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
                    <line x1="100" y1="0" x2="100" y2="300" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
                    <line x1="200" y1="0" x2="200" y2="300" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
                    <text x="150" y="158" text-anchor="middle" fill="rgba(255,255,255,0.09)" fontFamily="var(--font-mono), monospace" fontSize="8" letterSpacing="2">WEB ARCH</text>
                  </svg>
                ];

                return (
                  <div
                    key={article.id}
                    className={`masonry-card ${sizeClass}`}
                    onMouseMove={handleMouseMove}
                    onClick={() => setSelectedArticle(article)}
                  >
                    <div className="masonry-card-index">#{String(i + 1).padStart(3, "0")}</div>
                    
                    <div className="relative w-full overflow-hidden bg-neutral-950/45 masonry-card-img-wrap">
                      {firstImg ? (
                        <Image
                          src={firstImg}
                          alt={article.title}
                          fill
                          className="masonry-card-img object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          unoptimized
                        />
                      ) : (
                        <div className={`masonry-img-placeholder ${fillClass} card-art w-full h-full`}>
                          {wireframeSVGs[i % wireframeSVGs.length]}
                        </div>
                      )}
                      <div className="masonry-card-overlay" />
                    </div>

                    <div className="masonry-card-meta">
                      <div className="masonry-card-title">{article.title}</div>
                      <div className="masonry-card-sub">
                        {article.category === "CAR_DESIGN" ? "3D Auto" : "Design & Dev"} · 2026
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Narrative Section 2: Interface ── */}
        <section id="interface" className="narrative-section reverse reveal">
          <div className="narrative-visual">
            <div className="narrative-img-placeholder fill-3 card-art" style={{ aspectRatio: "4/3" }}>
              <svg width="100%" height="100%" viewBox="0 0 600 450" fill="none">
                <rect width="600" height="450" fill="#080c10"/>
                <rect x="50" y="50" width="500" height="350" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" fill="none"/>
                <rect x="80" y="80" width="200" height="120" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" fill="rgba(255,255,255,0.01)"/>
                <rect x="320" y="80" width="200" height="80" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" fill="rgba(255,255,255,0.01)"/>
                <rect x="80" y="240" width="440" height="120" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" fill="rgba(255,255,255,0.01)"/>
                <text x="300" y="230" textAnchor="middle" fill="rgba(255,255,255,0.08)" fontFamily="var(--font-mono), monospace" fontSize="8" letterSpacing="3">INTERFACE ARCHITECTURE</text>
              </svg>
            </div>
            <div className="narrative-visual-tag">UI/UX · Figma</div>
          </div>
          <div className="narrative-text">
            <div className="narrative-label">{"// 03 — Interface"}</div>
            <h2 className="narrative-title">Systems built<br /><em>to feel.</em></h2>
            <p className="narrative-body">Every UI decision is rooted in physics and perception. The interface should feel like it has weight, momentum, and memory — not just look like it does.</p>
            <span onClick={() => scrollToSection("archive")} className="narrative-link">See the design system</span>
          </div>
        </section>

        {/* ── Identity Strip ── */}
        <section className="identity-strip reveal">
          <div className="identity-mark">F</div>
          <div className="identity-info">
            <div className="identity-name">FLZ · Studio</div>
            <p className="identity-bio">An independent design and engineering studio specializing in photorealistic 3D automotive design, system architecture, and high-performance rendering. Precision in every layer.</p>
            <div className="identity-skills">
              {["Blender", "Godot", "Three.js", "Next.js", "TypeScript", "Figma", "3D Automotive", "System Architecture"].map((tag) => (
                <span key={tag} className="identity-skill">
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
                  Works & <span className="italic font-light text-white/45">Log</span>
                </h2>
              </div>
              <p className="text-[9px] font-mono text-white/40 mt-3 md:mt-0 uppercase tracking-widest border border-white/[0.05] px-4 py-2 rounded-xl">
                @flzworks
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {instagramMedia.slice(0, 10).map((item) => (
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
        <footer className="footer">
          <div>
            <div className="footer-brand">FLZ</div>
            <div className="footer-meta">Design & Engineering · 2026</div>
          </div>
          <div className="footer-links">
            <button onClick={() => scrollToSection("hero")} className="footer-link text-left">Home</button>
            <button onClick={() => scrollToSection("archive")} className="footer-link text-left">Archive</button>
            <button onClick={() => scrollToSection("process")} className="footer-link text-left">Process</button>
            <span className="footer-link">Instagram</span>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "8px", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.15)", paddingTop: "8px", maxWidth: "200px", lineHeight: 1.8 }}>
            Photorealistic 3D Automotive Design · System Architecture · High-Performance Web Rendering
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
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, 33vw"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition duration-300" />
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
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-2xl animate-fadeIn"
          onClick={() => setActiveGallery(null)}
        >
          <button
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-10"
            onClick={() => setActiveGallery(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <button
            className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-10"
            onClick={(e) => {
              e.stopPropagation();
              setActiveGallery((prev) => prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : null);
            }}
          >
            ←
          </button>
          <button
            className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-10"
            onClick={(e) => {
              e.stopPropagation();
              setActiveGallery((prev) => prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : null);
            }}
          >
            →
          </button>
          <div
            className="relative max-w-5xl w-full max-h-[85vh] mx-6"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={`/api/portfolio/media/${activeGallery.folderName}/${activeGallery.images[activeGallery.index]}`}
              alt={activeGallery.images[activeGallery.index]}
              fill
              className="object-contain"
              sizes="100vw"
              unoptimized
            />
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] text-white/50 tracking-widest">
            {activeGallery.index + 1} / {activeGallery.images.length}
          </div>
        </div>
      )}
    </div>
  );
}