// Module A/B testing de première partie — pas de dépendance à un outil
// tiers (Google Optimize est arrêté depuis 2023 ; Optimizely/VWO sont
// hors budget pour ce projet). Le découpage en visiteurs est stable
// (même visiteur → même variante tant que son identifiant local
// persiste) et déterministe (calculable sans état partagé), ce qui
// permet de tester la logique sans navigateur.

/** Hash déterministe simple (FNV-1a), suffisant pour répartir en classes — pas un usage cryptographique. */
export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0; // entier non signé
}

/**
 * Transforme un hash en position dans [0, 1) — utilisé pour répartir
 * proportionnellement à des poids plutôt qu'en classes de taille égale.
 */
function hashToUnitInterval(hash: number): number {
  return hash / 0xffffffff;
}

export type WeightedVariant<T extends string> = { value: T; weight: number };

/**
 * Choisit une variante pondérée de façon déterministe. Les poids sont
 * relatifs (pas besoin qu'ils somment à 1 ou 100) : { value: "a", weight: 9 }
 * et { value: "b", weight: 1 } donnent un partage 90/10.
 */
export function assignWeightedVariant<T extends string>(
  visitorId: string,
  experimentKey: string,
  variants: readonly WeightedVariant<T>[]
): T {
  if (variants.length === 0) throw new Error("assignWeightedVariant: variants ne peut pas être vide");
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
  if (totalWeight <= 0) throw new Error("assignWeightedVariant: la somme des poids doit être positive");

  const position = hashToUnitInterval(hashString(`${experimentKey}:${visitorId}`)) * totalWeight;
  let cumulative = 0;
  for (const v of variants) {
    cumulative += v.weight;
    if (position < cumulative) return v.value;
  }
  // Filet de sécurité pour l'arrondi flottant en bord d'intervalle.
  return variants[variants.length - 1].value;
}

/**
 * Choisit une variante de façon déterministe à partir d'un identifiant
 * de visiteur et d'une clé d'expérience — la même paire (visiteur,
 * expérience) donne toujours la même variante, et deux expériences
 * différentes pour le même visiteur ne sont pas corrélées (la clé
 * d'expérience fait partie du hash). Répartition égale entre variantes —
 * pour un partage inégal (ex. rollout progressif 90/10), voir
 * assignWeightedVariant.
 */
export function assignVariant<T extends string>(
  visitorId: string,
  experimentKey: string,
  variants: readonly T[]
): T {
  if (variants.length === 0) throw new Error("assignVariant: variants ne peut pas être vide");
  const index = hashString(`${experimentKey}:${visitorId}`) % variants.length;
  return variants[index];
}

const VISITOR_ID_KEY = "nuee-visitor-id";

/**
 * Identifiant anonyme et persistant (localStorage, pas de cookie) créé
 * une seule fois par navigateur — sert uniquement à répartir les
 * visiteurs en variantes de façon stable, jamais envoyé à un tiers en
 * tant que tel.
 */
export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "server";
  try {
    const existing = window.localStorage.getItem(VISITOR_ID_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(VISITOR_ID_KEY, id);
    return id;
  } catch {
    // localStorage indisponible (navigation privée stricte, quota) — on
    // retombe sur un identifiant éphémère : l'expérience fonctionne
    // toujours, seule la stabilité entre deux visites est perdue.
    return `ephemeral-${Math.random().toString(36).slice(2)}`;
  }
}
