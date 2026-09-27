import { describe, it, expect } from "vitest";
import {
  shippingCostCents,
  amountToFreeShipping,
  FREE_SHIPPING_THRESHOLD_CENTS,
  STANDARD_SHIPPING_CENTS,
  EXPRESS_SHIPPING_CENTS,
} from "./shipping";

describe("shippingCostCents", () => {
  it("facture la livraison standard sous le seuil de gratuité", () => {
    expect(shippingCostCents(5000, "standard")).toBe(STANDARD_SHIPPING_CENTS);
  });

  it("offre la livraison standard au-dessus du seuil", () => {
    expect(shippingCostCents(FREE_SHIPPING_THRESHOLD_CENTS, "standard")).toBe(0);
    expect(shippingCostCents(FREE_SHIPPING_THRESHOLD_CENTS + 1, "standard")).toBe(0);
  });

  it("facture toujours l'express, même au-dessus du seuil", () => {
    expect(shippingCostCents(FREE_SHIPPING_THRESHOLD_CENTS + 10000, "express")).toBe(
      EXPRESS_SHIPPING_CENTS
    );
  });

  it("n'offre pas la livraison juste sous le seuil", () => {
    expect(shippingCostCents(FREE_SHIPPING_THRESHOLD_CENTS - 1, "standard")).toBe(
      STANDARD_SHIPPING_CENTS
    );
  });
});

describe("amountToFreeShipping", () => {
  it("calcule le montant restant avant la livraison offerte", () => {
    expect(amountToFreeShipping(10000)).toBe(FREE_SHIPPING_THRESHOLD_CENTS - 10000);
  });

  it("ne renvoie jamais un montant négatif une fois le seuil dépassé", () => {
    expect(amountToFreeShipping(FREE_SHIPPING_THRESHOLD_CENTS + 5000)).toBe(0);
  });

  it("renvoie 0 exactement au seuil", () => {
    expect(amountToFreeShipping(FREE_SHIPPING_THRESHOLD_CENTS)).toBe(0);
  });
});
