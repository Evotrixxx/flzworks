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
  forceNamecardOpen?: boolean;
}

export function PortfolioOnepager({ instagramMedia, articles, forceNamecardOpen }: PortfolioOnepagerProps) {
  const [selectedArticle, setSelectedArticle] = useState<PortfolioArticleWithImages | null>(null);
  const [activeGallery, setActiveGallery] = useState<{
    folderName: string;
    images: string[];
    index: number;
  } | null>(null);
  const [activeSection, setActiveSection] = useState("hero");
  const [selectedCategory, setSelectedCategory] = useState<ArchiveCategory>("ALL");

  // Namecard and Contact Form states
  const [isNamecardOpen, setIsNamecardOpen] = useState(forceNamecardOpen || false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [formError, setFormError] = useState("");

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;

    setFormStatus("sending");
    setFormError("");

    try {
      const res = await fetch("/api/portfolio/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          message: contactMessage,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to send email");
      }

      setFormStatus("success");
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (err: any) {
      setFormStatus("error");
      setFormError(err.message || "An error occurred.");
    }
  };

  const downloadVCard = () => {
    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:Flosz;Bence;;;",
      "FN:Bence Flosz",
      "ORG:FLZ Works",
      "TITLE:3D Artist / Designer / Game Dev",
      "EMAIL;TYPE=PREF,INTERNET:7bfloszb@gmail.com",
      "URL:https://flz.works",
      "END:VCARD"
    ].join("\n");

    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "bence_flosz.vcf");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


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
          <div className="bp-hero-eyebrow">PENTAGON ATHAAN 2026 · LIVE MODEL — DRAG TO ORBIT</div>
          <h1 className="bp-hero-headline">
            DRAWN, MODELED, RENDERED.<span className="bp-accent">.</span>
          </h1>
        </div>
      </section>

      {/* Sheet Index (Filmstrip) */}
      <section id="filmstrip" className="bp-filmstrip">
        <div className="bp-filmstrip-head">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="bp-section-label bp-accent">■ LOG</span>
            <div className="flex gap-2 font-mono text-[9px] tracking-wider uppercase">
              <button
                onClick={() => setSelectedCategory("ALL")}
                className={`px-2 py-0.5 border border-[#dce7f5]/20 hover:border-[#dce7f5]/50 transition-colors ${selectedCategory === "ALL" ? "text-[#ffd166] border-[#ffd166]" : "text-[#dce7f5]/60"
                  }`}
              >
                [ALL]
              </button>
              <button
                onClick={() => setSelectedCategory("AUTOMOTIVE")}
                className={`px-2 py-0.5 border border-[#dce7f5]/20 hover:border-[#dce7f5]/50 transition-colors ${selectedCategory === "AUTOMOTIVE" ? "text-[#ffd166] border-[#ffd166]" : "text-[#dce7f5]/60"
                  }`}
              >
                [AUTOMOTIVE]
              </button>
            </div>
          </div>
          <span className="bp-scroll-hint">SCROLL →</span>
        </div>

        {/* Relative wrapper for track and floating scroll helper */}
        <div className="relative">
          <div id="filmstrip-track" className="bp-filmstrip-track">
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
          </div>

          {/* Floating scroll button on the right side over the track */}
          <button
            className="bp-filmstrip-scroll-btn"
            onClick={() => {
              const track = document.getElementById("filmstrip-track");
              if (track) {
                const maxScroll = track.scrollWidth - track.clientWidth;
                if (track.scrollLeft < maxScroll - 15) {
                  track.scrollBy({ left: 300, behavior: "smooth" });
                } else {
                  scrollToSection("transmissions");
                }
              }
            }}
            aria-label="Scroll right or down"
          >
            →
          </button>
        </div>
      </section>

      {/* Transmissions — now an identical horizontal filmstrip */}
      <section id="transmissions" className="bp-filmstrip bp-transmissions">
        <div className="bp-filmstrip-head">
          <span className="bp-section-label bp-accent">■ SOCIALS — X / IG / TIKTOK / LINKEDIN</span>
          <span className="bp-scroll-hint">SCROLL →</span>
        </div>

        <div className="relative">
          <div id="transmissions-track" className="bp-filmstrip-track">
            {/* X */}
            <a
              href="https://x.com/home"
              target="_blank"
              rel="noopener noreferrer"
              className="bp-sheet"
            >
              <div className="bp-sheet-img flex flex-col items-center justify-center bg-[#dce7f5]/5 transition-colors hover:bg-[#dce7f5]/10">
                <span className="text-2xl font-bold tracking-wider text-[#ffd166]">X</span>
                <span className="text-[8px] opacity-40 mt-1">X.COM</span>
              </div>
              <div className="bp-sheet-caption">X — HOME</div>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/vision.flz/"
              target="_blank"
              rel="noopener noreferrer"
              className="bp-sheet"
            >
              <div className="bp-sheet-img">
                {instagramMedia.length > 0 && (instagramMedia[0].thumbnail_url || instagramMedia[0].media_url) ? (
                  <Image
                    src={instagramMedia[0].thumbnail_url || instagramMedia[0].media_url || ""}
                    alt="Instagram feed"
                    fill
                    className="bp-sheet-img-el object-cover"
                    sizes="250px"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#dce7f5]/5 transition-colors hover:bg-[#dce7f5]/10">
                    <span className="text-2xl font-bold tracking-wider text-[#ffd166]">IG</span>
                    <span className="text-[8px] opacity-40 mt-1">INSTAGRAM.COM/VISION.FLZ</span>
                  </div>
                )}
              </div>
              <div className="bp-sheet-caption">IG — @VISION.FLZ</div>
            </a>

            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@vision.flz"
              target="_blank"
              rel="noopener noreferrer"
              className="bp-sheet"
            >
              <div className="bp-sheet-img flex flex-col items-center justify-center bg-[#dce7f5]/5 transition-colors hover:bg-[#dce7f5]/10">
                <span className="text-2xl font-bold tracking-wider text-[#ffd166]">TT</span>
                <span className="text-[8px] opacity-40 mt-1">TIKTOK.COM/@VISION.FLZ</span>
              </div>
              <div className="bp-sheet-caption">TIKTOK — @VISION.FLZ</div>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/bence-flosz-56134535a/"
              target="_blank"
              rel="noopener noreferrer"
              className="bp-sheet"
            >
              <div className="bp-sheet-img flex flex-col items-center justify-center bg-[#dce7f5]/5 transition-colors hover:bg-[#dce7f5]/10">
                <span className="text-2xl font-bold tracking-wider text-[#ffd166]">LI</span>
                <span className="text-[8px] opacity-40 mt-1">LINKEDIN PROFILE</span>
              </div>
              <div className="bp-sheet-caption">LINKEDIN — B. FLOSZ</div>
            </a>
          </div>

          {/* Floating scroll button on the right side over the track */}
          <button
            className="bp-filmstrip-scroll-btn"
            onClick={() => {
              const track = document.getElementById("transmissions-track");
              if (track) {
                const maxScroll = track.scrollWidth - track.clientWidth;
                if (track.scrollLeft < maxScroll - 15) {
                  track.scrollBy({ left: 300, behavior: "smooth" });
                } else {
                  scrollToSection("contact");
                }
              }
            }}
            aria-label="Scroll right or down"
          >
            →
          </button>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form-section" className="bp-contact-form-sec">
        <div className="bp-form-container">
          <div className="bp-section-label bp-accent mb-4">■ SEND A MESSAGE</div>
          <form onSubmit={handleSendEmail} className="bp-form-technical-table">
            <div className="bp-form-row font-mono">
              <div className="bp-form-cell">
                <label htmlFor="contact-name" className="bp-form-cell-label">NAME</label>
                <input
                  id="contact-name"
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="YOUR NAME"
                  className="bp-form-cell-input"
                  maxLength={100}
                />
              </div>
              <div className="bp-form-cell">
                <label htmlFor="contact-email" className="bp-form-cell-label">EMAIL</label>
                <input
                  id="contact-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="YOUR.EMAIL@DOMAIN.COM"
                  className="bp-form-cell-input"
                  maxLength={100}
                />
              </div>
            </div>
            <div className="bp-form-row font-mono">
              <div className="bp-form-cell full-width">
                <label htmlFor="contact-message" className="bp-form-cell-label">MESSAGE</label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="WRITE YOUR MESSAGE HERE..."
                  className="bp-form-cell-textarea"
                  maxLength={5000}
                />
              </div>
            </div>
            <div className="bp-form-submit-row font-mono">
              <button type="submit" disabled={formStatus === "sending"} className="bp-form-submit-btn">
                {formStatus === "sending" ? "SENDING..." : "SEND MESSAGE →"}
              </button>
              {formStatus === "success" && (
                <span className="bp-form-status-msg success">
                  MESSAGE SENT SUCCESSFULLY.
                </span>
              )}
              {formStatus === "error" && (
                <span className="bp-form-status-msg error">
                  ERROR: {formError.toUpperCase()}
                </span>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Footer / Titleblock */}
      <footer id="contact" className="bp-titleblock">
        <div className="bp-titleblock-cell">
          <div className="bp-titleblock-label">IMAGINED BY</div>
          <div className="bp-titleblock-value">FLZ</div>
        </div>
        <div className="bp-titleblock-cell">
          <div className="bp-titleblock-label">CREATED BY</div>
          <div className="bp-titleblock-value">FLZ WORKS</div>
        </div>
        <div className="bp-titleblock-cell">
          <div className="bp-titleblock-label">GAMES BY</div>
          <div className="bp-titleblock-value">FLZ STUDIO</div>
        </div>
        <div className="bp-titleblock-cell">
          <div className="bp-titleblock-label">SUBMISSION</div>
          <div className="bp-titleblock-value bp-accent">
            <a className="bp-titleblock-link" href="https://www.instagram.com/vision.flz/" target="_blank" rel="noopener noreferrer">
              VIA INSTAGRAM ↗
            </a>
          </div>
        </div>
      </footer>

      {/* Floating ID Card Trigger Button (FAB) — only show if not forced open on /id page */}
      {!forceNamecardOpen && (
        <button
          className="bp-id-fab"
          onClick={() => setIsNamecardOpen(true)}
          aria-label="Open virtual namecard"
        >
          <span className="bp-id-fab-icon">[ID]</span>
          <span className="bp-id-fab-text">NAMECARD</span>
        </button>
      )}

      {/* Virtual Namecard Modal Overlay */}
      {isNamecardOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bp-modal-overlay p-4 ${
            forceNamecardOpen ? "bg-[#12284b]" : ""
          }`}
          onClick={() => !forceNamecardOpen && setIsNamecardOpen(false)}
        >
          <div
            className="relative w-full max-w-[420px] bp-namecard-box rounded-none shadow-2xl p-6 flex flex-col border-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            {!forceNamecardOpen && (
              <button
                aria-label="Close namecard"
                onClick={() => setIsNamecardOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bp-modal-close"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Blueprint Header */}
            <div className="border-b pb-4 mb-4 font-mono text-[9px] tracking-widest text-[#ffd166] flex justify-between bp-namecard-header">
              <span>FLZ WORKS // IDENTITY CARD</span>
              <span>NO. 2026-001</span>
            </div>

            {/* Card Body */}
            <div className="flex gap-4 items-start">
              {/* Photo/Avatar area */}
              <div className="w-20 h-24 border flex flex-col items-center justify-center bg-[#dce7f5]/5 relative overflow-hidden shrink-0 bp-namecard-photo">
                <Image
                  src="/profile.jpg"
                  alt="Bence Flosz"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-sans text-xl font-bold uppercase tracking-tight text-[#dce7f5] leading-none mb-1">
                  Bence Flosz
                </h3>
                <div className="text-[9px] font-mono tracking-wider text-[#ffd166] uppercase mb-4">
                  3D Artist / Designer / Game Dev
                </div>

                <div className="space-y-1.5 font-mono text-[9px] text-[#dce7f5]/70">
                  <div>STUDIO: FLZ WORKS</div>
                  <div>LOC: BUDAPEST, HU</div>
                  <div>URL: <a href="https://flz.works" target="_blank" rel="noopener noreferrer" className="text-[#ffd166] hover:underline">FLZ.WORKS</a></div>
                </div>
              </div>
            </div>

            {/* Social Pill Links */}
            <div className="grid grid-cols-2 gap-2 mt-6 font-mono text-[9px] bp-namecard-socials">
              <a
                href="https://www.instagram.com/vision.flz/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-center transition-colors"
              >
                IG ↗
              </a>
              <a
                href="https://www.tiktok.com/@vision.flz"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-center transition-colors"
              >
                TIKTOK ↗
              </a>
              <a
                href="https://www.linkedin.com/in/bence-flosz-56134535a/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-center transition-colors"
              >
                LINKEDIN ↗
              </a>
              <a
                href="https://x.com/home"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-center transition-colors"
              >
                X ↗
              </a>
            </div>

            {/* vCard download trigger */}
            <button
              onClick={downloadVCard}
              className="mt-4 w-full bg-[#ffd166] hover:bg-[#ffe599] text-[#12284b] font-mono text-[9px] font-bold tracking-widest py-2.5 transition-colors uppercase bp-namecard-download-btn"
            >
              [DOWNLOAD VCARD]
            </button>
          </div>
        </div>
      )}



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
