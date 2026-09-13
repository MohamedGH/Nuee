"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import type { HautStyle } from "./types";
import { addFolds, makeFabricTexture, latheGeometry, MANNEQUIN_PROFILE, COAT_PROFILE } from "./geometry";

export type GarmentSelection = {
  haut: { style: HautStyle; color: string } | null;
  bas: { color: string } | null;
  robe: { color: string } | null;
  accessoire: { color: string } | null;
};

// Ton mat "buste de couturier" — volontairement neutre (pas une teinte de
// peau) : un vrai mannequin de boutique est une forme pleine, pas un corps.
const MANNEQUIN_TONE = "#DCD5C4";
const STAND_TONE = "#2A2722";

function useFabric(color: string) {
  return useMemo(() => makeFabricTexture(color), [color]);
}

function Mannequin() {
  const bodyGeo = useMemo(() => latheGeometry(MANNEQUIN_PROFILE), []);
  const legGeo = useMemo(
    () => addFolds(new THREE.CapsuleGeometry(0.095, 0.62, 6, 16), 0.004, 5),
    []
  );
  const armGeo = useMemo(
    () => addFolds(new THREE.CapsuleGeometry(0.052, 0.58, 6, 14), 0.004, 5),
    []
  );

  return (
    <group>
      {/* Buste, cou et tête — un seul solide de révolution, silhouette lisse */}
      <mesh geometry={bodyGeo} castShadow receiveShadow>
        <meshStandardMaterial color={MANNEQUIN_TONE} roughness={0.35} metalness={0.05} />
      </mesh>

      {/* Bras, légèrement écartés du corps */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          geometry={armGeo}
          position={[side * 0.29, 1.14, 0]}
          rotation={[0, 0, side * 0.16]}
          castShadow
        >
          <meshStandardMaterial color={MANNEQUIN_TONE} roughness={0.35} metalness={0.05} />
        </mesh>
      ))}

      {/* Jambes */}
      {[-1, 1].map((side) => (
        <mesh key={side} geometry={legGeo} position={[side * 0.1, 0.2, 0]} castShadow>
          <meshStandardMaterial color={MANNEQUIN_TONE} roughness={0.35} metalness={0.05} />
        </mesh>
      ))}

      {/* Pied / socle de présentation, comme un vrai mannequin de vitrine */}
      <mesh position={[0, -0.14, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.55, 12]} />
        <meshStandardMaterial color={STAND_TONE} roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, -0.42, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.24, 0.03, 32]} />
        <meshStandardMaterial color={STAND_TONE} roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  );
}

function Haut({ style, color }: { style: HautStyle; color: string }) {
  const texture = useFabric(color);

  const capsuleDims: Record<Exclude<HautStyle, "coat">, { radius: number; length: number; y: number }> = {
    jacket: { radius: 0.29, length: 0.62, y: 0.78 },
    knit: { radius: 0.26, length: 0.58, y: 0.82 },
    shirt: { radius: 0.25, length: 0.56, y: 0.83 },
  };

  const coatGeo = useMemo(
    () => (style === "coat" ? addFolds(latheGeometry(COAT_PROFILE), 0.01, 6) : null),
    [style]
  );
  const otherGeo = useMemo(() => {
    if (style === "coat") return null;
    const { radius, length } = capsuleDims[style];
    return addFolds(new THREE.CapsuleGeometry(radius, length, 8, 18), 0.012, 7);
  }, [style]);

  const sleeveGeo = useMemo(
    () => addFolds(new THREE.CapsuleGeometry(0.1, 0.24, 6, 12), 0.008, 6),
    []
  );

  const y = style === "coat" ? 0 : capsuleDims[style].y;
  const length = style === "coat" ? 1.3 : capsuleDims[style].length;

  return (
    <group>
      <mesh geometry={(coatGeo ?? otherGeo)!} position={style === "coat" ? [0, 0, 0] : [0, y, 0]} castShadow>
        <meshStandardMaterial map={texture} color={color} roughness={0.92} metalness={0} />
      </mesh>
      {/* Manches courtes indicatives */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          geometry={sleeveGeo}
          position={[side * 0.32, (style === "coat" ? 1.28 : y + length / 2 - 0.06), 0]}
          rotation={[0, 0, side * 0.25]}
          castShadow
        >
          <meshStandardMaterial map={texture} color={color} roughness={0.92} metalness={0} />
        </mesh>
      ))}
    </group>
  );
}

function Bas({ color }: { color: string }) {
  const texture = useFabric(color);
  const legGeo = useMemo(
    () => addFolds(new THREE.CapsuleGeometry(0.115, 0.74, 8, 16), 0.01, 6),
    []
  );

  return (
    <group>
      {[-1, 1].map((side) => (
        <mesh key={side} geometry={legGeo} position={[side * 0.1, 0.2, 0]} castShadow>
          <meshStandardMaterial map={texture} color={color} roughness={0.92} metalness={0} />
        </mesh>
      ))}
    </group>
  );
}

function Robe({ color }: { color: string }) {
  const texture = useFabric(color);
  const geo = useMemo(() => {
    const g = new THREE.ConeGeometry(0.34, 1.35, 24, 8, true);
    return addFolds(g, 0.014, 8);
  }, []);

  return (
    <mesh geometry={geo} position={[0, 0.55, 0]} castShadow>
      <meshStandardMaterial map={texture} color={color} roughness={0.92} metalness={0} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Echarpe({ color }: { color: string }) {
  const texture = useFabric(color);
  return (
    <mesh position={[0, 1.44, 0.02]} rotation={[Math.PI / 2.4, 0, 0]} castShadow>
      <torusGeometry args={[0.1, 0.032, 10, 24]} />
      <meshStandardMaterial map={texture} color={color} roughness={0.95} metalness={0} />
    </mesh>
  );
}

function Scene({ selection }: { selection: GarmentSelection }) {
  const showHautBas = !selection.robe;

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 5, 4]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 2, -3]} intensity={0.4} />
      <directionalLight position={[0, 2, -4]} intensity={0.3} />
      <pointLight position={[0, 1, 2]} intensity={0.3} />

      <group position={[0, -1, 0]}>
        <Mannequin />
        {showHautBas && selection.haut && (
          <Haut style={selection.haut.style} color={selection.haut.color} />
        )}
        {showHautBas && selection.bas && <Bas color={selection.bas.color} />}
        {selection.robe && <Robe color={selection.robe.color} />}
        {selection.accessoire && <Echarpe color={selection.accessoire.color} />}
      </group>

      <ContactShadows position={[0, -1.42, 0]} opacity={0.4} scale={2.5} blur={2} far={1.5} />
      <OrbitControls
        enablePan={false}
        minDistance={1.6}
        maxDistance={4}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.8}
        target={[0, 0, 0]}
      />
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
