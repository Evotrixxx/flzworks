"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, ContactShadows } from "@react-three/drei";
import { Suspense, useRef, useEffect } from "react";
import * as THREE from "three";
import { CarConfig } from "./configurator-client";
import { ProceduralCar } from "./procedural-car";

type CarSceneProps = {
  config: CarConfig;
  cameraPreset: "front" | "side" | "rear" | "top" | "interior";
};

const CAMERA_PRESETS = {
  front: { position: new THREE.Vector3(0, 1.5, 6), target: new THREE.Vector3(0, 0.5, 0) },
  side: { position: new THREE.Vector3(6, 1.5, 0), target: new THREE.Vector3(0, 0.5, 0) },
  rear: { position: new THREE.Vector3(0, 1.5, -6), target: new THREE.Vector3(0, 0.5, 0) },
  top: { position: new THREE.Vector3(0, 8, 0), target: new THREE.Vector3(0, 0, 0) },
  interior: { position: new THREE.Vector3(0.4, 1.2, 0.5), target: new THREE.Vector3(0, 1.2, 2) },
};

function CameraRig({ preset }: { preset: "front" | "side" | "rear" | "top" | "interior" }) {
  const controls = useRef<any>(null);

  useEffect(() => {
    if (controls.current) {
      const targetPos = CAMERA_PRESETS[preset].position;
      const targetFocus = CAMERA_PRESETS[preset].target;

      // Animate camera position and target using GSAP or simple lerp inside a loop would be ideal
      // For simplicity in this functional component, we snap it, or use R3F useFrame for smooth transition.
      // We will snap it here, but in a real app you'd use @react-spring/three or frame-based lerping.
      controls.current.object.position.copy(targetPos);
      controls.current.target.copy(targetFocus);
      controls.current.update();
    }
  }, [preset]);

  return (
    <OrbitControls 
      ref={controls}
      makeDefault
      minPolarAngle={0}
      maxPolarAngle={Math.PI / 2 - 0.05} // Don't go below ground
      minDistance={2}
      maxDistance={10}
      enablePan={false}
      enableDamping
      dampingFactor={0.05}
    />
  );
}

export function CarScene({ config, cameraPreset }: CarSceneProps) {
  return (
    <div className="w-full h-full">
      <Canvas shadows gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}>
        <color attach="background" args={['#0a0a0c']} />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <spotLight position={[0, 15, 0]} angle={0.3} penumbra={1} castShadow intensity={2} shadow-bias={-0.0001} />
        
        {/* Environment - HDRI Reflections */}
        <Environment preset="city" />

        <Suspense fallback={null}>
          <ProceduralCar config={config} />
          
          {/* Ground Shadow */}
          <ContactShadows resolution={1024} scale={10} blur={2} opacity={0.6} far={5} color="#000000" />
        </Suspense>

        <CameraRig preset={cameraPreset} />
      </Canvas>
    </div>
  );
}
