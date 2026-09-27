import { describe, it, expect } from "vitest";
import { formatPrice } from "./format";

// toLocaleString("fr-FR") insère une espace insécable (U+00A0) avant "€",
// pas une espace normale — les assertions matchent sur ce caractère précis
// plutôt que de le taper "à l'œil" dans le code source.
const NBSP = "\u00A0";

describe("formatPrice", () => {
  it("convertit les centimes en euros formatés (fr-FR)", () => {
    expect(formatPrice(39000)).toBe(`390,00${NBSP}€`);
  });

  it("gère zéro", () => {
    expect(formatPrice(0)).toBe(`0,00${NBSP}€`);
  });

  it("arrondit correctement les centimes impairs", () => {
    expect(formatPrice(1099)).toBe(`10,99${NBSP}€`);
  });

  it("contient toujours le symbole euro et deux décimales", () => {
    expect(formatPrice(250)).toMatch(/^\d+,\d{2}\s*€$/u);
  });
});
