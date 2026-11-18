import { describe, it, expect } from "vitest";
import {
  rankCategories,
  recencyWeight,
  allocateSlots,
  mergeRecommendations,
  limitIds,
  buildExcludeList,
  FAVORITE_WEIGHT,
  MAX_ID_LIST,
} from "./recommendations";

const products = [
  { id: "m1", category: "Manteaux" },
  { id: "m2", category: "Manteaux" },
  { id: "m3", category: "Manteaux" },
  { id: "p1", category: "Pulls" },
  { id: "a1", category: "Accessoires" },
];

describe("recencyWeight", () => {
  it("donne le poids le plus fort au plus récent", () => {
    expect(recencyWeight(0, 5)).toBeGreaterThan(recencyWeight(4, 5));
  });
  it("décroît strictement", () => {
    const w = [0, 1, 2, 3].map((r) => recencyWeight(r, 4));
    for (let i = 1; i < w.length; i++) expect(w[i]).toBeLessThan(w[i - 1]);
  });
  it("reste positif pour la plus ancienne", () => {
    expect(recencyWeight(7, 8)).toBeGreaterThan(0);
  });
  it("gère une liste d'un élément", () => {
    expect(recencyWeight(0, 1)).toBe(1);
  });
});

describe("rankCategories", () => {
  it("renvoie [] sans comportement", () => {
    expect(rankCategories([], [], products)).toEqual([]);
  });

  it("classe la catégorie la plus consultée en premier", () => {
    expect(rankCategories(["m1", "m2", "m3"], [], products)[0].category).toBe("Manteaux");
  });

  it("la récence compte : le dernier produit vu bat un seul produit ancien d'une autre catégorie (avant : égalité à 1-1)", () => {
    const ranked = rankCategories(["p1", "m1"], [], products);
    expect(ranked[0].category).toBe("Pulls");
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });

  it("la récence ne renverse pas une vraie préférence : trois manteaux anciens battent un pull récent", () => {
    const ranked = rankCategories(["p1", "m1", "m2", "m3"], [], products);
    // p1 = 4 ; manteaux = 3 + 2 + 1 = 6
    expect(ranked[0].category).toBe("Manteaux");
  });

  it("un favori pèse plus qu'une consultation", () => {
    const ranked = rankCategories(["a1"], ["p1"], products);
    expect(ranked.find((r) => r.category === "Pulls")!.score).toBe(FAVORITE_WEIGHT);
  });

  it("additionne consultations et favoris d'une même catégorie", () => {
    const ranked = rankCategories(["m1"], ["m2"], products);
    expect(ranked[0].score).toBe(recencyWeight(0, 1) + FAVORITE_WEIGHT);
  });

  it("ignore un ID inconnu (produit retiré du catalogue)", () => {
    const ranked = rankCategories(["fantome", "m1"], ["fantome-fav"], products);
    expect(ranked.map((r) => r.category)).toEqual(["Manteaux"]);
  });

  it("trie par score décroissant", () => {
    const ranked = rankCategories(["m1", "m2", "p1"], ["a1"], products);
    for (let i = 1; i < ranked.length; i++) expect(ranked[i].score).toBeLessThanOrEqual(ranked[i - 1].score);
  });
});

describe("allocateSlots", () => {
  it("renvoie [] sans catégorie ou sans emplacement", () => {
    expect(allocateSlots([], 4)).toEqual([]);
    expect(allocateSlots([{ category: "A", score: 3 }], 0)).toEqual([]);
  });

  it("donne tout à l'unique catégorie", () => {
    expect(allocateSlots([{ category: "A", score: 3 }], 4)).toEqual([{ category: "A", slots: 4 }]);
  });

  it("répartit proportionnellement aux scores entre les deux premières", () => {
    const res = allocateSlots([{ category: "A", score: 6 }, { category: "B", score: 2 }], 4);
    expect(res).toEqual([{ category: "A", slots: 3 }, { category: "B", slots: 1 }]);
  });

  it("garantit au moins un emplacement à la seconde, même très minoritaire", () => {
    const res = allocateSlots([{ category: "A", score: 100 }, { category: "B", score: 1 }], 4);
    expect(res[1].slots).toBe(1);
    expect(res[0].slots).toBe(3);
  });

  it("somme toujours à total", () => {
    for (const total of [2, 3, 4, 5, 8]) {
      const res = allocateSlots([{ category: "A", score: 7 }, { category: "B", score: 5 }], total);
      expect(res.reduce((s, r) => s + r.slots, 0)).toBe(total);
    }
  });

  it("n'utilise que les deux meilleures catégories", () => {
    const res = allocateSlots(
      [{ category: "A", score: 5 }, { category: "B", score: 4 }, { category: "C", score: 3 }],
      4
    );
    expect(res.map((r) => r.category)).toEqual(["A", "B"]);
  });

  it("avec un seul emplacement, il va à la première", () => {
    expect(allocateSlots([{ category: "A", score: 2 }, { category: "B", score: 2 }], 1)).toEqual([{ category: "A", slots: 1 }]);
  });
});

