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
        { depth: 10 }, // depth-el-1
        { depth: 22 }, // depth-el-2
        { depth: 30 }, // depth-el-3
        { depth: 38 }, // depth-el-4
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

        {/* Depth Element 1: Vertical Line (Between Back and Lego, depth: 10) */}
        <div
          ref={(el) => { depthRefs.current[0] = el; }}
          className="absolute top-[18%] left-[6%] will-change-transform pointer-events-none"
        >
          <div className="w-[1px] h-[80px] bg-gradient-to-b from-transparent via-white/40 to-transparent opacity-60 animate-[depth-float-1_8s_ease-in-out_infinite]" />
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

        {/* Depth Element 2: Vertical Text 3D Auto Design (Between Lego and Athaan, depth: 22) */}
        <div
          ref={(el) => { depthRefs.current[1] = el; }}
          className="absolute top-[30%] right-[8%] will-change-transform pointer-events-none"
        >
          <div className="font-mono text-[8px] tracking-[0.3em] text-white/25 uppercase [writing-mode:vertical-rl] animate-[depth-float-2_10s_ease-in-out_infinite]">
            3D Auto Design
          </div>
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

        {/* Depth Element 3: Wireframe Circle (Between Athaan and Gato, depth: 30) */}
        <div
          ref={(el) => { depthRefs.current[2] = el; }}
          className="absolute bottom-[35%] left-[12%] will-change-transform pointer-events-none"
        >
          <div className="w-10 h-10 border border-white/12 rounded-full animate-[depth-float-3_12s_ease-in-out_infinite]" />
        </div>

        {/* Depth Element 4: Text MIRSAIREN 2026 (depth: 38) */}
        <div
          ref={(el) => { depthRefs.current[3] = el; }}
          className="absolute top-[22%] right-[22%] will-change-transform pointer-events-none"
        >
          <div className="font-mono text-[9px] text-white/18 tracking-[0.15em] animate-[depth-float-2_9s_ease-in-out_infinite_reverse]">
            MIRSAIREN 2026
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
