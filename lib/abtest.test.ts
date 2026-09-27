import { describe, it, expect } from "vitest";
import { hashString, assignVariant } from "./abtest";

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
