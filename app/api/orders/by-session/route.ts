import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/rateLimit";

const schema = z.object({ session_id: z.string().trim().min(1).max(200) });

export async function GET(req: NextRequest) {
  const ip = clientIp(req);
  const limitResult = rateLimit(`order-by-session:${ip}`, { limit: 20, windowMs: 10 * 60_000 });
  if (!limitResult.allowed) {
    return NextResponse.json({ error: "Trop de tentatives." }, { status: 429 });
  }

  const parsed = schema.safeParse({ session_id: req.nextUrl.searchParams.get("session_id") });
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { stripeSessionId: parsed.data.session_id },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  // Volontairement minimal : ni email ni adresse ne sont renvoyés ici —
  // sert au récapitulatif affiché sur la page de succès. Le suivi
  // analytique de l'achat, lui, part désormais du webhook (fiable, ne
  // dépend pas de ce que fait le navigateur après le paiement).
  return NextResponse.json({
    id: order.id,
    totalCents: order.totalCents,
    discountCents: order.discountCents,
    shippingCents: order.shippingCents,
    items: order.items.map((i) => ({
      id: i.productId,
      name: i.product.name,
      category: i.product.category,
      priceCents: i.priceCents,
      quantity: i.quantity,
    })),
  });
}
