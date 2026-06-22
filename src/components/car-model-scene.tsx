"use client";

import { Suspense, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Center, ContactShadows, Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function CarModel({ compact = false }: { compact?: boolean }) {
  const { scene } = useGLTF("/models/car.glb");
  const materials = useMemo(
    () => ({
      paint: new THREE.MeshPhysicalMaterial({
        color: "#f8fafc",
        metalness: 0.42,
        roughness: 0.24,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: "#1f2937",
        metalness: 0.1,
        roughness: 0.04,
        transmission: 0.45,
        transparent: true,
        opacity: 0.62,
      }),
      tire: new THREE.MeshStandardMaterial({
        color: "#08090d",
        roughness: 0.74,
        metalness: 0.02,
      }),
      rim: new THREE.MeshStandardMaterial({
        color: "#cbd5e1",
        roughness: 0.24,
        metalness: 0.82,
      }),
      light: new THREE.MeshStandardMaterial({
        color: "#f8fafc",
        emissive: "#dbeafe",
        emissiveIntensity: 0.45,
        roughness: 0.18,
        metalness: 0.1,
      }),
    }),
    [],
  );

  useEffect(() => {
    scene.traverse((object) => {
      object.castShadow = true;
      object.receiveShadow = true;

      if (object instanceof THREE.Mesh) {
        const name = `${object.name} ${object.material instanceof THREE.Material ? object.material.name : ""}`.toLowerCase();

        if (name.includes("glass") || name.includes("window") || name.includes("windscreen")) {
          object.material = materials.glass;
        } else if (name.includes("tire") || name.includes("tyre") || name.includes("rubber")) {
          object.material = materials.tire;
        } else if (name.includes("rim") || name.includes("wheel") || name.includes("alloy")) {
          object.material = materials.rim;
        } else if (name.includes("light") || name.includes("lamp")) {
          object.material = materials.light;
        } else {
          object.material = materials.paint;
        }
      }
    });
  }, [materials, scene]);

  return (
    <group rotation={compact ? [0.02, -0.72, 0] : [0.05, -1.08, 0]} scale={compact ? 0.95 : 1.15}>
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
        camera={{ position: compact ? [4.8, 2.0, 5.8] : [5.4, 2.2, 6.4], fov: compact ? 30 : 28 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      >
        <ambientLight intensity={1.25} />
        <directionalLight position={[4, 7, 5]} intensity={3.4} castShadow />
        <directionalLight position={[-5, 3, -3]} intensity={1.2} />
        <spotLight position={[0, 6, 7]} angle={0.55} penumbra={0.85} intensity={2.2} castShadow />
        <Environment preset="city" />
        <Suspense fallback={<ModelFallback />}>
          <CarModel compact={compact} />
          <ContactShadows
            position={[0, compact ? -1.34 : -1.62, 0]}
            opacity={0.42}
            scale={compact ? 9 : 11}
            blur={2.6}
            far={4}
            color="#050816"
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/car.glb");
