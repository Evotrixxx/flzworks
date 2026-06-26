"use client";

import React, {
  Component,
  ErrorInfo,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import Script from "next/script";



// ─── Camera.001 world transform — converted to spherical coordinates ──────────
// Base Position: [6.417, 1.1394, 13.967]
// Look Direction: [-0.233064, 0.002808, -0.97244]
// Target: [2.827, 1.182, -1.018]
// Orbit: 13.49deg yaw (theta), 90.16deg pitch (phi), 11.0m radius (moved closer)
const BASE_THETA = 13.49;
const BASE_PHI = 90.16;
const BASE_RADIUS = 11.0; // Reduced from 15.41 to bring the camera closer to the car
const BASE_FOV = 18.463;

const CAM_TARGET = "2.827m 1.182m -1.018m";
const CAM_FOV = `${BASE_FOV}deg`;

// ─── Error Boundary ──────────────────────────────────────────────────────────
interface EBProps { fallback: ReactNode; children: ReactNode; }
interface EBState { hasError: boolean; }

class CanvasErrorBoundary extends Component<EBProps, EBState> {
  state: EBState = { hasError: false };
  static getDerivedStateFromError(): EBState { return { hasError: true }; }
  componentDidCatch(e: Error, i: ErrorInfo) {
    console.warn("[LandingBackground] 3D viewer failed, CSS fallback active:", e, i);
  }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

// ─── CSS Fallback ─────────────────────────────────────────────────────────────
function FallbackShapes() {
  return (
    <div className="showroom-shapes" aria-hidden="true">
      <span /><span /><span /><span /><span />
    </div>
  );
}

// ─── Progress Loading Screen ─────────────────────────────────────────────────
function LoadingScreen({ progress, loading }: { progress: number; loading: boolean }) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  const statusText =
    progress < 35 ? "DECOMPRESSING 3D GEOMETRY..." :
    progress < 70 ? "COMPILING TEXTURES & MAPS..." :
    progress < 90 ? "INITIALIZING PBR MATERIALS..." :
                    "MOUNTING 3D SCENE...";

  useEffect(() => {
    if (!loading && progress >= 99) {
      setFading(true);
      const t = setTimeout(() => setVisible(false), 900);
      return () => clearTimeout(t);
    }
  }, [loading, progress]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#05060b] ${fading ? "opacity-0 pointer-events-none transition-opacity duration-700" : "opacity-100"}`}
      aria-label="Loading 3D scene"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f111a_1px,transparent_1px),linear-gradient(to_bottom,#0f111a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: "2s" }} />

      <div className="relative max-w-md w-full px-6 text-center z-10">
        <div className="bg-white/[0.01] border border-white/[0.05] rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-2xl shadow-black/80 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/50" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/50" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-purple-400/50" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-purple-400/50" />

          <p className="text-[10px] font-mono text-cyan-400/60 uppercase tracking-[0.4em] mb-2">System Initialization</p>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-6">
            FLZ <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">WORKS</span>
          </h2>

          <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-white/5 border-t-cyan-500/60 border-b-purple-500/60 animate-spin" style={{ animationDuration: "3s" }} />
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center animate-pulse">
              <span className="text-[10px] font-mono text-white/75 font-bold">{Math.round(progress)}%</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] font-mono text-white/40">
              <span className="tracking-wider">{statusText}</span>
              <span className="text-cyan-400/80 font-bold">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden p-[1px] border border-white/[0.02]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 shadow-[0_0_12px_rgba(6,182,212,0.5)] transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-[9px] font-mono text-white/20 uppercase tracking-[0.2em] pt-2">
              Signal Source: Google Model Viewer
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Inner Viewer ─────────────────────────────────────────────────────────────
function LandingBackgroundInner() {
  const viewerRef = useRef<any>(null);
  const [clientMounted, setClientMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const modelUrl = process.env.NEXT_PUBLIC_LANDING_MODEL_URL ?? "/models/Landing.glb";

  useEffect(() => {
    setClientMounted(true);
  }, []);

  // Mouse Parallax effect on the camera orbit
  useEffect(() => {
    if (!clientMounted) return;

    const onMove = (e: PointerEvent) => {
      const viewer = viewerRef.current;
      if (!viewer) return;

      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);

      // Smoothly nudge theta (yaw) and phi (pitch)
      const targetTheta = BASE_THETA + x * 1.8;
      const targetPhi = BASE_PHI - y * 1.2;

      // Directly set the camera-orbit attribute
      viewer.setAttribute("camera-orbit", `${targetTheta}deg ${targetPhi}deg ${BASE_RADIUS}m`);
    };

    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [clientMounted]);

  // Listen to model-viewer loading events
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const onProgress = (e: any) => {
      // Scale totalProgress 0.0-1.0 to 0-100
      setProgress(Math.round(e.detail.totalProgress * 100));
    };

    const onLoad = () => {
      setProgress(100);
      setLoading(false);
    };

    viewer.addEventListener("progress", onProgress);
    viewer.addEventListener("load", onLoad);

    return () => {
      viewer.removeEventListener("progress", onProgress);
      viewer.removeEventListener("load", onLoad);
    };
  }, [clientMounted]);

  return (
    <>
      {/* Load Google's Model Viewer component from CDN */}
      <Script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"
        strategy="afterInteractive"
      />

      {/* Loading Screen */}
      <LoadingScreen progress={progress} loading={loading} />

      <div
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#05060b]"
        aria-hidden="true"
      >
        {/* Vignette overlay */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at center, transparent 35%, #05060b 100%)",
            opacity: 0.85,
          }}
        />

        {clientMounted && (
          <model-viewer
            ref={viewerRef}
            src={modelUrl}
            autoplay
            exposure="1.0"
            environment-image="neutral"
            shadow-intensity="1.6"
            shadow-softness="1.0"
            camera-orbit={`${BASE_THETA}deg ${BASE_PHI}deg ${BASE_RADIUS}m`}
            camera-target={CAM_TARGET}
            field-of-view={CAM_FOV}
            min-camera-orbit="auto auto 5m"
            interaction-prompt="none"
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              background: "transparent",
            }}
          />
        )}
      </div>
    </>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────
export function LandingBackground() {
  return (
    <CanvasErrorBoundary fallback={<FallbackShapes />}>
      <LandingBackgroundInner />
    </CanvasErrorBoundary>
  );
}
