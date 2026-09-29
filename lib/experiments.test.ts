import { describe, it, expect } from "vitest";
import { experiments } from "./experiments";

describe("registre des expériences", () => {
  const all = Object.values(experiments);

  it("n'a pas deux expériences avec la même clé (silencieusement corrélées par le hash)", () => {
    const keys = all.map((e) => e.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("chaque expérience a au moins deux variantes", () => {
    for (const e of all) {
      expect(e.variants.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("chaque expérience a des poids strictement positifs sur au moins une variante", () => {
    for (const e of all) {
      expect(e.variants.some((v) => v.weight > 0)).toBe(true);
    }
  });

  it("chaque expérience est décrite (pour qui reprend le code plus tard)", () => {
    for (const e of all) {
      expect(e.description.trim().length).toBeGreaterThan(10);
    }
  });

  it("le témoin (première variante) a un poids non nul, sinon personne ne le verrait", () => {
    for (const e of all) {
      expect(e.variants[0].weight).toBeGreaterThan(0);
    }
  });

  it("les valeurs de variantes sont uniques au sein d'une expérience", () => {
    for (const e of all) {
      const values = e.variants.map((v) => v.value);
      expect(new Set(values).size).toBe(values.length);
    }
  });
});
