"use client";

import { useEffect, useState } from "react";
import { assignWeightedVariant, getOrCreateVisitorId } from "@/lib/abtest";
import { trackExperimentExposure } from "@/lib/analytics";
import { experiments, type ExperimentName } from "@/lib/experiments";

/**
 * Assigne la variante d'une expérience du registre (lib/experiments.ts)
 * pour le visiteur courant.
 *
 * `ready` reste `false` jusqu'au montage (le tirage dépend de
 * localStorage, indisponible côté serveur) — affiche le témoin
 * (`variants[0].value`) tant que `ready` est faux, pour éviter un écart
 * d'hydratation React.
 *
 * Une expérience désactivée (`active: false` dans le registre) renvoie
 * toujours le témoin, sans tirage ni suivi d'exposition.
 *
 * Prévisualisation forcée pour le support/debug : ajouter
 * `?variant-<clé>=<valeur>` à l'URL (ex. `?variant-cta-color=brick`)
 * affiche cette variante sans passer par le hash — aucune exposition
 * n'est comptée dans ce cas, pour ne pas fausser les résultats. Lu
 * directement sur window.location plutôt que via useSearchParams, pour
 * ne pas imposer de limite <Suspense> aux pages qui utilisent ce hook.
 */
export function useExperiment<N extends ExperimentName>(
  name: N
): { variant: (typeof experiments)[N]["variants"][number]["value"]; ready: boolean } {
  const definition = experiments[name];
  const control = definition.variants[0].value;
  const [variant, setVariant] = useState(control);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!definition.active) {
      setVariant(control);
      setReady(true);
      return;
    }

    const forced =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get(`variant-${definition.key}`)
        : null;

    if (forced && definition.variants.some((v) => v.value === forced)) {
      setVariant(forced as typeof control);
      setReady(true);
      return; // Prévisualisation : pas de suivi d'exposition.
    }

    const visitorId = getOrCreateVisitorId();
    const assigned = assignWeightedVariant(visitorId, definition.key, definition.variants);
    setVariant(assigned);
    setReady(true);
    trackExperimentExposure(definition.key, assigned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  return { variant, ready };
}
