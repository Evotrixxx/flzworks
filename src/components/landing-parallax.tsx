"use client";

import { useEffect, useRef } from "react";

// Back-to-front: each entry paints on top of the previous one (DOM order),
// so Gato ends up frontmost and Back is the backdrop — matching
// Gato > Athaan > Lego > Back. `depth` is the parallax travel in px; the
// frontmost layer moves most, the backdrop least.
const LAYERS = [
  { src: "/models/Effect/Back.webp", depth: 6 },
  { src: "/models/Effect/Lego.webp", depth: 16 },
  { src: "/models/Effect/Athaan.webp", depth: 30 },
  { src: "/models/Effect/Gato.webp", depth: 46 },
] as const;

// Layers are scaled up slightly so parallax translation never reveals an edge.
const LAYER_SCALE = 1.12;

export function LandingParallax() {
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);

    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.08;
      current.current.y += (target.current.y - current.current.y) * 0.08;
      for (let i = 0; i < layerRefs.current.length; i++) {
        const el = layerRefs.current[i];
        if (!el) continue;
        const d = LAYERS[i].depth;
        el.style.transform =
          `translate3d(${(-current.current.x * d).toFixed(2)}px, ${(-current.current.y * d * 0.6).toFixed(2)}px, 0) scale(${LAYER_SCALE})`;
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
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#05060b] animate-fadeIn"
      aria-hidden="true"
    >
      {LAYERS.map((layer, i) => (
        <div
          key={layer.src}
          ref={(el) => {
            layerRefs.current[i] = el;
          }}
          className="absolute inset-0 will-change-transform bg-center bg-no-repeat bg-cover"
          style={{
            backgroundImage: `url(${layer.src})`,
            transform: `scale(${LAYER_SCALE})`,
          }}
        />
      ))}

      {/* Soft vignette to frame the scene and blend the edges into the page */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 40%, #05060b 100%)",
          opacity: 0.7,
        }}
      />
    </div>
  );
}
