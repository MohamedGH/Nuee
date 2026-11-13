export const SCROLL_THRESHOLDS = [25, 50, 75, 100] as const;

/**
 * Pourcentage de la page défilé, à partir des mesures DOM brutes.
 * Pure — testable sans jsdom ni événement de scroll réel.
 *
 * Une page qui tient entièrement dans l'écran n'a rien à défiler : on
 * renvoie 0 (aucun signal d'engagement). Renvoyer 100, comme le faisait
 * une version antérieure, déclenchait les quatre paliers d'un coup au
 * montage de toute page courte — du bruit pris pour de la lecture.
 */
export function computeScrollPercent(
  scrollY: number,
  viewportHeight: number,
  documentHeight: number
): number {
  const scrollable = documentHeight - viewportHeight;
  if (scrollable <= 0) return 0;
  const percent = (scrollY / scrollable) * 100;
  return Math.min(100, Math.max(0, Math.round(percent)));
}

/**
 * Paliers nouvellement franchis depuis la dernière mesure — chacun n'est
 * renvoyé qu'une fois (déduplication), dans l'ordre croissant, y compris
 * quand le défilement en saute plusieurs d'un coup (molette rapide).
 */
export function thresholdsCrossed(percent: number, alreadyFired: ReadonlySet<number>): number[] {
  return SCROLL_THRESHOLDS.filter((t) => percent >= t && !alreadyFired.has(t));
}
