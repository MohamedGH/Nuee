import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validation";
import { resolveCoupon } from "@/lib/coupon";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { env } from "@/lib/env";

const ALLOWED_ORIGINS = [
  env.NEXT_PUBLIC_APP_URL,
  "http://localhost:3000",
].filter(Boolean) as string[];

export async function POST(req: NextRequest) {
  try {
    // 1. Origine — bloque les appels forgés depuis un autre site (CSRF-like).
    const origin = req.headers.get("origin");
    if (origin && env.NODE_ENV === "production" && !ALLOWED_ORIGINS.includes(origin)) {
      return NextResponse.json({ error: "Origine non autorisée" }, { status: 403 });
    }
    const safeOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

    // 2. Rate limit — 10 tentatives de paiement par IP / 10 minutes.
    const ip = clientIp(req);
    const limitResult = rateLimit(`checkout:${ip}`, { limit: 10, windowMs: 10 * 60_000 });
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans quelques minutes." },
        { status: 429 }
      );
    }

    // 3. Validation stricte du corps de la requête.
    const parsed = checkoutSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Requête invalide", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { items, email, couponCode } = parsed.data;

    // 4. Vérité serveur : on ne fait JAMAIS confiance au prix envoyé par le
    // client. On relit chaque produit/variante en base et on reconstruit
    // le panier à partir de ces valeurs uniquement.
    const productIds = [...new Set(items.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { variants: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const verifiedItems: {
      productId: string;
      name: string;
      image: string;
      size: string;
      quantity: number;
      priceCents: number;
    }[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Produit introuvable: ${item.productId}` },
          { status: 400 }
        );
      }
      const variant = product.variants.find((v) => v.size === item.size);
      if (!variant) {
        return NextResponse.json(
          { error: `Taille indisponible pour ${product.name}` },
          { status: 400 }
        );
      }
      if (variant.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuffisant pour ${product.name} (taille ${item.size})` },
          { status: 409 }
        );
      }
      verifiedItems.push({
        productId: product.id,
        name: product.name,
        image: product.image,
        size: item.size,
        quantity: item.quantity,
        priceCents: product.priceCents, // ← prix issu de la base, pas du client
      });
    }

    const line_items = verifiedItems.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: `${item.name} — Taille ${item.size}`,
          images: [item.image],
        },
        unit_amount: item.priceCents,
      },
      quantity: item.quantity,
    }));

    const subtotal = verifiedItems.reduce(
      (sum, i) => sum + i.priceCents * i.quantity,
      0
    );

    // 5. Code promo — recalculé côté serveur à partir du sous-total réel,
    // jamais à partir d'un montant envoyé par le client.
    let discountCents = 0;
    let appliedCoupon: string | null = null;
    if (couponCode) {
      const result = await resolveCoupon(couponCode, subtotal);
      if (result.valid) {
        discountCents = result.discountCents;
        appliedCoupon = couponCode;
      }
      // Un code invalide/expiré n'échoue pas tout le paiement : il est
      // simplement ignoré, comme si aucun code n'avait été saisi.
    }

    let discounts: { coupon: string }[] | undefined;
    if (discountCents > 0) {
      const stripeCoupon = await stripe.coupons.create({
        amount_off: discountCents,
        currency: "eur",
        duration: "once",
        name: appliedCoupon ?? undefined,
      });
      discounts = [{ coupon: stripeCoupon.id }];
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "paypal"],
      line_items,
      discounts,
      customer_email: email,
      success_url: `${safeOrigin}/commande/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${safeOrigin}/commande/annule`,
    });

    await prisma.order.create({
      data: {
        stripeSessionId: session.id,
        customerEmail: email,
        totalCents: subtotal - discountCents,
        discountCents,
        couponCode: appliedCoupon,
        status: "pending",
        items: {
          create: verifiedItems.map((i) => ({
            productId: i.productId,
            size: i.size,
            quantity: i.quantity,
            priceCents: i.priceCents,
          })),
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    // On ne renvoie jamais le détail de l'erreur interne au client.
    console.error("Erreur checkout:", err);
    return NextResponse.json(
      { error: "Erreur lors de la création du paiement" },
      { status: 500 }
    );
  }
}
