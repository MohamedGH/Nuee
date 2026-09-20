"use client";

import { useEffect } from "react";
import { observeBrowsingTopics, type BrowsingTopic } from "@/lib/topics";

/**
 * Observe les topics du navigateur (API Topics / Privacy Sandbox) au
 * montage. Autonome et réutilisable : ne connaît ni GA4 ni aucun autre
 * consommateur — c'est à l'appelant de décider quoi faire du résultat via
 * onObserved (envoyer à un analytics, logger, transmettre à un partenaire
 * pub...). Ne rend rien à l'écran.
 *
 * @param onObserved  Appelé avec les topics observés (tableau vide si
 *                     l'API n'est pas supportée ou n'a rien à renvoyer).
 */
export default function BrowsingTopics({
  onObserved,
}: {
  onObserved: (topics: BrowsingTopic[]) => void;
}) {
  useEffect(() => {
    let cancelled = false;
    observeBrowsingTopics().then((topics) => {
      if (!cancelled) onObserved(topics ?? []);
    });
    return () => {
      cancelled = true;
    };
    // onObserved volontairement absent des dépendances : n'observer qu'une
    // fois par montage, pas à chaque re-render du parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
