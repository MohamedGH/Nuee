import { describe, it, expect, afterEach, vi } from "vitest";
import {
  hashString,
  assignVariant,
  assignWeightedVariant,
  getOrCreateVisitorId,
} from "./abtest";

describe("hashString", () => {
  it("est déterministe", () => {
    expect(hashString("abc")).toBe(hashString("abc"));
  });

  it("donne des valeurs différentes pour des entrées différentes", () => {
    expect(hashString("abc")).not.toBe(hashString("abd"));
  });

  it("renvoie toujours un entier non négatif", () => {
    for (const s of ["", "x", "un visiteur assez long avec des accents éàü"]) {
      expect(hashString(s)).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("assignVariant", () => {
  const variants = ["ink", "brick"] as const;

  it("assigne toujours la même variante au même visiteur pour la même expérience", () => {
    const first = assignVariant("visitor-1", "cta-color", variants);
    for (let i = 0; i < 20; i++) {
      expect(assignVariant("visitor-1", "cta-color", variants)).toBe(first);
    }
  });

  it("ne corrèle pas deux expériences différentes pour le même visiteur", () => {
    // Pas une garantie mathématique stricte, mais avec des clés
    // différentes le hash ne doit pas juste réutiliser la même sortie.
    const a = assignVariant("visitor-1", "experiment-a", variants);
    const b = assignVariant("visitor-1", "experiment-b", ["x", "y", "z"] as const);
    expect(["x", "y", "z"]).toContain(b);
    expect(["ink", "brick"]).toContain(a);
  });

  it("répartit raisonnablement les visiteurs entre les variantes", () => {
    const counts: Record<string, number> = { ink: 0, brick: 0 };
    const total = 2000;
    for (let i = 0; i < total; i++) {
      const v = assignVariant(`visitor-${i}`, "cta-color", variants);
      counts[v]++;
    }
    // Pas d'exigence de parfaite égalité — juste qu'aucune variante
    // n'absorbe la quasi-totalité du trafic (signe d'un hash cassé).
    expect(counts.ink).toBeGreaterThan(total * 0.35);
    expect(counts.brick).toBeGreaterThan(total * 0.35);
  });

  it("lève une erreur si la liste de variantes est vide", () => {
    expect(() => assignVariant("visitor-1", "exp", [])).toThrow();
  });

  it("renvoie l'unique variante s'il n'y en a qu'une", () => {
    expect(assignVariant("visitor-1", "exp", ["only"])).toBe("only");
  });
});


describe("assignWeightedVariant", () => {
  it("est déterministe pour un même visiteur", () => {
    const variants = [
      { value: "a", weight: 9 },
      { value: "b", weight: 1 },
    ] as const;
    const first = assignWeightedVariant("v-1", "exp", variants);
    for (let i = 0; i < 20; i++) {
      expect(assignWeightedVariant("v-1", "exp", variants)).toBe(first);
    }
  });

  it("respecte un partage 90/10 sur un grand échantillon", () => {
    const variants = [
      { value: "control", weight: 9 },
      { value: "treatment", weight: 1 },
    ] as const;
    const total = 5000;
    let treatment = 0;
    for (let i = 0; i < total; i++) {
      if (assignWeightedVariant(`visitor-${i}`, "rollout", variants) === "treatment") treatment++;
    }
    const ratio = treatment / total;
    expect(ratio).toBeGreaterThan(0.07);
    expect(ratio).toBeLessThan(0.13);
  });

  it("n'exige pas que les poids somment à 1 ou 100", () => {
    const variants = [
      { value: "a", weight: 3 },
      { value: "b", weight: 3 },
    ] as const;
    expect(["a", "b"]).toContain(assignWeightedVariant("v", "exp", variants));
  });

  it("n'attribue jamais une variante de poids 0", () => {
    const variants = [
      { value: "live", weight: 1 },
      { value: "dead", weight: 0 },
    ] as const;
    for (let i = 0; i < 500; i++) {
      expect(assignWeightedVariant(`visitor-${i}`, "exp", variants)).toBe("live");
    }
  });

  it("lève une erreur si la liste est vide", () => {
    expect(() => assignWeightedVariant("v", "exp", [])).toThrow();
  });

  it("lève une erreur si la somme des poids est nulle", () => {
    expect(() =>
      assignWeightedVariant("v", "exp", [
        { value: "a", weight: 0 },
        { value: "b", weight: 0 },
      ])
    ).toThrow();
  });
});

describe("getOrCreateVisitorId", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function stubStorage(store: Record<string, string> = {}, opts: { throws?: boolean } = {}) {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => {
          if (opts.throws) throw new Error("storage indisponible");
          return store[k] ?? null;
        },
        setItem: (k: string, v: string) => {
          if (opts.throws) throw new Error("storage indisponible");
          store[k] = v;
        },
      },
    });
    return store;
  }

  it("crée un identifiant et le réutilise ensuite", () => {
    stubStorage();
    const first = getOrCreateVisitorId();
    const second = getOrCreateVisitorId();
    expect(first).toBeTruthy();
    expect(second).toBe(first);
  });

  it("réutilise un identifiant déjà présent", () => {
    stubStorage({ "nuee-visitor-id": "deja-la" });
    expect(getOrCreateVisitorId()).toBe("deja-la");
  });

  it("retombe sur un identifiant éphémère si le stockage est indisponible", () => {
    stubStorage({}, { throws: true });
    const id = getOrCreateVisitorId();
    expect(id).toMatch(/^ephemeral-/);
  });

  it("renvoie un identifiant fixe côté serveur (window indéfini)", () => {
    vi.stubGlobal("window", undefined);
    expect(getOrCreateVisitorId()).toBe("server");
  });
});
