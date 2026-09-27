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
 * Choisit une variante de façon déterministe à partir d'un identifiant
 * de visiteur et d'une clé d'expérience — la même paire (visiteur,
 * expérience) donne toujours la même variante, et deux expériences
 * différentes pour le même visiteur ne sont pas corrélées (la clé
 * d'expérience fait partie du hash).
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
