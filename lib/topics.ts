// API expérimentale (Chrome uniquement, HTTPS requis en production).
// Sans partenaire publicitaire consommant ces topics, cet appel sert
// surtout à: (1) faire connaître ce site au navigateur pour les futurs
// calculs d'epoch, (2) préparer l'intégration si un partenaire pub arrive.
// Voir README pour le détail des limites actuelles.

export type BrowsingTopic = { topic: number; taxonomyVersion: string; version: string };

declare global {
  interface Document {
    browsingTopics?: () => Promise<BrowsingTopic[]>;
  }
}

export function supportsBrowsingTopics(): boolean {
  return typeof document !== "undefined" && typeof document.browsingTopics === "function";
}

export async function observeBrowsingTopics(): Promise<BrowsingTopic[] | null> {
  if (!supportsBrowsingTopics()) return null;
  try {
    // L'appel lui-même — au-delà de la valeur de retour — inscrit ce site
    // comme "observateur" pour l'epoch en cours, ce qui est la moitié utile
    // du mécanisme même sans consommateur en aval.
    return await document.browsingTopics!();
  } catch {
    // Refusé par l'utilisateur, contexte non sécurisé, ou navigateur sans
    // historique suffisant pour classer des topics — cas normal, pas une erreur.
    return null;
  }
}
