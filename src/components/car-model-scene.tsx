"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bounds, Center, ContactShadows, Environment, useGLTF } from "@react-three/drei";
import type { Group } from "three";

function CarModel({ compact = false }: { compact?: boolean }) {
  const group = useRef<Group>(null);
  const { scene } = useGLTF("/models/car.glb");

  useEffect(() => {
    scene.traverse((object) => {
      object.castShadow = true;
      object.receiveShadow = true;
    });
  }, [scene]);

  useFrame((_, delta) => {
    if (!group.current) {
      return;
    }

    group.current.rotation.y += delta * (compact ? 0.08 : 0.045);
  });

  return (
    <group ref={group} rotation={[0, -0.72, 0]}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

function ModelFallback() {
  return (
    <mesh rotation={[0, -0.72, 0]}>
      <boxGeometry args={[2.8, 0.9, 5]} />
      <meshStandardMaterial color="#f8fafc" metalness={0.25} roughness={0.34} />
    </mesh>
  );
}

export function CarModelScene({ compact = false }: { compact?: boolean }) {
  return (
    <div className="showroom-model" data-testid="car-model-scene">
      <Canvas
        shadows
        camera={{ position: compact ? [4.8, 2.1, 5.8] : [5.4, 2.35, 6.4], fov: compact ? 32 : 28 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 7, 5]} intensity={2.6} castShadow />
        <directionalLight position={[-5, 3, -3]} intensity={0.9} />
        <Environment preset="city" />
        <Suspense fallback={<ModelFallback />}>
          <Bounds fit clip observe margin={compact ? 1.15 : 1.05}>
            <CarModel compact={compact} />
          </Bounds>
          <ContactShadows
            position={[0, -0.72, 0]}
            opacity={0.34}
            scale={compact ? 7 : 9}
            blur={2.6}
            far={4}
            color="#020617"
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/car.glb");
