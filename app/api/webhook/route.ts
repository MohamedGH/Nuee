import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  // La signature Stripe est obligatoire — sans elle, n'importe qui pourrait
  // appeler cette route et se faire passer pour un paiement validé.
  if (!sig || !env.STRIPE_WEBHOOK_SECRET) {
    console.error("Webhook rejeté: signature ou secret manquant");
    return NextResponse.json(
      { error: "Signature webhook requise" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Signature webhook invalide:", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const order = await prisma.order.findUnique({
      where: { stripeSessionId: session.id },
      include: { items: true },
    });

    if (!order) {
      console.error("Webhook: commande introuvable pour la session", session.id);
      return NextResponse.json({ received: true });
    }

    // Idempotence — Stripe peut renvoyer le même événement plusieurs fois ;
    // sans ce garde-fou le stock serait décrémenté deux fois.
    if (order.status === "payée") {
      return NextResponse.json({ received: true });
    }

    await prisma.$transaction(async (tx) => {
      // shipping_details porte l'adresse saisie sur la page Stripe
      // (shipping_address_collection) ; customer_details.address est un
      // repli si Stripe ne l'a exposée que là selon le flux emprunté.
      const address = session.shipping_details?.address ?? session.customer_details?.address;
      const shippingName = session.shipping_details?.name ?? session.customer_details?.name ?? null;

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "payée",
          shippingName,
          shippingLine1: address?.line1 ?? null,
          shippingLine2: address?.line2 ?? null,
          shippingCity: address?.city ?? null,
          shippingPostal: address?.postal_code ?? null,
          shippingCountry: address?.country ?? null,
        },
      });

      for (const item of order.items) {
        // Décrément conditionnel : n'agit que si le stock est encore
        // suffisant, ce qui évite un stock négatif en cas de commandes
        // concurrentes sur la dernière unité disponible.
        const result = await tx.variant.updateMany({
          where: {
            productId: item.productId,
            size: item.size,
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        });

        if (result.count === 0) {
          console.warn(
            `Survente détectée: produit ${item.productId} taille ${item.size} — à traiter manuellement (remboursement partiel / réassort).`
          );
        }
      }

      if (order.couponCode) {
        await tx.coupon.updateMany({
          where: { code: order.couponCode },
          data: { usedCount: { increment: 1 } },
        });
      }
    });
  }

  return NextResponse.json({ received: true });
}
