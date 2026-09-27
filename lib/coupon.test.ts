import { describe, it, expect, vi, beforeEach } from "vitest";

const findUnique = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: { coupon: { findUnique: (...args: unknown[]) => findUnique(...args) } },
}));

const { resolveCoupon } = await import("./coupon");

beforeEach(() => {
  findUnique.mockReset();
});

describe("resolveCoupon", () => {
  it("rejette un code inexistant", async () => {
    findUnique.mockResolvedValue(null);
    const result = await resolveCoupon("INCONNU", 10000);
    expect(result.valid).toBe(false);
  });

  it("rejette un code désactivé", async () => {
    findUnique.mockResolvedValue({ active: false });
    const result = await resolveCoupon("DESACTIVE", 10000);
    expect(result.valid).toBe(false);
  });

  it("rejette un code expiré", async () => {
    findUnique.mockResolvedValue({
      active: true,
      expiresAt: new Date(Date.now() - 1000),
      maxUses: null,
      usedCount: 0,
    });
    const result = await resolveCoupon("EXPIRE", 10000);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/expiré/);
  });

  it("rejette un code ayant atteint sa limite d'utilisation", async () => {
    findUnique.mockResolvedValue({
      active: true,
      expiresAt: null,
      maxUses: 5,
      usedCount: 5,
    });
    const result = await resolveCoupon("EPUISE", 10000);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/limite/);
  });

  it("calcule correctement une réduction en pourcentage", async () => {
    findUnique.mockResolvedValue({
      active: true,
      expiresAt: null,
      maxUses: null,
      usedCount: 0,
      percentOff: 10,
      amountOff: null,
    });
    const result = await resolveCoupon("BIENVENUE10", 10000);
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.discountCents).toBe(1000);
  });

  it("calcule correctement une réduction en montant fixe", async () => {
    findUnique.mockResolvedValue({
      active: true,
      expiresAt: null,
      maxUses: null,
      usedCount: 0,
      percentOff: null,
      amountOff: 500,
    });
    const result = await resolveCoupon("PORT5", 10000);
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.discountCents).toBe(500);
  });

  it("plafonne un montant fixe au sous-total (jamais de réduction négative)", async () => {
    findUnique.mockResolvedValue({
      active: true,
      expiresAt: null,
      maxUses: null,
      usedCount: 0,
      percentOff: null,
      amountOff: 5000,
    });
    const result = await resolveCoupon("GROS", 2000);
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.discountCents).toBe(2000);
  });
});
