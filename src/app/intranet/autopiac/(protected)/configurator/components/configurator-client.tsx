"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const CarScene = dynamic(() => import("./car-scene").then(mod => mod.CarScene), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-zinc-500 font-black">
      Loading 3D Engine...
    </div>
  ),
});
import { ConfigPanel } from "./config-panel";

export type CarConfig = {
  color: string;
  wheels: "standard" | "sport" | "aero";
  packages: {
    mSport: boolean;
    technology: boolean;
  };
};

export function ConfiguratorClient() {
  const [config, setConfig] = useState<CarConfig>({
    color: "#ffffff",
    wheels: "standard",
    packages: {
      mSport: false,
      technology: false,
    },
  });

  const [cameraPreset, setCameraPreset] = useState<"front" | "side" | "rear" | "top" | "interior">("front");

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-65px)] w-full relative">
      {/* 3D Viewport (Left) */}
      <div className="flex-1 relative bg-gradient-to-b from-[#111116] to-[#050508]">
        <CarScene config={config} cameraPreset={cameraPreset} />
        
        {/* Camera Presets Overlay */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 p-2 rounded-full backdrop-blur-md border border-white/10 z-10">
          {(["front", "side", "rear", "top"] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => setCameraPreset(preset)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                cameraPreset === preset 
                  ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]" 
                  : "text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Configuration Panel (Right) */}
      <div className="w-full lg:w-[420px] h-[40vh] lg:h-full overflow-y-auto bg-[#0a0a0e] border-l border-white/10 p-6 z-20 shrink-0">
        <ConfigPanel config={config} setConfig={setConfig} />
      </div>
    </div>
  );
}
