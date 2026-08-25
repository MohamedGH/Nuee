import { prisma } from "@/lib/prisma";

export async function resolveCoupon(code: string, subtotalCents: number) {
  const coupon = await prisma.coupon.findUnique({ where: { code } });

  if (!coupon || !coupon.active) {
    return { valid: false as const, reason: "Code promo invalide." };
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false as const, reason: "Ce code promo a expiré." };
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false as const, reason: "Ce code promo a atteint sa limite d'utilisation." };
  }

  let discountCents = 0;
  if (coupon.percentOff) {
    discountCents = Math.round((subtotalCents * coupon.percentOff) / 100);
  } else if (coupon.amountOff) {
    discountCents = Math.min(coupon.amountOff, subtotalCents);
  }

  return { valid: true as const, coupon, discountCents };
}
