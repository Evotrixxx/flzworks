"use client";

import { useState, useEffect } from "react";
import type { InstagramMediaItem } from "@/lib/instagram";
import Image from "next/image";
import type { PortfolioArticleWithImages } from "@/lib/portfolio-sync";
import { Image as ImageIcon, X } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  CAR_DESIGN: "Automotive",
  BRICKWORKS: "Brickworks",
  GAMES: "Games",
  MEDIA: "Media",
  OTHER: "Other",
};

type ArchiveCategory = "ALL" | "AUTOMOTIVE" | "BRICKWORKS" | "GAMES" | "MEDIA";

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
  const [activeSection, setActiveSection] = useState("hero");
  const [selectedCategory, setSelectedCategory] = useState<ArchiveCategory>("ALL");

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

  // IntersectionObserver to set active section for top bar highlights
  useEffect(() => {
    const sections = ["hero", "filmstrip", "transmissions", "contact"];
    const observers = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { threshold: 0.2 }
      );
      observer.observe(el);
      return { observer, el, id };
    });
    return () => {
      observers.forEach((obs) => {
        if (obs) obs.observer.unobserve(obs.el);
      });
    };
  }, []);

  const publicArticles = articles.filter((a) => a.visible);
  const filteredArticles = publicArticles.filter((article) => {
    if (selectedCategory === "ALL") return true;
    if (selectedCategory === "AUTOMOTIVE") return article.category === "CAR_DESIGN";
    return article.category === selectedCategory;
  });

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bp-root min-h-screen selection:bg-[#ffd166]/20 selection:text-[#ffd166]">
      {/* Header */}
      <header className="bp-topbar">
        <button className="bp-logo" onClick={() => scrollToSection("hero")}>
          FLZ.WORKS
        </button>
        <nav className="bp-nav">
          <button
            className={`bp-nav-item ${activeSection === "hero" ? "is-active" : ""}`}
            onClick={() => scrollToSection("hero")}
          >
            <span className="bp-nav-key">[F]</span> FEATURED
          </button>
          <button
            className={`bp-nav-item ${activeSection === "filmstrip" ? "is-active" : ""}`}
            onClick={() => {
              setSelectedCategory("AUTOMOTIVE");
              scrollToSection("filmstrip");
            }}
          >
            <span className="bp-nav-key">[A]</span> AUTOMOTIVE
          </button>
          <button
            className={`bp-nav-item ${activeSection === "transmissions" ? "is-active" : ""}`}
            onClick={() => scrollToSection("transmissions")}
          >
            <span className="bp-nav-key">[S]</span> SOCIAL
          </button>
          <button
            className={`bp-nav-item ${activeSection === "contact" ? "is-active" : ""}`}
            onClick={() => scrollToSection("contact")}
          >
            <span className="bp-nav-key">[C]</span> CONTACT
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="hero" className="bp-hero">
        <div className="bp-hero-media">
          <iframe
            className="bp-hero-iframe"
            title="Pentagon Athaan 2026"
            src="https://sketchfab.com/models/cbb1b3572d0545f8a8fdbdb09836ebd6/embed?autostart=1&preload=1&transparent=1&ui_hint=0"
            allow="autoplay; fullscreen; xr-spatial-tracking"
            loading="lazy"
          />
        </div>
        <div className="bp-hero-title">
          <div className="bp-hero-eyebrow">DWG NO. FLZ-2026-001 · LIVE MODEL — DRAG TO ORBIT</div>
          <h1 className="bp-hero-headline">
            DRAWN, MODELED, RENDERED<span className="bp-accent">.</span>
          </h1>
        </div>
        <div className="bp-hero-stats">
          <span className="bp-chip">{publicArticles.length} SHEETS</span>
          <span className="bp-chip bp-chip-accent">5+ YRS</span>
        </div>
      </section>

      {/* Sheet Index (Filmstrip) */}
      <section id="filmstrip" className="bp-filmstrip">
        {/* Floating MORE button — scrolls page down to next section */}
        <button
          className="bp-filmstrip-more"
          onClick={() => scrollToSection("transmissions")}
          aria-label="Scroll to next section"
        >
          <span>MORE</span>
          <span className="bp-filmstrip-more-arrow">↓</span>
        </button>
        <div className="bp-filmstrip-head">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="bp-section-label bp-accent">■ LOG</span>
            <div className="flex gap-2 font-mono text-[9px] tracking-wider uppercase">
              <button
                onClick={() => setSelectedCategory("ALL")}
                className={`px-2 py-0.5 border border-[#dce7f5]/20 hover:border-[#dce7f5]/50 transition-colors ${
                  selectedCategory === "ALL" ? "text-[#ffd166] border-[#ffd166]" : "text-[#dce7f5]/60"
                }`}
              >
                [ALL]
              </button>
              <button
                onClick={() => setSelectedCategory("AUTOMOTIVE")}
                className={`px-2 py-0.5 border border-[#dce7f5]/20 hover:border-[#dce7f5]/50 transition-colors ${
                  selectedCategory === "AUTOMOTIVE" ? "text-[#ffd166] border-[#ffd166]" : "text-[#dce7f5]/60"
                }`}
              >
                [AUTOMOTIVE]
              </button>
            </div>
          </div>
          <span className="bp-scroll-hint">SCROLL →</span>
        </div>

        <div className="bp-filmstrip-track">
          {filteredArticles.map((article) => {
            const d = new Date(article.createdAt);
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            const sheetId = `X${mm}${dd}`;
            const firstImg =
              article.images.length > 0
                ? `/api/portfolio/media/${article.folderName}/${article.images[0]}?w=640`
                : null;

            return (
              <button
                key={article.id}
                className="bp-sheet"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="bp-sheet-img">
                  {firstImg ? (
                    <Image
                      src={firstImg}
                      alt={article.title}
                      fill
                      className="bp-sheet-img-el object-cover"
                      sizes="250px"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#dce7f5]/5 text-[#dce7f5]/30 text-[9px]">
                      NO IMAGE
                    </div>
                  )}
                </div>
                <div className="bp-sheet-caption">
                  {sheetId} — {article.title.toUpperCase()}
                </div>
              </button>
            );
          })}
          {filteredArticles.length === 0 && (
            <div className="py-12 text-[#dce7f5]/50 text-[10px] uppercase tracking-widest pl-8">
              No sheets in this category
            </div>
          )}

          {/* Mobile: Social cards appended inline in the same filmstrip */}
          <div className="bp-sheet bp-sheet-social-mobile">
            <div className="bp-sheet-img bp-sheet-social-body">
              <a
                href="https://x.com/flzworks"
                target="_blank"
                rel="noopener noreferrer"
                className="bp-sheet-social-link"
              >
                X ↗
              </a>
            </div>
            <div className="bp-sheet-caption">X — @FLZWORKS</div>
          </div>
          <div className="bp-sheet bp-sheet-social-mobile">
            <div className="bp-sheet-img bp-sheet-social-body">
              <a
                href="https://instagram.com/flzworks"
                target="_blank"
                rel="noopener noreferrer"
                className="bp-sheet-social-link"
              >
                IG ↗
              </a>
            </div>
            <div className="bp-sheet-caption">IG — @FLZWORKS</div>
          </div>
          <div className="bp-sheet bp-sheet-social-mobile">
            <div className="bp-sheet-img bp-sheet-social-body">
              <a
                href="https://tiktok.com/@flzworks"
                target="_blank"
                rel="noopener noreferrer"
                className="bp-sheet-social-link"
              >
                TT ↗
              </a>
            </div>
            <div className="bp-sheet-caption">TIKTOK — @FLZWORKS</div>
          </div>
          <div className="bp-sheet bp-sheet-social-mobile">
            <div className="bp-sheet-img bp-sheet-social-body">
              <a
                href="https://linkedin.com/in/benceflosz"
                target="_blank"
                rel="noopener noreferrer"
                className="bp-sheet-social-link"
              >
                LI ↗
              </a>
            </div>
            <div className="bp-sheet-caption">LINKEDIN</div>
          </div>
        </div>
      </section>

      {/* Transmissions — hidden on mobile, shown via filmstrip social cards instead */}
      <section id="transmissions" className="bp-transmissions bp-transmissions-desktop">
        <div className="bp-section-label bp-accent">■ TRANSMISSIONS — X / IG / TIKTOK / LINKEDIN</div>
        <div className="bp-transmissions-grid">
          {/* X */}
          <div className="bp-transmission">
            <div className="bp-transmission-label">X — @FLZWORKS</div>
            <a
              href="https://x.com/flzworks"
              target="_blank"
              rel="noopener noreferrer"
              className="bp-transmission-placeholder hover:text-[#ffd166] hover:border-[#ffd166] transition-colors"
            >
              X.COM/FLZWORKS ↗
            </a>
          </div>

          {/* Instagram */}
          <div className="bp-transmission">
            <div className="bp-transmission-label">IG — @FLZWORKS</div>
            {instagramMedia.length > 0 ? (
              <div className="grid grid-cols-2 gap-1.5 aspect-video w-full">
                {instagramMedia.slice(0, 4).map((item) => (
                  <a
                    key={item.id}
                    href={item.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block w-full h-full overflow-hidden border border-[#dce7f5]/15 hover:border-[#dce7f5]/40"
                  >
                    {(item.thumbnail_url || item.media_url) && (
                      <Image
                        src={item.thumbnail_url || item.media_url || ""}
                        alt={item.caption || "Instagram post"}
                        fill
                        className="object-cover opacity-80 hover:opacity-100 transition-opacity"
                        sizes="100px"
                        unoptimized
                      />
                    )}
                  </a>
                ))}
              </div>
            ) : (
              <a
                href="https://instagram.com/flzworks"
                target="_blank"
                rel="noopener noreferrer"
                className="bp-transmission-placeholder hover:text-[#ffd166] hover:border-[#ffd166] transition-colors"
              >
                INSTAGRAM.COM/FLZWORKS ↗
              </a>
            )}
          </div>

          {/* TikTok */}
          <div className="bp-transmission">
            <div className="bp-transmission-label">TIKTOK — @FLZWORKS</div>
            <a
              href="https://tiktok.com/@flzworks"
              target="_blank"
              rel="noopener noreferrer"
              className="bp-transmission-placeholder hover:text-[#ffd166] hover:border-[#ffd166] transition-colors"
            >
              TIKTOK.COM/@FLZWORKS ↗
            </a>
          </div>

          {/* LinkedIn */}
          <div className="bp-transmission">
            <div className="bp-transmission-label">LINKEDIN</div>
            <a
              href="https://linkedin.com/in/benceflosz"
              target="_blank"
              rel="noopener noreferrer"
              className="bp-transmission-placeholder hover:text-[#ffd166] hover:border-[#ffd166] transition-colors"
            >
              LINKEDIN PROFILE ↗
            </a>
          </div>
        </div>
      </section>

      {/* Footer / Titleblock */}
      <footer id="contact" className="bp-titleblock">
        <div className="bp-titleblock-cell">
          <div className="bp-titleblock-label">DRAWN BY</div>
          <div className="bp-titleblock-value">B. FLOSZ</div>
        </div>
        <div className="bp-titleblock-cell">
          <div className="bp-titleblock-label">STUDIO</div>
          <div className="bp-titleblock-value">FLZ WORKS</div>
        </div>
        <div className="bp-titleblock-cell">
          <div className="bp-titleblock-label">DATE</div>
          <div className="bp-titleblock-value">2026</div>
        </div>
        <div className="bp-titleblock-cell">
          <div className="bp-titleblock-label">CONTACT</div>
          <div className="bp-titleblock-value bp-accent">
            <a className="bp-titleblock-link" href="mailto:floszbeni@gmail.com">
              FLOSZBENI@GMAIL.COM ↗
            </a>
          </div>
        </div>
      </footer>

      {/* Immersive Project Detail Modal */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bp-modal-overlay p-4 md:p-10 overflow-y-auto animate-fadeIn"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="relative w-full max-w-5xl bp-modal-card rounded-none overflow-hidden shadow-2xl transition-all duration-500 scale-100 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between bp-modal-header">
              <div>
                <span className="text-[9px] font-mono tracking-widest uppercase bp-accent">
                  {CATEGORY_LABELS[selectedArticle.category] || "Other"}
                </span>
                <h3 className="font-sans text-xl md:text-2xl font-bold mt-1 uppercase tracking-tight">
                  {selectedArticle.title}
                </h3>
              </div>
              <button
                aria-label="Close details"
                onClick={() => setSelectedArticle(null)}
                className="w-11 h-11 flex items-center justify-center bp-modal-close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bp-modal-content space-y-8">
              {/* Description */}
              <div className="max-w-3xl">
                <p className="bp-modal-desc">
                  {selectedArticle.description || "Project description and technical specifications."}
                </p>
              </div>

              {/* Media Grid */}
              {selectedArticle.images.length > 0 && (
                <div className="space-y-4">
                  <h4 className="bp-modal-media-title flex items-center gap-2">
                    <ImageIcon className="h-3 w-3" />
                    PROJECT SHEET MEDIA ({selectedArticle.images.length})
                  </h4>
                  <div className="bp-modal-grid">
                    {selectedArticle.images.map((img, idx) => {
                      const imgPath = `/api/portfolio/media/${selectedArticle.folderName}/${img}?w=800`;
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
                          className="bp-modal-img-wrap"
                        >
                          <Image
                            src={imgPath}
                            alt={img}
                            fill
                            className="object-cover hover:scale-102 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, 33vw"
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

      {/* Lightbox */}
      {activeGallery && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bp-lightbox-overlay animate-fadeIn"
          onClick={() => setActiveGallery(null)}
        >
          <button
            aria-label="Close gallery"
            className="absolute top-6 right-6 w-11 h-11 flex items-center justify-center bp-lightbox-btn rounded-none cursor-pointer z-10"
            onClick={() => setActiveGallery(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <button
            aria-label="Previous image"
            className="absolute left-6 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center bp-lightbox-btn rounded-none cursor-pointer z-10 font-mono"
            onClick={(e) => {
              e.stopPropagation();
              setActiveGallery((prev) =>
                prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : null
              );
            }}
          >
            <span>←</span>
          </button>
          <button
            aria-label="Next image"
            className="absolute right-6 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center bp-lightbox-btn rounded-none cursor-pointer z-10 font-mono"
            onClick={(e) => {
              e.stopPropagation();
              setActiveGallery((prev) =>
                prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : null
              );
            }}
          >
            <span>→</span>
          </button>
          <div className="relative max-w-5xl w-full h-[85vh] mx-6" onClick={(e) => e.stopPropagation()}>
            <Image
              src={`/api/portfolio/media/${activeGallery.folderName}/${activeGallery.images[activeGallery.index]}?w=1920`}
              alt={activeGallery.images[activeGallery.index]}
              fill
              className="object-contain"
              sizes="100vw"
              unoptimized
            />
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] text-[#dce7f5]/70 tracking-widest">
            {activeGallery.index + 1} / {activeGallery.images.length}
          </div>
        </div>
      )}
    </div>
  );
}
