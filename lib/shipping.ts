export const FREE_SHIPPING_THRESHOLD_CENTS = 15000; // 150 €
export const STANDARD_SHIPPING_CENTS = 590; // 5,90 €
export const EXPRESS_SHIPPING_CENTS = 1290; // 12,90 €
export const GIFT_WRAP_CENTS = 300; // 3 €

export type ShippingMethod = "standard" | "express";

export function shippingCostCents(subtotalCents: number, method: ShippingMethod): number {
  if (method === "express") return EXPRESS_SHIPPING_CENTS;
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : STANDARD_SHIPPING_CENTS;
}

export function amountToFreeShipping(subtotalCents: number): number {
  return Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents);
}
