"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { GarmentSelection } from "./MannequinScene";
import MannequinErrorBoundary from "./MannequinErrorBoundary";

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

function ErrorMessage() {
  return (
    <div className="w-full h-full flex items-center justify-center p-6 text-center">
      <p className="font-mono text-xs text-ink-soft leading-relaxed">
        L'aperçu 3D n'a pas pu s'afficher (WebGL indisponible ou bloqué par
        le navigateur). Vous pouvez toujours composer et commander la tenue
        ci-contre.
      </p>
    </div>
  );
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export default function Mannequin3D({ selection }: { selection: GarmentSelection }) {
  const [webglOk, setWebglOk] = useState<boolean | null>(null);

  useEffect(() => {
    setWebglOk(hasWebGL());
  }, []);

  return (
    <div className="w-full aspect-[3/4] bg-line/40">
      {webglOk === false ? (
        <ErrorMessage />
      ) : (
        <MannequinErrorBoundary fallback={<ErrorMessage />}>
          <MannequinScene selection={selection} />
        </MannequinErrorBoundary>
      )}
    </div>
  );
}
