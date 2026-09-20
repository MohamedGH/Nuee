declare global {
  interface Navigator {
    globalPrivacyControl?: boolean;
  }
  interface Window {
    doNotTrack?: string;
  }
}

/**
 * True si le navigateur envoie un signal de refus explicite — Global
 * Privacy Control (juridiquement contraignant en Californie sous le
 * CPRA, à traiter comme un refus automatique sans même afficher de
 * bandeau) ou l'en-tête Do Not Track, plus ancien et non contraignant
 * mais correct de respecter quand il est présent.
 */
export function hasOptOutSignal(): boolean {
  if (typeof navigator === "undefined") return false;
  if (navigator.globalPrivacyControl === true) return true;
  const dnt = navigator.doNotTrack ?? window.doNotTrack;
  return dnt === "1" || dnt === "yes";
}
