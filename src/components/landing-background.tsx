"use client";

import React, { Component, ErrorInfo, ReactNode, Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Center, Environment, useGLTF, useProgress } from "@react-three/drei";
import * as THREE from "three";

// 1. Error Boundary to catch 3D/WebGL/Loading crashes
interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class CanvasErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("3D Background failed to load, falling back to CSS shapes:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// 2. CSS Fallback Shapes (Original background design)
function FallbackShapes() {
  return (
    <div className="showroom-shapes" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

// 3. Loading Screen Component
function LoadingScreen() {
  const { active, progress } = useProgress();
  const [showLoader, setShowLoader] = useState(true);
  const [fadeClass, setFadeClass] = useState("opacity-100");
  const [statusText, setStatusText] = useState("LOADING GEOMETRY...");

  useEffect(() => {
    // Dynamic telemetry status text based on progress
    if (progress < 35) {
      setStatusText("DECOMPRESSING 3D GEOMETRY...");
    } else if (progress < 70) {
      setStatusText("COMPILING TEXTURES & MAPS...");
    } else if (progress < 90) {
      setStatusText("INITIALIZING PBR MATERIALS...");
    } else {
      setStatusText("MOUNTING 3D SCENE...");
    }

    if (!active && progress === 100) {
      setFadeClass("opacity-0 pointer-events-none transition-all duration-1000 ease-out");
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [active, progress]);

  if (!showLoader) return null;

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#05060b] ${fadeClass}`}>
      {/* Background glow grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f111a_1px,transparent_1px),linear-gradient(to_bottom,#0f111a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
      
      {/* Glow orbits */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: "2s" }} />

      <div className="relative max-w-md w-full px-6 text-center z-10">
        {/* Futuristic Card */}
        <div className="bg-white/[0.01] border border-white/[0.05] rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-2xl shadow-black/80 relative overflow-hidden">
          {/* Top corner tech accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/50" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/50" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-purple-400/50" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-purple-400/50" />

          {/* Header */}
          <p className="text-[10px] font-mono text-cyan-400/60 uppercase tracking-[0.4em] mb-2">
            System Initialization
          </p>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-6">
            FLZ <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">WORKS</span>
          </h2>

          {/* Glowing Ring Loader */}
          <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
            {/* Outer spinning ring */}
            <div className="absolute inset-0 rounded-full border-2 border-white/5 border-t-cyan-500/60 border-b-purple-500/60 animate-spin" style={{ animationDuration: "3s" }} />
            {/* Inner pulsing circle */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center animate-pulse">
              <span className="text-[10px] font-mono text-white/75 font-bold">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* Progress Bar Container */}
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
              Signal Source: Landing.glb (138MB)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. 3D Model Component
interface ModelProps {
  mouse: React.MutableRefObject<{ x: number; y: number }>;
  modelUrl: string;
}

function LandingModel({ mouse, modelUrl }: ModelProps) {
  const { scene } = useGLTF(modelUrl, true);
  const groupRef = useRef<THREE.Group>(null);
  const { set, size } = useThree();

  // Set the custom Camera.001 from the GLTF as the active rendering camera
  useEffect(() => {
    const customCamera = scene.getObjectByName("Camera.001");
    if (customCamera && customCamera instanceof THREE.PerspectiveCamera) {
      // Update aspect ratio to match the current viewport/canvas size
      customCamera.aspect = size.width / size.height;
      customCamera.updateProjectionMatrix();
      
      set({ camera: customCamera });
    }
  }, [scene, set, size]);

  // Apply shadow casting/receiving to all meshes
  useEffect(() => {
    scene.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        
        // Optimizations for background performance
        if (node.material) {
          node.material.depthWrite = true;
          // Ensure materials respond elegantly to lighting
          if (node.material instanceof THREE.MeshStandardMaterial) {
            node.material.roughness = Math.max(node.material.roughness, 0.15);
          }
        }
      }
    });
  }, [scene]);

  useFrame((state) => {
    if (!groupRef.current) return;

    // Subtle parallax rotation: Y-axis (left/right mouse), X-axis (up/down mouse)
    const targetRotationY = (mouse.current.x * Math.PI) / 36;
    const targetRotationX = (mouse.current.y * Math.PI) / 36;

    // Smoothly lerp towards target rotation
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.04);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -targetRotationX, 0.04);

    // Subtle slow float drift
    const time = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(time * 0.4) * 0.08;
    groupRef.current.position.x = Math.cos(time * 0.3) * 0.04;
  });

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

// 5. Main Canvas Content
function LandingBackgroundInner() {
  const mouse = useRef({ x: 0, y: 0 });
  
  // Allows custom CDN URL configuration via environment variable (useful for production LFS bypass)
  const modelUrl = process.env.NEXT_PUBLIC_LANDING_MODEL_URL || "/models/Landing.glb";

  // Track mouse coordinates globally on the window
  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return (
    <>
      {/* Real-time Loading Overlay */}
      <LoadingScreen />

      {/* 3D Background Canvas */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#05060b]" aria-hidden="true">
        {/* Subtle radial overlay vignette */}
        <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_40%,#05060b_100%] z-10 pointer-events-none opacity-80" />

        <Canvas
          shadows
          camera={{ position: [0, 0, 8], fov: 45 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          {/* Subtle atmospheric lighting */}
          <ambientLight intensity={1.5} />
          
          {/* Main directional light */}
          <directionalLight
            position={[5, 10, 5]}
            intensity={3.5}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0001}
          />
          
          {/* Colored accent lights */}
          <pointLight position={[-6, 2, -2]} intensity={2.5} color="#06b6d4" />
          <pointLight position={[6, -2, 2]} intensity={2.0} color="#a855f7" />

          {/* Soft backlighting */}
          <directionalLight position={[0, -5, -5]} intensity={1.2} color="#0f172a" />

          {/* High-fidelity reflections */}
          <Environment preset="city" />

          <Suspense fallback={null}>
            <LandingModel mouse={mouse} modelUrl={modelUrl} />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
}

// 6. Exported Component with Error Boundary Wrapper
export function LandingBackground() {
  return (
    <CanvasErrorBoundary fallback={<FallbackShapes />}>
      <LandingBackgroundInner />
    </CanvasErrorBoundary>
  );
}

// Preload the default model path
const defaultModelUrl = process.env.NEXT_PUBLIC_LANDING_MODEL_URL || "/models/Landing.glb";
useGLTF.preload(defaultModelUrl, true);
