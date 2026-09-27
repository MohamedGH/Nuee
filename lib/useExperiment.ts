"use client";

import { useEffect, useState } from "react";
import { assignVariant, getOrCreateVisitorId } from "@/lib/abtest";
import { trackExperimentExposure } from "@/lib/analytics";

/**
 * Assigne une variante d'expérience A/B pour le visiteur courant.
 * `ready` reste `false` jusqu'au montage (le tirage dépend de
 * localStorage, indisponible côté serveur) — les appelants doivent
 * afficher la variante de contrôle (`variants[0]`) tant que `ready`
 * est faux, pour éviter un écart d'hydratation React.
 *
 * @param experimentKey  Identifiant unique de l'expérience, ex. "cta-color".
 * @param variants        Variantes possibles ; la première sert de témoin
 *                        affiché avant que l'assignation ne soit prête.
 */
export function useExperiment<T extends string>(
  experimentKey: string,
  variants: readonly T[]
): { variant: T; ready: boolean } {
  const [variant, setVariant] = useState<T>(variants[0]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const visitorId = getOrCreateVisitorId();
    const assigned = assignVariant(visitorId, experimentKey, variants);
    setVariant(assigned);
    setReady(true);
    trackExperimentExposure(experimentKey, assigned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentKey]);

  return { variant, ready };
}
