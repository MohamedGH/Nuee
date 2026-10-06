// Complète lib/abtest.ts : une fois les chiffres relevés dans GA4
// (visiteurs/conversions par variante — voir /admin/modules et le README,
// section "Tests A/B"), ce module répond à la question qui suit
// naturellement : l'écart observé est-il réel, ou juste du bruit
// d'échantillonnage ? Logique pure, sans dépendance à GA4 ni à aucune
// lecture réseau — les chiffres sont saisis à la main (voir
// /admin/experiments), pas récupérés automatiquement (ça demanderait une
// intégration OAuth à l'API de données GA4, hors périmètre ici).

export type VariantSample = {
  /** Nombre de visiteurs exposés à cette variante. */
  visitors: number;
  /** Nombre de conversions parmi ces visiteurs. */
  conversions: number;
};

export type SignificanceResult = {
  controlRate: number;
  treatmentRate: number;
  /** Écart relatif (ex. 0.12 = +12%), positif si le traitement fait mieux que le témoin. */
  relativeUplift: number;
  zScore: number;
  /** Probabilité d'observer un écart au moins aussi grand si les deux variantes étaient en réalité identiques. */
  pValue: number;
  /** p < 0,05, soit un niveau de confiance de 95% — le seuil usuel en A/B testing. */
  significant: boolean;
  confidenceLevel: number;
};

/** Fonction d'erreur (erf), approximation d'Abramowitz & Stegun 7.1.26 — précision suffisante pour un seuil de signification, pas pour un usage scientifique. */
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1 / (1 + p * absX);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return sign * y;
}

/** Fonction de répartition de la loi normale centrée réduite. */
function normalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

export function conversionRate(sample: VariantSample): number {
  if (sample.visitors <= 0) return 0;
  return sample.conversions / sample.visitors;
}

/**
 * Test Z à deux proportions (bilatéral) — le test standard pour comparer
 * deux taux de conversion. Lève une erreur si un échantillon est vide ou
 * si des conversions dépassent le nombre de visiteurs (données
 * incohérentes plutôt qu'un résultat trompeur en silence).
 */
export function twoProportionZTest(
  control: VariantSample,
  treatment: VariantSample
): SignificanceResult {
  for (const [label, s] of [
    ["témoin", control],
    ["traitement", treatment],
  ] as const) {
    if (s.visitors <= 0) throw new Error(`twoProportionZTest: ${label} doit avoir au moins 1 visiteur`);
    if (s.conversions < 0 || s.conversions > s.visitors) {
      throw new Error(`twoProportionZTest: conversions incohérentes pour le ${label}`);
    }
  }

  const p1 = conversionRate(control);
  const p2 = conversionRate(treatment);
  const pooled =
    (control.conversions + treatment.conversions) / (control.visitors + treatment.visitors);
  const standardError = Math.sqrt(
    pooled * (1 - pooled) * (1 / control.visitors + 1 / treatment.visitors)
  );

  // Écart nul des deux côtés (ex. 0 conversion partout) : pas d'écart
  // mesurable, donc non significatif par définition plutôt qu'une
  // division par zéro.
  const zScore = standardError === 0 ? 0 : (p2 - p1) / standardError;
  const pValue = 2 * (1 - normalCdf(Math.abs(zScore)));
  const relativeUplift = p1 === 0 ? 0 : (p2 - p1) / p1;

  return {
    controlRate: p1,
    treatmentRate: p2,
    relativeUplift,
    zScore,
    pValue,
    significant: pValue < 0.05,
    confidenceLevel: 1 - pValue,
  };
}
