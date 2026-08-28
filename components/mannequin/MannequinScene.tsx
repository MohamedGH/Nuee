"use client";

import { useMemo, useEffect, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { HautStyle, PosePreset } from "./types";

export type GarmentSelection = {
  haut: { style: HautStyle; color: string } | null;
  bas: { color: string } | null;
  robe: { color: string } | null;
  accessoire: { color: string } | null;
};

const MANNEQUIN_MODEL_PATH = "/models/mixamo_mannequin.glb";

// Preload the GLTF model
useGLTF.preload(MANNEQUIN_MODEL_PATH);

function applyPose(boneMap: Record<string, THREE.Bone>, pose: PosePreset) {
  // Reset key bone rotations
  Object.values(boneMap).forEach((b) => b.rotation.set(0, 0, 0));

  if (pose === "model") {
    // Model pose: fashion stance, hands near hips/waist
    if (boneMap["mixamorigHips"]) boneMap["mixamorigHips"].rotation.y = 0.15;
    if (boneMap["mixamorigSpine"]) boneMap["mixamorigSpine"].rotation.z = -0.05;

    // Right arm posed on hip
    if (boneMap["mixamorigRightShoulder"]) boneMap["mixamorigRightShoulder"].rotation.z = -0.2;
    if (boneMap["mixamorigRightArm"]) {
      boneMap["mixamorigRightArm"].rotation.z = -0.6;
      boneMap["mixamorigRightArm"].rotation.x = 0.3;
    }
    if (boneMap["mixamorigRightForeArm"]) boneMap["mixamorigRightForeArm"].rotation.z = -1.1;

    // Left arm relaxed backwards
    if (boneMap["mixamorigLeftArm"]) {
      boneMap["mixamorigLeftArm"].rotation.z = 0.25;
      boneMap["mixamorigLeftArm"].rotation.x = -0.15;
    }
    if (boneMap["mixamorigLeftForeArm"]) boneMap["mixamorigLeftForeArm"].rotation.z = 0.2;

    // Legs: right leg slightly bent forward
    if (boneMap["mixamorigRightUpLeg"]) {
      boneMap["mixamorigRightUpLeg"].rotation.x = 0.15;
      boneMap["mixamorigRightUpLeg"].rotation.z = 0.05;
    }
    if (boneMap["mixamorigRightLeg"]) boneMap["mixamorigRightLeg"].rotation.x = -0.2;

    if (boneMap["mixamorigLeftUpLeg"]) boneMap["mixamorigLeftUpLeg"].rotation.x = -0.05;
  } else if (pose === "walk") {
    // Runway walk stance
    if (boneMap["mixamorigHips"]) boneMap["mixamorigHips"].rotation.y = -0.12;
    if (boneMap["mixamorigSpine"]) boneMap["mixamorigSpine"].rotation.y = 0.12;

    // Left leg forward, right leg back
    if (boneMap["mixamorigLeftUpLeg"]) boneMap["mixamorigLeftUpLeg"].rotation.x = 0.35;
    if (boneMap["mixamorigLeftLeg"]) boneMap["mixamorigLeftLeg"].rotation.x = -0.1;

    if (boneMap["mixamorigRightUpLeg"]) boneMap["mixamorigRightUpLeg"].rotation.x = -0.3;
    if (boneMap["mixamorigRightLeg"]) boneMap["mixamorigRightLeg"].rotation.x = -0.25;

    // Arm swing
    if (boneMap["mixamorigRightArm"]) {
      boneMap["mixamorigRightArm"].rotation.x = 0.4;
      boneMap["mixamorigRightArm"].rotation.z = -0.2;
    }
    if (boneMap["mixamorigLeftArm"]) {
      boneMap["mixamorigLeftArm"].rotation.x = -0.35;
      boneMap["mixamorigLeftArm"].rotation.z = 0.2;
    }
  } else {
    // Neutral standing pose: relaxed arms along body
    if (boneMap["mixamorigLeftArm"]) boneMap["mixamorigLeftArm"].rotation.z = 0.15;
    if (boneMap["mixamorigLeftForeArm"]) boneMap["mixamorigLeftForeArm"].rotation.z = 0.1;
    if (boneMap["mixamorigRightArm"]) boneMap["mixamorigRightArm"].rotation.z = -0.15;
    if (boneMap["mixamorigRightForeArm"]) boneMap["mixamorigRightForeArm"].rotation.z = -0.1;
  }
}

// Helper to assign skin weights based on Y-coordinate or joint proximity
function assignSkinning(
  geometry: THREE.BufferGeometry,
  weightFn: (pos: THREE.Vector3) => { indices: number[]; weights: number[] }
) {
  const posAttr = geometry.attributes.position;
  const count = posAttr.count;
  const skinIndices = new Uint16Array(count * 4);
  const skinWeights = new Float32Array(count * 4);

  const pos = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    pos.fromBufferAttribute(posAttr, i);
    const { indices, weights } = weightFn(pos);
    for (let j = 0; j < 4; j++) {
      skinIndices[i * 4 + j] = indices[j] ?? 0;
      skinWeights[i * 4 + j] = weights[j] ?? 0;
    }
  }

  geometry.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(skinIndices, 4));
  geometry.setAttribute("skinWeight", new THREE.Float32BufferAttribute(skinWeights, 4));
}

