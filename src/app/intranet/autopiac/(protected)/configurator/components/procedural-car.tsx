"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CarConfig } from "./configurator-client";

type ProceduralCarProps = {
  config: CarConfig;
};

export function ProceduralCar({ config }: ProceduralCarProps) {
  const group = useRef<THREE.Group>(null);

  // Materials
  const paintMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: config.color,
    metalness: 0.8,
    roughness: 0.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  }), [config.color]);

  const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#111111",
    metalness: 0.9,
    roughness: 0.1,
    transmission: 0.9,
    transparent: true,
    opacity: 0.8,
  }), []);

  const blackPlastic = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#1a1a1a",
    roughness: 0.8,
    metalness: 0.1,
  }), []);

  const wheelMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: config.wheels === "aero" ? "#111" : "#888",
    metalness: 0.8,
    roughness: 0.3,
  }), [config.wheels]);

  const neonMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#00a3b5",
  }), []);

  const taillightMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#ff0000",
  }), []);

  const headlightMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#ffffff",
  }), []);

  // Wheel configuration
  const wheelRadius = config.wheels === "sport" ? 0.45 : 0.4;
  const wheelThickness = 0.3;

  // Simple animation for wheels if we wanted to drive it, 
  // but for configurator, usually static. We can add a slow turntable to the whole car.
  useFrame((state, delta) => {
    // Optional: Slow auto-rotate for presentation
    // if (group.current) group.current.rotation.y += delta * 0.1;
  });

  return (
    <group ref={group} position={[0, 0.4, 0]}>
      {/* Main Body (Lower) */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow material={paintMaterial}>
        <boxGeometry args={[1.9, 0.5, 4.2]} />
      </mesh>

      {/* Cabin (Upper/Glass) */}
      <mesh position={[0, 0.75, -0.2]} castShadow receiveShadow material={glassMaterial}>
        <boxGeometry args={[1.5, 0.4, 2.0]} />
      </mesh>

      {/* Technology Package: Roof Sensor / Lidar */}
      {config.packages.technology && (
        <mesh position={[0, 1.0, -0.2]} castShadow receiveShadow material={blackPlastic}>
          <boxGeometry args={[0.4, 0.1, 0.6]} />
          <mesh position={[0, 0.06, 0.2]} material={neonMaterial}>
            <boxGeometry args={[0.3, 0.02, 0.05]} />
          </mesh>
        </mesh>
      )}

      {/* M Sport Package: Aero Kit (Splitter & Spoiler) */}
      {config.packages.mSport && (
        <>
          {/* Front Splitter */}
          <mesh position={[0, 0.05, 2.15]} castShadow receiveShadow material={blackPlastic}>
            <boxGeometry args={[2.0, 0.05, 0.4]} />
          </mesh>
          {/* Rear Spoiler */}
          <mesh position={[0, 0.6, -2.0]} castShadow receiveShadow material={blackPlastic}>
            <boxGeometry args={[1.6, 0.05, 0.3]} />
            <mesh position={[0, -0.05, 0]} material={blackPlastic} rotation={[0.2, 0, 0]}>
              <boxGeometry args={[1.6, 0.1, 0.2]} />
            </mesh>
          </mesh>
        </>
      )}

      {/* Headlights */}
      <mesh position={[0.7, 0.4, 2.11]} material={headlightMaterial}>
        <boxGeometry args={[0.3, 0.1, 0.05]} />
      </mesh>
      <mesh position={[-0.7, 0.4, 2.11]} material={headlightMaterial}>
        <boxGeometry args={[0.3, 0.1, 0.05]} />
      </mesh>

      {/* Taillights */}
      <mesh position={[0, 0.4, -2.11]} material={taillightMaterial}>
        <boxGeometry args={[1.6, 0.1, 0.05]} />
      </mesh>

      {/* Wheels */}
      {[
        [0.9, 0, 1.3],
        [-0.9, 0, 1.3],
        [0.9, 0, -1.3],
        [-0.9, 0, -1.3],
      ].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          {/* Tire */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow material={blackPlastic}>
            <cylinderGeometry args={[wheelRadius, wheelRadius, wheelThickness, 32]} />
          </mesh>
          {/* Rim */}
          <mesh rotation={[0, 0, Math.PI / 2]} position={[pos[0] > 0 ? 0.05 : -0.05, 0, 0]} material={wheelMaterial}>
            <cylinderGeometry args={[wheelRadius * 0.7, wheelRadius * 0.7, wheelThickness * 1.05, 16]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
