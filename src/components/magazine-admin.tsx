"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  EyeOff, 
  Calendar, 
  Folder, 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  FileText,
  ChevronDown
} from "lucide-react";
import type { PortfolioArticleWithImages } from "@/lib/portfolio-sync";

interface MagazineAdminProps {
  initialArticles: PortfolioArticleWithImages[];
  locale: "hu" | "en";
}

export function MagazineAdmin({ initialArticles, locale }: MagazineAdminProps) {
  const [articles, setArticles] = useState<PortfolioArticleWithImages[]>(initialArticles);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Track save states per article ID
  const [saveStatus, setSaveStatus] = useState<Record<string, "idle" | "saving" | "success" | "error">>({});
  const [formValues, setFormValues] = useState<Record<string, {
    title: string;
    date: string;
    description: string;
    visible: boolean;
  }>>(() => {
    const initialValues: Record<string, any> = {};
    initialArticles.forEach((article) => {
      initialValues[article.id] = {
        title: article.title,
        date: article.date,
        description: article.description || "",
        visible: article.visible,
      };
    });
    return initialValues;
  });

  const handleInputChange = (id: string, field: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
    // Reset save status to idle when user types
    if (saveStatus[id] !== "idle") {
      setSaveStatus((prev) => ({ ...prev, [id]: "idle" }));
    }
  };

  const handleSave = async (id: string, folderName: string) => {
    const values = formValues[id];
    setSaveStatus((prev) => ({ ...prev, [id]: "saving" }));

    try {
      const response = await fetch("/api/portfolio/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          folderName,
          title: values.title,
          date: values.date,
          description: values.description,
          visible: values.visible,
        }),
      });

      if (!response.ok) {
        throw new Error("Save failed");
      }

      const data = await response.json();

      if (data.success) {
        setSaveStatus((prev) => ({ ...prev, [id]: "success" }));
        // Update local articles list
        setArticles((prev) =>
          prev.map((art) => (art.id === id ? { ...art, ...data.article } : art))
        );
        setTimeout(() => {
          setSaveStatus((prev) => ({ ...prev, [id]: "idle" }));
        }, 3000);
      } else {
        setSaveStatus((prev) => ({ ...prev, [id]: "error" }));
      }
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus((prev) => ({ ...prev, [id]: "error" }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <a
          href={`/intranet/autopiac/magazine?lang=${locale}`}
          className="liquid-button-secondary inline-flex h-9 items-center gap-2 rounded-full px-4 text-xs font-black text-white hover:opacity-90 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Vissza a Magazinba
        </a>
        <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
          Összesen: {articles.length} cikk a tárolóban
        </span>
      </div>

      <div className="grid gap-6">
        {articles.map((article) => {
          const id = article.id;
          const isExpanded = expandedId === id;
          const status = saveStatus[id] || "idle";
          const values = formValues[id] || {
            title: article.title,
            date: article.date,
            description: article.description || "",
            visible: article.visible,
          };

          return (
            <div
              key={id}
              className={`glass-panel overflow-hidden rounded-2xl border transition-all duration-300 ${
                isExpanded ? "border-cyan-500/30 shadow-md shadow-cyan-950/10" : "border-white/5 hover:border-white/10"
              }`}
            >
              {/* Accordion header */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : id)}
                className="flex cursor-pointer items-center justify-between p-5 hover:bg-white/5 transition duration-200"
              >
                <div className="min-w-0 flex-1 pr-4">
                  <div className="flex items-center gap-3.5 mb-2">
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-400">
                      <Folder className="h-3 w-3" />
                      {article.folderName}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      values.visible 
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20" 
                        : "bg-rose-950/40 text-rose-400 border border-rose-500/20"
                    }`}>
                      {values.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {values.visible ? "Látható" : "Rejtett"}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white uppercase truncate">
                    {values.title || article.title}
                  </h2>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Small status indicator */}
                  {status === "saving" && <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />}
                  {status === "success" && <CheckCircle className="h-4 w-4 text-emerald-400" />}
                  {status === "error" && <AlertCircle className="h-4 w-4 text-rose-400" />}
                  
                  <button
                    className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all duration-300 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDown className="h-4 w-4 text-slate-300" />
                  </button>
                </div>
              </div>

              {/* Collapsible edit form */}
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isExpanded ? "max-h-[1500px] opacity-100 border-t border-white/5" : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-6 space-y-6 bg-white/[0.01]">
                  <div className="grid gap-5 md:grid-cols-2">
                    {/* Title Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Cikk megnevezése (Cím)
                      </label>
                      <input
                        type="text"
                        value={values.title}
                        onChange={(e) => handleInputChange(id, "title", e.target.value)}
                        className="glass-input h-10 w-full rounded-xl px-4 text-sm font-semibold text-white focus:border-cyan-500/50 outline-none transition"
                        placeholder="Pl. Brosure Mirsairen"
                      />
                    </div>

                    {/* Date Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        Létrehozás dátuma (YYYY-MM-DD)
                      </label>
                      <input
                        type="text"
                        value={values.date}
                        onChange={(e) => handleInputChange(id, "date", e.target.value)}
                        className="glass-input h-10 w-full rounded-xl px-4 text-sm font-semibold text-white focus:border-cyan-500/50 outline-none transition"
                        placeholder="Pl. 2026-11-17"
                      />
                    </div>
                  </div>

                  {/* Description Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      Cikk leírása / Tartalom
                    </label>
                    <textarea
                      value={values.description}
                      onChange={(e) => handleInputChange(id, "description", e.target.value)}
                      rows={5}
                      className="glass-input w-full rounded-xl p-4 text-sm font-medium text-white focus:border-cyan-500/50 outline-none transition resize-y font-normal"
                      placeholder="Írj egy bemutató vagy műszaki leírást a modellhez..."
                    />
                  </div>

                  {/* Visibility & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-5">
                    {/* Visibility toggle */}
                    <label className="flex cursor-pointer items-center gap-3 select-none">
                      <input
                        type="checkbox"
                        checked={values.visible}
                        onChange={(e) => handleInputChange(id, "visible", e.target.checked)}
                        className="h-4 w-4 rounded border-white/10 bg-slate-950 text-cyan-600 focus:ring-cyan-500/50 outline-none cursor-pointer"
                      />
                      <div>
                        <span className="text-sm font-black text-white uppercase tracking-wide">
                          Megjelenítés a Magazinban
                        </span>
                        <p className="text-xs text-slate-500 leading-none mt-0.5">
                          Ha ki van jelölve, a felhasználók látják a cikket.
                        </p>
                      </div>
                    </label>

                    {/* Save Button */}
                    <button
                      type="button"
                      onClick={() => handleSave(id, article.folderName)}
                      disabled={status === "saving"}
                      className="liquid-button-primary inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-black text-white hover:opacity-90 transition disabled:opacity-50"
                    >
                      {status === "saving" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Mentés...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Módosítások Mentése
                        </>
                      )}
                    </button>
                  </div>

                  {/* Image Thumbnails Preview */}
                  {article.images.length > 0 && (
                    <div className="border-t border-white/5 pt-5 space-y-3">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Csatolt Média Fájlok ({article.images.length})
                      </span>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                        {article.images.map((img) => (
                          <div
                            key={img}
                            className="relative aspect-video overflow-hidden rounded-lg bg-slate-950 border border-white/5"
                          >
                            <Image
                              src={`/api/portfolio/media/${article.folderName}/${img}`}
                              alt={img}
                              fill
                              sizes="80px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