function RiggedMixamoModel({
  pose,
  onLoaded,
}: {
  pose: PosePreset;
  onLoaded: (skeleton: THREE.Skeleton, boneMap: Record<string, THREE.Bone>) => void;
}) {
  const { scene } = useGLTF(MANNEQUIN_MODEL_PATH);

  const { skeleton, boneMap, clonedScene } = useMemo(() => {
    const clone = scene.clone(true);
    const boneMap: Record<string, THREE.Bone> = {};
    const bones: THREE.Bone[] = [];
    let mainSkinnedMesh: THREE.SkinnedMesh | null = null;

    clone.traverse((child) => {
      if ((child as THREE.Bone).isBone) {
        const bone = child as THREE.Bone;
        boneMap[bone.name] = bone;
        bones.push(bone);
      }
      if ((child as THREE.SkinnedMesh).isSkinnedMesh && !mainSkinnedMesh) {
        mainSkinnedMesh = child as THREE.SkinnedMesh;
      }
    });

    const skeleton: THREE.Skeleton = (mainSkinnedMesh as THREE.SkinnedMesh | null)?.skeleton || new THREE.Skeleton(bones);
    return { skeleton, boneMap, clonedScene: clone };
  }, [scene]);

  useEffect(() => {
    if (skeleton && boneMap) {
      onLoaded(skeleton, boneMap);
    }
  }, [skeleton, boneMap, onLoaded]);

  useEffect(() => {
    if (boneMap) {
      applyPose(boneMap, pose);
    }
  }, [boneMap, pose]);

  return <primitive object={clonedScene} scale={1} position={[0, -0.95, 0]} />;
}

// Rigged Garment Components bound to the Mixamo Skeleton
function RiggedHaut({
  style,
  color,
  skeleton,
}: {
  style: HautStyle;
  color: string;
  skeleton: THREE.Skeleton;
}) {
  const mesh = useMemo(() => {
    const dims: Record<HautStyle, { radius: number; length: number; y: number }> = {
      coat: { radius: 0.26, length: 0.85, y: 0.85 },
      jacket: { radius: 0.25, length: 0.58, y: 1.0 },
      knit: { radius: 0.24, length: 0.55, y: 1.02 },
      shirt: { radius: 0.235, length: 0.53, y: 1.03 },
    };
    const { radius, length, y } = dims[style];

    const geometries: THREE.BufferGeometry[] = [];

    // Torso part of top
    const torsoPart = new THREE.CapsuleGeometry(radius, length, 8, 16);
    torsoPart.translate(0, y, 0);
    assignSkinning(torsoPart, (pos) => {
      if (pos.y > 1.3) return { indices: [3, 2, 6, 9], weights: [0.5, 0.3, 0.1, 0.1] };
      if (pos.y > 1.1) return { indices: [2, 1, 3, 0], weights: [0.5, 0.3, 0.1, 0.1] };
      if (pos.y > 0.9) return { indices: [1, 0, 2, 0], weights: [0.5, 0.3, 0.2, 0] };
      return { indices: [0, 1, 12, 14], weights: [0.6, 0.2, 0.1, 0.1] };
    });
    geometries.push(torsoPart);

    // Left Sleeve
    const leftSleeve = new THREE.CapsuleGeometry(0.07, 0.3, 6, 10);
    leftSleeve.translate(0.24, 1.35, 0);
    assignSkinning(leftSleeve, () => ({
      indices: [7, 6, 8, 3],
      weights: [0.65, 0.2, 0.1, 0.05],
    }));
    geometries.push(leftSleeve);

    // Right Sleeve
    const rightSleeve = new THREE.CapsuleGeometry(0.07, 0.3, 6, 10);
    rightSleeve.translate(-0.24, 1.35, 0);
    assignSkinning(rightSleeve, () => ({
      indices: [10, 9, 11, 3],
      weights: [0.65, 0.2, 0.1, 0.05],
    }));
    geometries.push(rightSleeve);

    const mergedGeom = createMergedGeometry(geometries);
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.8,
      metalness: 0.1,
    });

    const sMesh = new THREE.SkinnedMesh(mergedGeom, material);
    sMesh.bind(skeleton);
    sMesh.castShadow = true;
    return sMesh;
  }, [style, color, skeleton]);

  return <primitive object={mesh} position={[0, -0.95, 0]} />;
}

