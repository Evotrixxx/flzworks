"use client";

import { useEffect, useState } from "react";
import { Check, Languages, Palette, Settings, Sparkles } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale } from "@/lib/i18n";

type PaletteId = "aqua" | "violet" | "graphite" | "amber";
type GlassMode = "clear" | "bold";

const paletteOptions: Array<{ id: PaletteId; swatch: string }> = [
  { id: "aqua", swatch: "linear-gradient(135deg, #00a3b5, #21b17b, #111827)" },
  { id: "violet", swatch: "linear-gradient(135deg, #7c3aed, #06b6d4, #111827)" },
  { id: "graphite", swatch: "linear-gradient(135deg, #334155, #64748b, #0f172a)" },
  { id: "amber", swatch: "linear-gradient(135deg, #f59e0b, #ef4444, #111827)" },
];

const glassOptions: GlassMode[] = ["clear", "bold"];

function isPaletteId(value: string | null): value is PaletteId {
  return paletteOptions.some((item) => item.id === value);
}

function isGlassMode(value: string | null): value is GlassMode {
  return value === "clear" || value === "bold";
}

function getStoredPalette(): PaletteId {
  if (typeof window === "undefined") {
    return "aqua";
  }

  const storedPalette = window.localStorage.getItem("autopiac.palette");
  return isPaletteId(storedPalette) ? storedPalette : "aqua";
}

function getStoredGlass(): GlassMode {
  if (typeof window === "undefined") {
    return "clear";
  }

  const storedGlass = window.localStorage.getItem("autopiac.glass");
  return isGlassMode(storedGlass) ? storedGlass : "clear";
}

function applyTheme(palette: PaletteId, glass: GlassMode) {
  document.documentElement.dataset.themePalette = palette;
  document.documentElement.dataset.glass = glass;
}

export function SiteSettings({
  locale,
  labels,
}: {
  locale: Locale;
  labels: Record<Locale, string> & { language: string };
}) {
  const [open, setOpen] = useState(false);
  const [palette, setPalette] = useState<PaletteId>("aqua");
  const [glass, setGlass] = useState<GlassMode>("clear");

  useEffect(() => {
    const storedPalette = window.localStorage.getItem("autopiac.palette");
    if (isPaletteId(storedPalette)) {
      setPalette(storedPalette);
    }
    const storedGlass = window.localStorage.getItem("autopiac.glass");
    if (isGlassMode(storedGlass)) {
      setGlass(storedGlass);
    }
  }, []);

  const copy =
    locale === "hu"
      ? {
          settings: "Beallitasok",
          language: "Nyelv",
          palette: "Szinvilag",
          glass: "Uveg hatas",
          aqua: "Aqua",
          violet: "Violet",
          graphite: "Graphite",
          amber: "Amber",
          clear: "Tiszta",
          bold: "Eros",
        }
      : {
          settings: "Settings",
          language: "Language",
          palette: "Palette",
          glass: "Glass",
          aqua: "Aqua",
          violet: "Violet",
          graphite: "Graphite",
          amber: "Amber",
          clear: "Clear",
          bold: "Bold",
        };

  useEffect(() => {
    applyTheme(palette, glass);
  }, [palette, glass]);

  function updatePalette(nextPalette: PaletteId) {
    setPalette(nextPalette);
    localStorage.setItem("autopiac.palette", nextPalette);
    applyTheme(nextPalette, glass);
  }

  function updateGlass(nextGlass: GlassMode) {
    setGlass(nextGlass);
    localStorage.setItem("autopiac.glass", nextGlass);
    applyTheme(palette, nextGlass);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="liquid-button-secondary inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:text-slate-950"
        aria-expanded={open}
        aria-label={copy.settings}
        title={copy.settings}
      >
        <Settings className="h-4 w-4" aria-hidden="true" />
      </button>

      {open && (
        <div className="glass-panel absolute right-0 top-11 z-50 w-[min(21rem,calc(100vw-2rem))] rounded-lg p-4 text-sm text-slate-700">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 text-sm font-black text-slate-950">
              <Settings className="h-4 w-4 text-[var(--accent-aqua)]" aria-hidden="true" />
              {copy.settings}
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full px-2 py-1 text-xs font-black text-slate-500 transition hover:bg-white/70 hover:text-slate-950"
            >
              Esc
            </button>
          </div>

          <div className="space-y-4">
            <section className="grid gap-2">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase text-slate-500">
                <Languages className="h-4 w-4" aria-hidden="true" />
                {copy.language}
              </div>
              <LanguageSwitcher locale={locale} labels={labels} />
            </section>

            <section className="grid gap-2">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase text-slate-500">
                <Palette className="h-4 w-4" aria-hidden="true" />
                {copy.palette}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {paletteOptions.map((option) => {
                  const active = palette === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => updatePalette(option.id)}
                      className={`glass-chip inline-flex h-10 items-center justify-between rounded-full px-3 text-xs font-black transition ${
                        active ? "text-slate-950 ring-2 ring-[var(--focus-ring)]" : "text-slate-600 hover:text-slate-950"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="h-4 w-4 rounded-full border border-white/80 shadow-sm"
                          style={{ background: option.swatch }}
                          aria-hidden="true"
                        />
                        {copy[option.id]}
                      </span>
                      {active && <Check className="h-4 w-4 text-[var(--accent-aqua)]" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-2">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase text-slate-500">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {copy.glass}
              </div>
              <div className="glass-chip grid grid-cols-2 rounded-full p-1">
                {glassOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateGlass(option)}
                    className={`h-8 rounded-full text-xs font-black transition ${
                      glass === option ? "theme-active-pill" : "text-slate-600 hover:bg-white/70 hover:text-slate-950"
                    }`}
                  >
                    {copy[option]}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
