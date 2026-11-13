import { describe, it, expect } from "vitest";
import { computeScrollPercent, thresholdsCrossed, SCROLL_THRESHOLDS } from "./scrollDepth";

describe("computeScrollPercent", () => {
  it("renvoie 0 tout en haut de la page", () => {
    expect(computeScrollPercent(0, 800, 3000)).toBe(0);
  });

  it("renvoie 100 tout en bas de la page", () => {
    expect(computeScrollPercent(2200, 800, 3000)).toBe(100);
  });

  it("calcule un pourcentage intermédiaire", () => {
    expect(computeScrollPercent(1100, 800, 3000)).toBe(50); // défilable = 2200
  });

  it("renvoie 0 (pas 100) pour une page qui tient dans l'écran : rien à défiler, aucun engagement mesurable", () => {
    expect(computeScrollPercent(0, 800, 600)).toBe(0);
    expect(computeScrollPercent(0, 800, 800)).toBe(0);
  });

  it("borne le résultat à [0, 100] (rebond élastique iOS)", () => {
    expect(computeScrollPercent(-50, 800, 3000)).toBe(0);
    expect(computeScrollPercent(9999, 800, 3000)).toBe(100);
  });
});

describe("thresholdsCrossed", () => {
  it("ne renvoie rien sous le premier palier", () => {
    expect(thresholdsCrossed(10, new Set())).toEqual([]);
  });

  it("renvoie le palier franchi", () => {
    expect(thresholdsCrossed(30, new Set())).toEqual([25]);
  });

  it("renvoie plusieurs paliers sautés d'un coup, dans l'ordre", () => {
    expect(thresholdsCrossed(80, new Set())).toEqual([25, 50, 75]);
  });

  it("ne renvoie pas deux fois un palier déjà déclenché", () => {
    expect(thresholdsCrossed(80, new Set([25, 50]))).toEqual([75]);
  });

  it("ne renvoie rien une fois tous les paliers déclenchés", () => {
    expect(thresholdsCrossed(100, new Set(SCROLL_THRESHOLDS))).toEqual([]);
  });

  it("déclenche le palier au pourcentage exact", () => {
    expect(thresholdsCrossed(25, new Set())).toEqual([25]);
  });

  it("ne déclenche rien sur une page non défilable (pourcentage 0)", () => {
    expect(thresholdsCrossed(computeScrollPercent(0, 800, 600), new Set())).toEqual([]);
  });
});