function RiggedBas({ color, skeleton }: { color: string; skeleton: THREE.Skeleton }) {
  const mesh = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];

    // Waist / Pelvis region of pants
    const waistGeom = new THREE.CapsuleGeometry(0.21, 0.15, 6, 10);
    waistGeom.translate(0, 0.78, 0);
    assignSkinning(waistGeom, () => ({
      indices: [0, 1, 12, 14],
      weights: [0.6, 0.2, 0.1, 0.1],
    }));
    geometries.push(waistGeom);

    // Left leg pants
    const leftThighPants = new THREE.CapsuleGeometry(0.1, 0.36, 6, 10);
    leftThighPants.translate(0.12, 0.65, 0);
    assignSkinning(leftThighPants, () => ({
      indices: [12, 0, 13, 0],
      weights: [0.75, 0.15, 0.1, 0],
    }));
    geometries.push(leftThighPants);

    const leftShinPants = new THREE.CapsuleGeometry(0.088, 0.36, 6, 10);
    leftShinPants.translate(0.12, 0.25, 0);
    assignSkinning(leftShinPants, () => ({
      indices: [13, 12, 0, 0],
      weights: [0.85, 0.15, 0, 0],
    }));
    geometries.push(leftShinPants);

    // Right leg pants
    const rightThighPants = new THREE.CapsuleGeometry(0.1, 0.36, 6, 10);
    rightThighPants.translate(-0.12, 0.65, 0);
    assignSkinning(rightThighPants, () => ({
      indices: [14, 0, 15, 0],
      weights: [0.75, 0.15, 0.1, 0],
    }));
    geometries.push(rightThighPants);

    const rightShinPants = new THREE.CapsuleGeometry(0.088, 0.36, 6, 10);
    rightShinPants.translate(-0.12, 0.25, 0);
    assignSkinning(rightShinPants, () => ({
      indices: [15, 14, 0, 0],
      weights: [0.85, 0.15, 0, 0],
    }));
    geometries.push(rightShinPants);

    const mergedGeom = createMergedGeometry(geometries);
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.85,
    });

    const sMesh = new THREE.SkinnedMesh(mergedGeom, material);
    sMesh.bind(skeleton);
    sMesh.castShadow = true;
    return sMesh;
  }, [color, skeleton]);

  return <primitive object={mesh} position={[0, -0.95, 0]} />;
}

function RiggedRobe({ color, skeleton }: { color: string; skeleton: THREE.Skeleton }) {
  const mesh = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];

    // Upper dress bodice
    const bodiceGeom = new THREE.CapsuleGeometry(0.23, 0.45, 8, 14);
    bodiceGeom.translate(0, 1.05, 0);
    assignSkinning(bodiceGeom, (pos) => {
      if (pos.y > 1.2) return { indices: [3, 2, 6, 9], weights: [0.5, 0.3, 0.1, 0.1] };
      return { indices: [2, 1, 0, 0], weights: [0.5, 0.3, 0.2, 0] };
    });
    geometries.push(bodiceGeom);

    // Dress skirt
    const skirtGeom = new THREE.ConeGeometry(0.38, 0.9, 20, 10, true);
    skirtGeom.translate(0, 0.65, 0);
    assignSkinning(skirtGeom, (pos) => {
      if (pos.y > 0.8) return { indices: [0, 1, 12, 14], weights: [0.6, 0.2, 0.1, 0.1] };
      return { indices: [0, 12, 14, 1], weights: [0.4, 0.25, 0.25, 0.1] };
    });
    geometries.push(skirtGeom);

    const mergedGeom = createMergedGeometry(geometries);
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.75,
      side: THREE.DoubleSide,
    });

    const sMesh = new THREE.SkinnedMesh(mergedGeom, material);
    sMesh.bind(skeleton);
    sMesh.castShadow = true;
    return sMesh;
  }, [color, skeleton]);

  return <primitive object={mesh} position={[0, -0.95, 0]} />;
}

function RiggedAccessoire({ color, skeleton }: { color: string; skeleton: THREE.Skeleton }) {
  const mesh = useMemo(() => {
    const geom = new THREE.TorusGeometry(0.11, 0.04, 12, 24);
    geom.rotateX(Math.PI / 2.4);
    geom.translate(0, 1.48, 0.02);
    assignSkinning(geom, () => ({
      indices: [4, 3, 5, 0],
      weights: [0.7, 0.2, 0.1, 0],
    }));

    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.9,
    });

    const sMesh = new THREE.SkinnedMesh(geom, material);
    sMesh.bind(skeleton);
    sMesh.castShadow = true;
    return sMesh;
  }, [color, skeleton]);

  return <primitive object={mesh} position={[0, -0.95, 0]} />;
}

