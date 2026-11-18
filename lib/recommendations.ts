export type ProductRef = { id: string; category: string };

/** Plafond de /api/products pour `ids` et `exclude` : au-delà, la validation Zod échoue et l'API renvoie une liste vide sans erreur. */
export const MAX_ID_LIST = 50;

/**
 * Poids d'une consultation selon son rang de récence : la plus récente
 * pèse le plus, puis décroissance linéaire jusqu'à 1. Avant, toutes les
 * consultations comptaient pareil (+1) alors que l'ordre existe déjà dans
 * les données (store/recentlyViewed : le plus récent en premier).
 */
export function recencyWeight(rank: number, total: number): number {
  if (total <= 1) return 1;
  return total - rank;
}

/** Une mise en favori est un signal plus fort qu'une simple consultation. */
export const FAVORITE_WEIGHT = 3;

/**
 * Score d'affinité par catégorie : consultations (pondérées par récence)
 * + favoris (poids fixe). Triées par score décroissant. Un ID inconnu
 * (produit retiré du catalogue) est ignoré.
 *
 * @param viewedIds    IDs consultés, du plus récent au plus ancien.
 * @param favoriteIds  IDs en favoris.
 * @param products     Produits connus, pour résoudre ID → catégorie.
 */
export function rankCategories(
  viewedIds: readonly string[],
  favoriteIds: readonly string[],
  products: readonly ProductRef[]
): { category: string; score: number }[] {
  const byId = new Map(products.map((p) => [p.id, p]));
  const scores = new Map<string, number>();

  viewedIds.forEach((id, rank) => {
    const p = byId.get(id);
    if (!p) return;
    scores.set(p.category, (scores.get(p.category) ?? 0) + recencyWeight(rank, viewedIds.length));
  });

  for (const id of favoriteIds) {
    const p = byId.get(id);
    if (!p) continue;
    scores.set(p.category, (scores.get(p.category) ?? 0) + FAVORITE_WEIGHT);
  }

  return [...scores.entries()]
    .map(([category, score]) => ({ category, score }))
    .sort((a, b) => b.score - a.score);
}

export type SlotAllocation = { category: string; slots: number };

/**
 * Répartit `total` emplacements entre les deux catégories les mieux
 * classées, proportionnellement à leur score, avec au moins un
 * emplacement chacune — pour éviter une recommandation à 100 % mono-
 * catégorie dès que quelqu'un a montré un second intérêt.
 */
export function allocateSlots(
  ranked: readonly { category: string; score: number }[],
  total: number
): SlotAllocation[] {
  if (total <= 0 || ranked.length === 0) return [];
  if (ranked.length === 1 || total === 1) return [{ category: ranked[0].category, slots: total }];

  const [a, b] = ranked;
  const share = a.score / (a.score + b.score);
  const first = Math.min(total - 1, Math.max(1, Math.round(total * share)));
  return [
    { category: a.category, slots: first },
    { category: b.category, slots: total - first },
  ];
}

/**
 * Compose la liste finale : d'abord le quota de chaque catégorie, puis
 * comble les places restantes (une catégorie peut avoir moins de produits
 * que son quota) avec les surplus des catégories retenues. Jamais plus
 * de `total`, jamais de doublon, jamais un ID exclu (déjà vu ou au panier).
 */
export function mergeRecommendations<T extends { id: string }>(
  allocation: readonly SlotAllocation[],
  fetched: Readonly<Record<string, readonly T[]>>,
  total: number,
  excludeIds: ReadonlySet<string>
): T[] {
  const picked: T[] = [];
  const taken = new Set<string>();
  const usable = (p: T) => !excludeIds.has(p.id) && !taken.has(p.id);

  for (const { category, slots } of allocation) {
    let used = 0;
    for (const p of fetched[category] ?? []) {
      if (used >= slots || picked.length >= total) break;
      if (!usable(p)) continue;
      picked.push(p);
      taken.add(p.id);
      used++;
    }
  }

  for (const { category } of allocation) {
    for (const p of fetched[category] ?? []) {
      if (picked.length >= total) return picked;
      if (!usable(p)) continue;
      picked.push(p);
      taken.add(p.id);
    }
  }
  return picked;
}

/** Dédoublonne en conservant l'ordre (le plus pertinent d'abord) et plafonne à MAX_ID_LIST. */
export function limitIds(ids: readonly string[], max: number = MAX_ID_LIST): string[] {
  return [...new Set(ids)].slice(0, max);
}

/** Priorité d'exclusion : le panier d'abord (ne jamais recommander ce qui y est déjà), puis les consultations, puis les favoris. */
export function buildExcludeList(
  cartIds: readonly string[],
  viewedIds: readonly string[],
  favoriteIds: readonly string[]
): string[] {
  return limitIds([...cartIds, ...viewedIds, ...favoriteIds]);
}
