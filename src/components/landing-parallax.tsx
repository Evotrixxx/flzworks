"use client";

import { useEffect, useState, useRef } from "react";

// Back-to-front: each entry paints on top of the previous one (DOM order).
// We have inserted virtual floating depth layers between the physical WebP layers.
const LAYERS = [
  { src: "/models/Effect/Back.webp", depth: 6 },
  { src: "/models/Effect/Lego.webp", depth: 16 },
  { src: "/models/Effect/Athaan.webp", depth: 30 },
  { src: "/models/Effect/Gato.webp", depth: 46 },
] as const;

const LAYER_SCALE = 1.12;

export function LandingParallax() {
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const depthRefs = useRef<(HTMLDivElement | null)[]>([]);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 120);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);

    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.08;
      current.current.y += (target.current.y - current.current.y) * 0.08;
      
      // Animate main image layers
      for (let i = 0; i < 4; i++) {
        const el = layerRefs.current[i];
        if (!el) continue;
        const d = LAYERS[i].depth;
        el.style.transform =
          `translate3d(${(-current.current.x * d).toFixed(2)}px, ${(-current.current.y * d * 0.6).toFixed(2)}px, 0) scale(${LAYER_SCALE})`;
      }

      // Animate floating depth elements (between layers)
      const depthElements = [
        { depth: 10 }, // Between Back and Lego
        { depth: 22 }, // Between Lego and Athaan
        { depth: 38 }, // Between Athaan and Gato
      ];
      for (let i = 0; i < depthElements.length; i++) {
        const el = depthRefs.current[i];
        if (!el) continue;
        const d = depthElements[i].depth;
        el.style.transform =
          `translate3d(${(-current.current.x * d).toFixed(2)}px, ${(-current.current.y * d * 0.6).toFixed(2)}px, 0)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#000000] animate-fadeIn"
      aria-hidden="true"
    >
      {/* Wrapper for blur and scaling */}
      <div className={`absolute inset-0 transition-all duration-1000 ease-out ${scrolled ? "blur-md scale-[1.04]" : "blur-0"}`}>
        {/* Layer 0: Back (depth: 6) */}
        <div
          ref={(el) => { layerRefs.current[0] = el; }}
          className="absolute inset-0 will-change-transform bg-center bg-no-repeat bg-cover"
          style={{
            backgroundImage: `url(${LAYERS[0].src})`,
            transform: `scale(${LAYER_SCALE})`,
          }}
        />

        {/* Depth Element 1: Deep Background (Between Back and Lego, depth: 10) */}
        <div
          ref={(el) => { depthRefs.current[0] = el; }}
          className="absolute top-[22%] left-[8%] will-change-transform flex flex-col gap-1.5 opacity-45"
        >
          <span className="text-[8px] font-mono text-white/30 tracking-[0.4em] uppercase">System Init // 0.1</span>
          <div className="w-16 h-px bg-white/10" />
        </div>

        {/* Layer 1: Lego (depth: 16) */}
        <div
          ref={(el) => { layerRefs.current[1] = el; }}
          className="absolute inset-0 will-change-transform bg-center bg-no-repeat bg-cover"
          style={{
            backgroundImage: `url(${LAYERS[1].src})`,
            transform: `scale(${LAYER_SCALE})`,
          }}
        />

        {/* Depth Element 2: Midground (Between Lego and Athaan, depth: 22) */}
        <div
          ref={(el) => { depthRefs.current[1] = el; }}
          className="absolute bottom-[38%] right-[10%] will-change-transform flex flex-col items-end gap-1 opacity-50"
        >
          <span className="text-[10px] font-mono text-white/40 tracking-[0.3em] uppercase">Mirsairen // 2026</span>
          <span className="text-[8px] font-mono text-white/20 tracking-[0.2em] uppercase">Lego Layer</span>
        </div>

        {/* Layer 2: Athaan (depth: 30) */}
        <div
          ref={(el) => { layerRefs.current[2] = el; }}
          className="absolute inset-0 will-change-transform bg-center bg-no-repeat bg-cover"
          style={{
            backgroundImage: `url(${LAYERS[2].src})`,
            transform: `scale(${LAYER_SCALE})`,
          }}
        />

        {/* Depth Element 3: Foreground (Between Athaan and Gato, depth: 38) */}
        <div
          ref={(el) => { depthRefs.current[2] = el; }}
          className="absolute top-[28%] right-[22%] will-change-transform opacity-30"
        >
          <div className="w-[120px] h-[120px] border border-white/10 rounded-full flex items-center justify-center animate-spin" style={{ animationDuration: '60s' }}>
            <div className="w-[80px] h-[80px] border border-dashed border-white/5 rounded-full" />
          </div>
        </div>

        {/* Layer 3: Gato (depth: 46) */}
        <div
          ref={(el) => { layerRefs.current[3] = el; }}
          className="absolute inset-0 will-change-transform bg-center bg-no-repeat bg-cover"
          style={{
            backgroundImage: `url(${LAYERS[3].src})`,
            transform: `scale(${LAYER_SCALE})`,
          }}
        />
      </div>

      {/* Darkening Overlay (20% to 30% black overlay) */}
      <div
        className="absolute inset-0 bg-black transition-opacity duration-1000 ease-out pointer-events-none z-10"
        style={{ opacity: scrolled ? 0.35 : 0 }}
      />

      {/* Soft vignette to frame the scene and blend the edges into the page */}
      <div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 40%, #000000 100%)",
          opacity: 0.85,
        }}
      />
    </div>
  );
}
