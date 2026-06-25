"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Calendar, Image as ImageIcon, ExternalLink, ShieldAlert } from "lucide-react";
import type { PortfolioArticleWithImages } from "@/lib/portfolio-sync";
import type { SessionUser } from "@/lib/auth";

interface MagazineListProps {
  initialArticles: PortfolioArticleWithImages[];
  user: SessionUser | null;
  locale: "hu" | "en";
}

export function MagazineList({ initialArticles, user, locale }: MagazineListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<{ articleId: string; path: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | "CAR_DESIGN" | "OTHER">("ALL");

  const isAdmin = user?.role === "ADMIN";

  const filteredArticles = initialArticles.filter((article) => {
    if (selectedCategory === "ALL") return true;
    return article.category === selectedCategory;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateStr: string) => {
    if (dateStr === "N/A" || !dateStr) return locale === "hu" ? "Nincs dátum" : "No date";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      return date.toLocaleDateString(locale === "hu" ? "hu-HU" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin header notification */}
      {isAdmin && (
        <div className="glass-panel border-cyan-500/30 bg-cyan-950/10 flex items-center justify-between rounded-xl p-4 text-cyan-200">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-950/40 text-cyan-400">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-black uppercase tracking-wider">Adminisztrátori hozzáférés</p>
              <p className="text-xs text-cyan-400/80">Szerkesztheted és módosíthatod a Magazin cikkeit.</p>
            </div>
          </div>
          <a
            href={`/intranet/autopiac/magazine/admin?lang=${locale}`}
            className="liquid-button-primary inline-flex h-9 items-center gap-2 rounded-full px-4 text-xs font-black text-white hover:opacity-90 transition"
          >
            Szerkesztő Felület
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {initialArticles.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
          <p className="text-lg font-black">Nincsenek elérhető cikkek</p>
          <p className="text-sm mt-1">Helyezz el mappákat a Media/Portfolio könyvtárban a betöltéshez.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 bg-white/[0.02] p-1 rounded-2xl border border-white/5 backdrop-blur-md max-w-md mx-auto">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`flex-1 min-w-[80px] py-1.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                selectedCategory === "ALL"
                  ? "bg-white/10 text-white border border-white/10 shadow-inner"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.01] border border-transparent"
              }`}
            >
              {locale === "hu" ? "Minden" : "All"}
            </button>
            <button
              onClick={() => setSelectedCategory("CAR_DESIGN")}
              className={`flex-1 min-w-[80px] py-1.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                selectedCategory === "CAR_DESIGN"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                  : "text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/10 border border-transparent"
              }`}
            >
              {locale === "hu" ? "3D Autótervek" : "3D Car Designs"}
            </button>
            <button
              onClick={() => setSelectedCategory("OTHER")}
              className={`flex-1 min-w-[80px] py-1.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                selectedCategory === "OTHER"
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                  : "text-slate-400 hover:text-purple-400 hover:bg-purple-950/10 border border-transparent"
              }`}
            >
              {locale === "hu" ? "Egyéb" : "Other"}
            </button>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
              <p className="text-lg font-black">Nincsenek cikkek ebben a kategóriában</p>
              <p className="text-sm mt-1">Válassz másik kategóriát a szűréshez.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredArticles.map((article) => {
            const isExpanded = expandedId === article.id;
            
            return (
              <article
                key={article.id}
                className={`glass-panel overflow-hidden rounded-2xl transition-all duration-500 ${
                  isExpanded ? "border-white/20 shadow-lg shadow-black/40" : "hover:border-white/10"
                }`}
              >
                {/* Accordion Header */}
                <div
                  onClick={() => toggleExpand(article.id)}
                  className="flex cursor-pointer items-center justify-between p-6 hover:bg-white/5 transition duration-300"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {formatDate(article.date)}
                      </span>
                      {article.images.length > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">
                          <ImageIcon className="h-3.5 w-3.5 text-slate-400" />
                          {article.images.length} {locale === "hu" ? "kép" : "images"}
                        </span>
                      )}
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        article.category === "CAR_DESIGN"
                          ? "bg-cyan-950/40 text-cyan-300 border border-cyan-500/20"
                          : "bg-purple-950/40 text-purple-300 border border-purple-500/20"
                      }`}>
                        {article.category === "CAR_DESIGN"
                          ? (locale === "hu" ? "3D Autó" : "3D Car Design")
                          : (locale === "hu" ? "Egyéb" : "Other")}
                      </span>
                      {!article.visible && (
                        <span className="inline-flex items-center rounded-full bg-rose-950/40 border border-rose-500/30 px-2.5 py-1 text-xs font-semibold text-rose-300">
                          Rejtett
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase leading-none">
                      {article.title}
                    </h2>
                  </div>

                  <button
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all duration-300 shrink-0 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    aria-label="Expand article"
                  >
                    <ChevronDown className="h-5 w-5 text-slate-300" />
                  </button>
                </div>

                {/* Collapsible Content */}
                <div
                  className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    isExpanded ? "max-h-[2500px] opacity-100 border-t border-white/5" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-6 space-y-6">
                    {/* Article description */}
                    {article.description && (
                      <p className="text-slate-300 leading-relaxed font-normal whitespace-pre-line text-base bg-white/5 p-5 rounded-xl border border-white/5">
                        {article.description}
                      </p>
                    )}

                    {/* Image gallery */}
                    {article.images.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 border-b border-white/10 pb-2">
                          Média Galéria
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {article.images.map((img) => {
                            const imgPath = `/api/portfolio/media/${article.folderName}/${img}`;
                            
                            return (
                              <div
                                key={img}
                                onClick={() => setActiveImage({ articleId: article.id, path: imgPath })}
                                className="group relative aspect-video cursor-zoom-in overflow-hidden rounded-xl bg-slate-900 border border-white/5 transition hover:border-white/20 shadow-md"
                              >
                                <Image
                                  src={imgPath}
                                  alt={`${article.title} - ${img}`}
                                  fill
                                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                  className="object-cover transition duration-500 group-hover:scale-105"
                                  unoptimized
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white uppercase tracking-wider backdrop-blur-md border border-white/20">
                                    Nagyítás
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">Ehhez a cikkhez nincsenek feltöltött képek.</p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {activeImage && (
        <div
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm transition-opacity duration-300 cursor-zoom-out"
        >
          <div className="relative max-h-full max-w-7xl aspect-video w-full">
            <Image
              src={activeImage.path}
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
