"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

const palettes = [
  { id: "aqua", label: "Cyan", hex: "#00ffcc" },
  { id: "violet", label: "Neon", hex: "#b026ff" },
  { id: "amber", label: "Hazard", hex: "#ffcc00" },
  { id: "graphite", label: "Ghost", hex: "#ffffff" },
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

  const activeColor = palettes.find((p) => p.id === currentPalette)?.hex || "#ffffff";

  return (
    <div className="relative z-50">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="neo-button flex h-12 w-12 items-center justify-center"
        aria-label="Change theme"
        style={{ borderColor: isOpen ? activeColor : undefined, color: isOpen ? activeColor : undefined }}
      >
        <Zap className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-black border border-white/20 p-2 shadow-2xl flex flex-col gap-1">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest px-2 pb-2 mb-2 border-b border-white/10">
            System Accent
          </div>
          {palettes.map((p) => (
            <button
              key={p.id}
              onClick={() => changePalette(p.id)}
              className="flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-left transition-colors hover:bg-white hover:text-black"
              style={{
                backgroundColor: currentPalette === p.id ? p.hex : undefined,
                color: currentPalette === p.id ? "#000" : undefined,
              }}
            >
              {p.label}
              {currentPalette === p.id && <span className="w-2 h-2 rounded-full bg-black animate-pulse" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
