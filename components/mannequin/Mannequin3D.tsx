"use client";

import dynamic from "next/dynamic";
import type { GarmentSelection } from "./MannequinScene";

const MannequinScene = dynamic(() => import("./MannequinScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <p className="font-mono text-xs tracking-tag uppercase text-muted">
        Chargement du mannequin…
      </p>
    </div>
  ),
});

import type { PosePreset } from "./types";

export default function Mannequin3D({
  selection,
  pose = "neutral",
}: {
  selection: GarmentSelection;
  pose?: PosePreset;
}) {
  return (
    <div className="w-full aspect-[3/4] bg-line/40">
      <MannequinScene selection={selection} pose={pose} />
    </div>
  );
}
