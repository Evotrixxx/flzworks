"use client";

import { CarConfig } from "./configurator-client";
import { Check, Settings2 } from "lucide-react";

type ConfigPanelProps = {
  config: CarConfig;
  setConfig: React.Dispatch<React.SetStateAction<CarConfig>>;
};

const COLORS = [
  { id: "#ffffff", name: "Alpine White" },
  { id: "#000000", name: "Black Sapphire" },
  { id: "#1a3b5c", name: "Tanzanite Blue" },
  { id: "#6a7074", name: "Brooklyn Grey" },
  { id: "#8b0000", name: "Fire Red" },
  { id: "#00a3b5", name: "Neo Cyan" },
];

export function ConfigPanel({ config, setConfig }: ConfigPanelProps) {
  const basePrice = 34900000;
  
  let totalPrice = basePrice;
  if (config.color !== "#ffffff") totalPrice += 450000;
  if (config.wheels === "sport") totalPrice += 850000;
  if (config.wheels === "aero") totalPrice += 1200000;
  if (config.packages.mSport) totalPrice += 2500000;
  if (config.packages.technology) totalPrice += 1800000;

  return (
    <div className="flex flex-col gap-8 text-white h-full pb-10">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-1">
          AutoPiac <span className="text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.4)" }}>3D</span>
        </h2>
        <p className="text-sm font-mono text-zinc-400">Concept Configurator v1.0</p>
      </div>

      {/* Exterior Color */}
      <section>
        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4 border-b border-white/10 pb-2">
          Exterior Color
        </h3>
        <div className="grid grid-cols-6 gap-3">
          {COLORS.map((color) => (
            <button
              key={color.id}
              onClick={() => setConfig({ ...config, color: color.id })}
              className={`w-10 h-10 rounded-full transition-all duration-300 relative ${
                config.color === color.id ? "ring-2 ring-offset-2 ring-offset-[#0a0a0e] ring-white scale-110" : "hover:scale-105 opacity-80 hover:opacity-100"
              }`}
              style={{ backgroundColor: color.id }}
              title={color.name}
              aria-label={color.name}
            />
          ))}
        </div>
        <p className="mt-3 text-sm font-mono text-zinc-300">
          Selected: <span className="text-white font-bold">{COLORS.find((c) => c.id === config.color)?.name}</span>
        </p>
      </section>

      {/* Wheels */}
      <section>
        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4 border-b border-white/10 pb-2">
          Wheels
        </h3>
        <div className="flex flex-col gap-3">
          {(["standard", "sport", "aero"] as const).map((wheel) => (
            <button
              key={wheel}
              onClick={() => setConfig({ ...config, wheels: wheel })}
              className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                config.wheels === wheel 
                  ? "bg-white/10 border-white text-white" 
                  : "bg-transparent border-white/10 text-zinc-400 hover:border-white/30"
              }`}
            >
              <span className="font-bold uppercase tracking-wider text-sm">{wheel} Wheels</span>
              {config.wheels === wheel && <Check className="w-4 h-4 text-[#00a3b5]" />}
            </button>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section>
        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4 border-b border-white/10 pb-2">
          Equipment Packages
        </h3>
        <div className="flex flex-col gap-3">
          <label className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all ${config.packages.mSport ? "bg-[#00a3b5]/10 border-[#00a3b5]" : "bg-transparent border-white/10 hover:border-white/30"}`}>
            <input 
              type="checkbox" 
              checked={config.packages.mSport}
              onChange={(e) => setConfig({ ...config, packages: { ...config.packages, mSport: e.target.checked } })}
              className="mt-1 w-4 h-4 accent-[#00a3b5]"
            />
            <div>
              <p className="font-bold uppercase tracking-wider text-sm text-white">M Sport Package</p>
              <p className="text-xs text-zinc-400 mt-1">Aggressive styling, sport suspension, and aerodynamic enhancements.</p>
            </div>
          </label>
          <label className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all ${config.packages.technology ? "bg-[#00a3b5]/10 border-[#00a3b5]" : "bg-transparent border-white/10 hover:border-white/30"}`}>
            <input 
              type="checkbox" 
              checked={config.packages.technology}
              onChange={(e) => setConfig({ ...config, packages: { ...config.packages, technology: e.target.checked } })}
              className="mt-1 w-4 h-4 accent-[#00a3b5]"
            />
            <div>
              <p className="font-bold uppercase tracking-wider text-sm text-white">Technology Package</p>
              <p className="text-xs text-zinc-400 mt-1">Advanced driver assist and premium interior ambient lighting.</p>
            </div>
          </label>
        </div>
      </section>

      {/* Summary Spacer */}
      <div className="flex-1" />

      {/* Summary Price */}
      <div className="sticky bottom-0 bg-[#0a0a0e] pt-4 border-t border-white/10 mt-8">
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-1">Total Configuration Price</p>
        <p className="text-3xl font-black tracking-tight text-white mb-4">
          {new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(totalPrice)}
        </p>
        <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#00a3b5] to-[#0891b2] hover:brightness-110 text-white font-black uppercase tracking-widest py-4 rounded-lg shadow-[0_0_20px_rgba(0,163,181,0.3)] transition-all">
          <Settings2 className="w-5 h-5" />
          Save Configuration
        </button>
      </div>

    </div>
  );
}