describe("mergeRecommendations", () => {
  const item = (id: string) => ({ id });

  it("respecte les quotas puis ne dépasse jamais total", () => {
    const out = mergeRecommendations(
      [{ category: "A", slots: 2 }, { category: "B", slots: 2 }],
      { A: [item("a1"), item("a2"), item("a3")], B: [item("b1"), item("b2"), item("b3")] },
      4,
      new Set()
    );
    expect(out.map((p) => p.id)).toEqual(["a1", "a2", "b1", "b2"]);
  });

  it("exclut les IDs interdits (déjà vus, au panier)", () => {
    const out = mergeRecommendations(
      [{ category: "A", slots: 3 }],
      { A: [item("a1"), item("a2"), item("a3")] },
      3,
      new Set(["a2"])
    );
    expect(out.map((p) => p.id)).toEqual(["a1", "a3"]);
  });

  it("comble les places libres avec le surplus d'une autre catégorie quand l'une est trop courte", () => {
    const out = mergeRecommendations(
      [{ category: "A", slots: 3 }, { category: "B", slots: 1 }],
      { A: [item("a1")], B: [item("b1"), item("b2"), item("b3"), item("b4")] },
      4,
      new Set()
    );
    expect(out.map((p) => p.id)).toEqual(["a1", "b1", "b2", "b3"]);
  });

  it("n'inclut jamais de doublon", () => {
    const out = mergeRecommendations(
      [{ category: "A", slots: 2 }, { category: "B", slots: 2 }],
      { A: [item("x"), item("a2")], B: [item("x"), item("b2")] },
      4,
      new Set()
    );
    const ids = out.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("renvoie [] quand tout est exclu ou vide", () => {
    expect(mergeRecommendations([{ category: "A", slots: 2 }], { A: [] }, 2, new Set())).toEqual([]);
    expect(mergeRecommendations([{ category: "A", slots: 2 }], { A: [item("a1")] }, 2, new Set(["a1"]))).toEqual([]);
  });

  it("tolère une catégorie absente des résultats", () => {
    expect(mergeRecommendations([{ category: "Z", slots: 2 }], {}, 2, new Set())).toEqual([]);
  });
});

describe("limitIds / buildExcludeList", () => {
  it("dédoublonne en gardant l'ordre", () => {
    expect(limitIds(["a", "b", "a", "c"])).toEqual(["a", "b", "c"]);
  });

  it("plafonne à la limite de l'API (au-delà, /api/products renvoie silencieusement une liste vide)", () => {
    const many = Array.from({ length: 120 }, (_, i) => `id-${i}`);
    expect(limitIds(many)).toHaveLength(MAX_ID_LIST);
  });

  it("priorise le panier, puis les consultations, puis les favoris — même quand ça dépasse le plafond", () => {
    const fav = Array.from({ length: 80 }, (_, i) => `fav-${i}`);
    const out = buildExcludeList(["cart-1"], ["view-1", "view-2"], fav);
    expect(out).toHaveLength(MAX_ID_LIST);
    expect(out.slice(0, 3)).toEqual(["cart-1", "view-1", "view-2"]);
  });

  it("dédoublonne entre sources", () => {
    expect(buildExcludeList(["x"], ["x", "y"], ["y"])).toEqual(["x", "y"]);
  });
});
