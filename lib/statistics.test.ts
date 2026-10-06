import { describe, it, expect } from "vitest";
import { conversionRate, twoProportionZTest } from "./statistics";

describe("conversionRate", () => {
  it("calcule un taux simple", () => {
    expect(conversionRate({ visitors: 1000, conversions: 100 })).toBeCloseTo(0.1, 10);
  });

  it("renvoie 0 pour un échantillon vide plutôt qu'une division par zéro", () => {
    expect(conversionRate({ visitors: 0, conversions: 0 })).toBe(0);
  });
});

describe("twoProportionZTest", () => {
  // Valeurs de référence calculées indépendamment en Python (math.erf,
  // exact) — la tolérance couvre l'approximation d'Abramowitz-Stegun
  // utilisée côté TypeScript (erreur maximale documentée : 1,5e-7).
  it("détecte un écart significatif (10% vs 13%, n=1000 chacun)", () => {
    const result = twoProportionZTest(
      { visitors: 1000, conversions: 100 },
      { visitors: 1000, conversions: 130 }
    );
    expect(result.controlRate).toBeCloseTo(0.1, 10);
    expect(result.treatmentRate).toBeCloseTo(0.13, 10);
    expect(result.zScore).toBeCloseTo(2.102741, 5);
    expect(result.pValue).toBeCloseTo(0.035488, 5);
    expect(result.significant).toBe(true);
    expect(result.relativeUplift).toBeCloseTo(0.3, 10);
  });

  it("ne déclare pas significatif un petit écart bruité (10% vs 10,5%, n=1000)", () => {
    const result = twoProportionZTest(
      { visitors: 1000, conversions: 100 },
      { visitors: 1000, conversions: 105 }
    );
    expect(result.zScore).toBeCloseTo(0.368617, 5);
    expect(result.pValue).toBeCloseTo(0.712413, 5);
    expect(result.significant).toBe(false);
  });

  it("reste prudent juste sous le seuil habituel malgré un grand échantillon (10% vs 11,2%, n=5000)", () => {
    const result = twoProportionZTest(
      { visitors: 5000, conversions: 500 },
      { visitors: 5000, conversions: 560 }
    );
    expect(result.pValue).toBeCloseTo(0.051286, 5);
    expect(result.significant).toBe(false);
  });

  it("détecte un écart net même sur un petit échantillon (10% vs 20%, n=200)", () => {
    const result = twoProportionZTest(
      { visitors: 200, conversions: 20 },
      { visitors: 200, conversions: 40 }
    );
    expect(result.pValue).toBeCloseTo(0.005101, 5);
    expect(result.significant).toBe(true);
  });

  it("est symétrique : inverser témoin/traitement inverse le signe du z-score sans changer la p-value", () => {
    const a = twoProportionZTest(
      { visitors: 1000, conversions: 100 },
      { visitors: 1000, conversions: 130 }
    );
    const b = twoProportionZTest(
      { visitors: 1000, conversions: 130 },
      { visitors: 1000, conversions: 100 }
    );
    expect(a.zScore).toBeCloseTo(-b.zScore, 10);
    expect(a.pValue).toBeCloseTo(b.pValue, 10);
  });

  it("ne trouve aucun écart entre deux variantes identiques", () => {
    const result = twoProportionZTest(
      { visitors: 1000, conversions: 100 },
      { visitors: 1000, conversions: 100 }
    );
    expect(result.zScore).toBe(0);
    expect(result.pValue).toBeCloseTo(1, 6);
    expect(result.significant).toBe(false);
  });

  it("gère deux échantillons à zéro conversion sans NaN ni division par zéro", () => {
    const result = twoProportionZTest(
      { visitors: 500, conversions: 0 },
      { visitors: 500, conversions: 0 }
    );
    expect(result.zScore).toBe(0);
    expect(Number.isNaN(result.pValue)).toBe(false);
  });

  it("rejette un échantillon à zéro visiteur", () => {
    expect(() =>
      twoProportionZTest({ visitors: 0, conversions: 0 }, { visitors: 100, conversions: 10 })
    ).toThrow();
  });

  it("rejette des conversions supérieures aux visiteurs (données incohérentes)", () => {
    expect(() =>
      twoProportionZTest({ visitors: 100, conversions: 150 }, { visitors: 100, conversions: 10 })
    ).toThrow();
  });

  it("rejette des conversions négatives", () => {
    expect(() =>
      twoProportionZTest({ visitors: 100, conversions: -1 }, { visitors: 100, conversions: 10 })
    ).toThrow();
  });
});
