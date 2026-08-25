"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment } from "@react-three/drei";
import type { HautStyle, Slot } from "./types";

export type GarmentSelection = {
  haut: { style: HautStyle; color: string } | null;
  bas: { color: string } | null;
  robe: { color: string } | null;
  accessoire: { color: string } | null;
};

const SKIN = "#D9CCB8";

function Mannequin() {
  return (
    <group>
      {/* Tête */}
      <mesh position={[0, 1.56, 0]} castShadow>
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshStandardMaterial color={SKIN} roughness={0.85} />
      </mesh>
      {/* Cou */}
      <mesh position={[0, 1.38, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.14, 16]} />
        <meshStandardMaterial color={SKIN} roughness={0.85} />
      </mesh>
      {/* Torse (base, recouvert par le haut/la robe le cas échéant) */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.55, 6, 12]} />
        <meshStandardMaterial color={SKIN} roughness={0.85} />
      </mesh>
      {/* Bassin */}
      <mesh position={[0, 0.58, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.12, 6, 12]} />
        <meshStandardMaterial color={SKIN} roughness={0.85} />
      </mesh>
      {/* Bras */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.32, 0.92, 0]}
          rotation={[0, 0, side * 0.18]}
          castShadow
        >
          <capsuleGeometry args={[0.055, 0.62, 6, 10]} />
          <meshStandardMaterial color={SKIN} roughness={0.85} />
        </mesh>
      ))}
      {/* Jambes */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.12, 0.02, 0]} castShadow>
          <capsuleGeometry args={[0.09, 0.72, 6, 10]} />
          <meshStandardMaterial color={SKIN} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function Haut({ style, color }: { style: HautStyle; color: string }) {
  const dims: Record<HautStyle, { radius: number; length: number; y: number }> = {
    coat: { radius: 0.32, length: 1.15, y: 0.42 },
    jacket: { radius: 0.29, length: 0.62, y: 0.78 },
    knit: { radius: 0.26, length: 0.58, y: 0.82 },
    shirt: { radius: 0.25, length: 0.56, y: 0.83 },
  };
  const { radius, length, y } = dims[style];

  return (
    <group>
      <mesh position={[0, y, 0]} castShadow>
        <capsuleGeometry args={[radius, length, 6, 12]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* Manches courtes indicatives, pour distinguer le haut du corps nu */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.33, y + length / 2 - 0.05, 0]}
          rotation={[0, 0, side * 0.25]}
          castShadow
        >
          <capsuleGeometry args={[0.09, 0.22, 6, 10]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Bas({ color }: { color: string }) {
  return (
    <group>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.12, 0.02, 0]} castShadow>
          <capsuleGeometry args={[0.105, 0.74, 6, 10]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Robe({ color }: { color: string }) {
  return (
    <mesh position={[0, 0.55, 0]} castShadow>
      <coneGeometry args={[0.34, 1.35, 16, 1, true]} />
      <meshStandardMaterial color={color} roughness={0.9} side={2} />
    </mesh>
  );
}

function Echarpe({ color }: { color: string }) {
  return (
    <mesh position={[0, 1.34, 0.02]} rotation={[Math.PI / 2.4, 0, 0]} castShadow>
      <torusGeometry args={[0.11, 0.035, 10, 24]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  );
}

function Scene({ selection }: { selection: GarmentSelection }) {
  // Une robe remplace visuellement le haut et le bas.
  const showHautBas = !selection.robe;

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 4]} intensity={1.1} castShadow />
      <directionalLight position={[-3, 2, -3]} intensity={0.35} />

      <group position={[0, -1, 0]}>
        <Mannequin />
        {showHautBas && selection.haut && (
          <Haut style={selection.haut.style} color={selection.haut.color} />
        )}
        {showHautBas && selection.bas && <Bas color={selection.bas.color} />}
        {selection.robe && <Robe color={selection.robe.color} />}
        {selection.accessoire && <Echarpe color={selection.accessoire.color} />}
      </group>

      <ContactShadows position={[0, -1, 0]} opacity={0.35} scale={2.5} blur={2} far={1.5} />
      <OrbitControls
        enablePan={false}
        minDistance={1.6}
        maxDistance={4}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.8}
        target={[0, 0, 0]}
      />
      <Environment preset="studio" />
    </>
  );
}

export default function MannequinScene({ selection }: { selection: GarmentSelection }) {
  const key = useMemo(() => JSON.stringify(selection), [selection]);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 0.1, 2.6], fov: 35 }}
      style={{ background: "transparent" }}
    >
      <Scene key={key} selection={selection} />
    </Canvas>
  );
}
