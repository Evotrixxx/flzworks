"use client";

import React, {
   Component,
   ErrorInfo,
   ReactNode,
   Suspense,
   useCallback,
   useEffect,
   useMemo,
   useRef,
   useState,
 } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useProgress, useAnimations, PerspectiveCamera, Environment, SoftShadows, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

const CAM_POS_X = 5.39;
const CAM_POS_Y = 1.151;
const CAM_POS_Z = 9.678;

const CAM_QUAT: [number, number, number, number] = [
  0.001414, 0.11738, 0.0, 0.992778,
];

const CAM_FOV = 18.463; // Extracted from Blender Camera.001 data block (yfov = 0.32225 rad)
const CAM_NEAR = 0.1;
const CAM_FAR = 100;
const DRACO_DECODER_PATH = "/draco/";

// ─── Error Boundary ──────────────────────────────────────────────────────────
interface EBProps { fallback: ReactNode; children: ReactNode; }
interface EBState { hasError: boolean; }

class CanvasErrorBoundary extends Component<EBProps, EBState> {
  state: EBState = { hasError: false };
  static getDerivedStateFromError(): EBState { return { hasError: true }; }
  componentDidCatch(e: Error, i: ErrorInfo) {
    console.warn("[LandingBackground] 3D scene failed, CSS fallback active:", e, i);
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
function LoadingScreen({ sceneReady }: { sceneReady: boolean }) {
  const { active, progress } = useProgress();
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  const statusText =
    progress < 35 ? "DECOMPRESSING 3D GEOMETRY..." :
    progress < 70 ? "COMPILING TEXTURES & MAPS..." :
    progress < 90 ? "INITIALIZING PBR MATERIALS..." :
                    "MOUNTING 3D SCENE...";
  const loadingComplete = sceneReady || (!active && progress >= 99);

  useEffect(() => {
    if (loadingComplete) {
      const fadeTimer = window.setTimeout(() => setFading(true), 0);
      const hideTimer = window.setTimeout(() => setVisible(false), 900);
      return () => {
        window.clearTimeout(fadeTimer);
        window.clearTimeout(hideTimer);
      };
    }
  }, [loadingComplete]);

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
              Signal Source: Landing.glb (9MB)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Camera Rig — mouse parallax on top of base Blender position ──────────────
function CameraRig({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
  useFrame(({ camera }) => {
    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      CAM_POS_X + mouse.current.x * 0.12,
      0.04,
    );
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      CAM_POS_Y + mouse.current.y * 0.08,
      0.04,
    );
  });
  return null;
}

// ─── 3D Model ─────────────────────────────────────────────────────────────────
function LandingModel({ modelUrl, onReady }: { modelUrl: string; onReady: () => void }) {
  const { scene, animations } = useGLTF(modelUrl, DRACO_DECODER_PATH);
  const groupRef = useRef<THREE.Group>(null);
  const { actions, names } = useAnimations(animations, groupRef);

  // Play all embedded animations
  useEffect(() => {
    names.forEach((name) => actions[name]?.play());
  }, [actions, names]);

  useEffect(() => {
    onReady();
  }, [onReady, scene]);

  // Traverse and enable shadow properties synchronously during render phase (via useMemo)
  useMemo(() => {
    if (scene) {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });
    }
  }, [scene]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

// ─── Inner Canvas ─────────────────────────────────────────────────────────────
function LandingBackgroundInner() {
  const mouse = useRef({ x: 0, y: 0 });
  const modelUrl = process.env.NEXT_PUBLIC_LANDING_MODEL_URL ?? "/models/Landing.glb";
  const [sceneReady, setSceneReady] = useState(false);
  const handleSceneReady = useCallback(() => setSceneReady(true), []);

  const [clientMounted, setClientMounted] = useState(false);
  useEffect(() => {
    const mountTimer = window.setTimeout(() => setClientMounted(true), 0);
    return () => window.clearTimeout(mountTimer);
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <>
      <LoadingScreen sceneReady={sceneReady} />

      <div
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#05060b]"
        aria-hidden="true"
      >
        {/* Vignette: darkens canvas edges for depth */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at center, transparent 35%, #05060b 100%)",
            opacity: 0.85,
          }}
        />

        {clientMounted && (
          <Canvas
            shadows
            dpr={[1, 2]}
            frameloop="always"
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "high-performance",
              stencil: false,
              depth: true,
              preserveDrawingBuffer: false,
              failIfMajorPerformanceCaveat: false,
              outputColorSpace: THREE.SRGBColorSpace,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.2,
            }}
            onCreated={({ gl }) => {
              gl.shadowMap.enabled = true;
              gl.domElement.addEventListener("webglcontextlost", (e) => {
                e.preventDefault();
                console.warn("[LandingBackground] WebGL context lost — will attempt restore");
              });
              gl.domElement.addEventListener("webglcontextrestored", () => {
                console.log("[LandingBackground] WebGL context restored");
              });
            }}
            style={{ position: "absolute", inset: 0 }}
          >
            <SoftShadows size={20} samples={10} focus={0.5} />

            <PerspectiveCamera
              makeDefault
              position={[CAM_POS_X, CAM_POS_Y, CAM_POS_Z]}
              quaternion={CAM_QUAT}
              fov={CAM_FOV}
              near={CAM_NEAR}
              far={CAM_FAR}
            />

            <ambientLight intensity={0.4} />
            <directionalLight
              castShadow
              position={[10, 15, 10]}
              intensity={2.2}
              shadow-mapSize-width={4096}
              shadow-mapSize-height={4096}
              shadow-camera-near={0.5}
              shadow-camera-far={60}
              shadow-camera-left={-15}
              shadow-camera-right={15}
              shadow-camera-top={15}
              shadow-camera-bottom={-15}
              shadow-bias={-0.0001}
            />
            <pointLight position={[-6, 3, -2]} intensity={8} color="#06b6d4" decay={2} />
            <pointLight position={[6, -2, 2]} intensity={5} color="#a855f7" decay={2} />

            <Environment preset="studio" background={false} />

            <CameraRig mouse={mouse} />

            {/* Ambient particle layers */}
            <Sparkles count={150} scale={15} size={1.2} speed={0.3} color="#06b6d4" opacity={0.6} />
            <Sparkles count={100} scale={15} size={1.5} speed={0.2} color="#a855f7" opacity={0.4} />

            <Suspense fallback={null}>
              <LandingModel modelUrl={modelUrl} onReady={handleSceneReady} />
            </Suspense>

            {/* Premium post-processing pipeline */}
            <EffectComposer>
              <Bloom intensity={0.8} luminanceThreshold={0.55} luminanceSmoothing={0.85} />
              <ChromaticAberration offset={[0.0006, 0.0006]} />
              <Vignette eskil={false} offset={0.1} darkness={0.8} />
            </EffectComposer>
          </Canvas>
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

const _modelUrl = process.env.NEXT_PUBLIC_LANDING_MODEL_URL ?? "/models/Landing.glb";
useGLTF.preload(_modelUrl, DRACO_DECODER_PATH);
