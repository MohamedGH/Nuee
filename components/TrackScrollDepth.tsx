"use client";

import { useEffect } from "react";
import { trackScrollDepth } from "@/lib/analytics";
import { computeScrollPercent, thresholdsCrossed } from "@/lib/scrollDepth";

/**
 * Suit la profondeur de défilement (25/50/75/100 %), un événement par
 * palier et par page vue. `resetKey` doit changer quand le contenu change
 * sans que le composant soit démonté (ex. navigation d'une fiche produit à
 * une autre : Next réutilise l'instance) — sinon les paliers déjà
 * déclenchés resteraient « consommés » pour la page suivante.
 */
export default function TrackScrollDepth({
  resetKey,
  contentId,
}: {
  resetKey?: string;
  contentId?: string;
}) {
  useEffect(() => {
    const fired = new Set<number>(); // local à l'effet : repart de zéro à chaque resetKey
    let frame = 0;

    function measure() {
      frame = 0;
      const percent = computeScrollPercent(
        window.scrollY,
        window.innerHeight,
        document.documentElement.scrollHeight
      );
      for (const threshold of thresholdsCrossed(percent, fired)) {
        fired.add(threshold);
        trackScrollDepth(threshold, window.location.pathname, contentId);
      }
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(measure);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // page restaurée déjà défilée (retour arrière du navigateur)
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [resetKey, contentId]);

  return null;
}