function createMergedGeometry(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let totalVertices = 0;
  let totalIndices = 0;

  geometries.forEach((g) => {
    totalVertices += g.attributes.position.count;
    if (g.index) totalIndices += g.index.count;
  });

  const positions = new Float32Array(totalVertices * 3);
  const normals = new Float32Array(totalVertices * 3);
  const uvs = new Float32Array(totalVertices * 2);
  const skinIndices = new Uint16Array(totalVertices * 4);
  const skinWeights = new Float32Array(totalVertices * 4);
  const indices = totalIndices > 0 ? new Uint32Array(totalIndices) : null;

  let vertexOffset = 0;
  let indexOffset = 0;

  geometries.forEach((g) => {
    const pos = g.attributes.position;
    const norm = g.attributes.normal;
    const uv = g.attributes.uv;
    const sIdx = g.attributes.skinIndex;
    const sWgt = g.attributes.skinWeight;
    const idx = g.index;

    for (let i = 0; i < pos.count; i++) {
      const vIndex = vertexOffset + i;

      positions[vIndex * 3] = pos.getX(i);
      positions[vIndex * 3 + 1] = pos.getY(i);
      positions[vIndex * 3 + 2] = pos.getZ(i);

      if (norm) {
        normals[vIndex * 3] = norm.getX(i);
        normals[vIndex * 3 + 1] = norm.getY(i);
        normals[vIndex * 3 + 2] = norm.getZ(i);
      }

      if (uv) {
        uvs[vIndex * 2] = uv.getX(i);
        uvs[vIndex * 2 + 1] = uv.getY(i);
      }

      if (sIdx && sWgt) {
        skinIndices[vIndex * 4] = sIdx.getX(i);
        skinIndices[vIndex * 4 + 1] = sIdx.getY(i);
        skinIndices[vIndex * 4 + 2] = sIdx.getZ(i);
        skinIndices[vIndex * 4 + 3] = sIdx.getW(i);

        skinWeights[vIndex * 4] = sWgt.getX(i);
        skinWeights[vIndex * 4 + 1] = sWgt.getY(i);
        skinWeights[vIndex * 4 + 2] = sWgt.getZ(i);
        skinWeights[vIndex * 4 + 3] = sWgt.getW(i);
      }
    }

    if (idx && indices) {
      for (let i = 0; i < idx.count; i++) {
        indices[indexOffset + i] = idx.getX(i) + vertexOffset;
      }
      indexOffset += idx.count;
    }

    vertexOffset += pos.count;
  });

  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  merged.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  merged.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  merged.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(skinIndices, 4));
  merged.setAttribute("skinWeight", new THREE.Float32BufferAttribute(skinWeights, 4));
  if (indices) merged.setIndex(new THREE.BufferAttribute(indices, 1));

  return merged;
}

function Scene({ selection, pose = "neutral" }: { selection: GarmentSelection; pose?: PosePreset }) {
  const [skeleton, setSkeleton] = useState<THREE.Skeleton | null>(null);

  const handleLoaded = useCallback((skel: THREE.Skeleton) => {
    setSkeleton(skel);
  }, []);

  const showHautBas = !selection.robe;

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 4]} intensity={1.1} castShadow />
      <directionalLight position={[-3, 2, -3]} intensity={0.35} />

      <RiggedMixamoModel pose={pose} onLoaded={handleLoaded} />

      {skeleton && (
        <>
          {showHautBas && selection.haut && (
            <RiggedHaut
              style={selection.haut.style}
              color={selection.haut.color}
              skeleton={skeleton}
            />
          )}
          {showHautBas && selection.bas && (
            <RiggedBas color={selection.bas.color} skeleton={skeleton} />
          )}
          {selection.robe && <RiggedRobe color={selection.robe.color} skeleton={skeleton} />}
          {selection.accessoire && (
            <RiggedAccessoire color={selection.accessoire.color} skeleton={skeleton} />
          )}
        </>
      )}

      <ContactShadows position={[0, -1, 0]} opacity={0.35} scale={2.5} blur={2} far={1.5} />
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

export default function MannequinScene({
  selection,
  pose = "neutral",
}: {
  selection: GarmentSelection;
  pose?: PosePreset;
}) {
  const key = useMemo(() => JSON.stringify({ selection, pose }), [selection, pose]);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 0.1, 2.6], fov: 35 }}
      style={{ background: "transparent" }}
    >
      <Scene key={key} selection={selection} pose={pose} />
    </Canvas>
  );
}
