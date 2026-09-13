import { z } from "zod";

export const checkoutSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Email invalide")
    .max(254),
  couponCode: z
    .string()
    .trim()
    .toUpperCase()
    .max(32)
    .optional()
    .or(z.literal("")),
  shippingMethod: z.enum(["standard", "express"]).default("standard"),
  giftWrap: z.boolean().default(false),
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1).max(64),
        size: z.enum(["XS", "S", "M", "L", "XL"]),
        quantity: z.number().int().min(1).max(10),
        // priceCents et name/image acceptés mais jamais utilisés côté
        // serveur pour le calcul du montant — voir app/api/checkout/route.ts
      })
    )
    .min(1, "Le panier est vide")
    .max(30, "Trop d'articles dans le panier"),
});

export const couponSchema = z.object({
  code: z.string().trim().toUpperCase().min(1).max(32),
  subtotalCents: z.number().int().min(0),
});

export const reviewSchema = z.object({
  productId: z.string().trim().min(1).max(64),
  authorName: z.string().trim().min(2, "Nom trop court").max(60),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(10, "Un peu court — 10 caractères minimum").max(800),
});

export const stockAlertSchema = z.object({
  productId: z.string().trim().min(1).max(64),
  size: z.enum(["XS", "S", "M", "L", "XL"]),
  email: z.string().trim().email("Email invalide").max(254),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
