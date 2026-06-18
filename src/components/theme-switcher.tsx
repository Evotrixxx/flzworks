"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";

const palettes = [
  { id: "aqua", label: "Aqua" },
  { id: "violet", label: "Violet" },
  { id: "graphite", label: "Graphite" },
  { id: "amber", label: "Amber" },
];

export function ThemeSwitcher() {
  const [currentPalette, setCurrentPalette] = useState("aqua");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("autopiac.palette");
      if (saved) setCurrentPalette(saved);
    } catch (e) {}
  }, []);

  const changePalette = (id: string) => {
    setCurrentPalette(id);
    document.documentElement.dataset.themePalette = id;
    try {
      localStorage.setItem("autopiac.palette", id);
    } catch (e) {}
    setIsOpen(false);
  };

  return (
    <div className="relative z-50">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="portfolio-liquid-button flex h-9 w-9 items-center justify-center rounded-full text-zinc-300 transition hover:text-white hover:scale-105 active:scale-95"
        aria-label="Change theme"
      >
        <Palette className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 overflow-hidden rounded-xl border border-white/10 bg-black/60 p-1 shadow-2xl backdrop-blur-xl">
          {palettes.map((p) => (
            <button
              key={p.id}
              onClick={() => changePalette(p.id)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                currentPalette === p.id
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
