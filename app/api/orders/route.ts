import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/rateLimit";

const schema = z.object({ email: z.string().trim().email().max(254) });

export async function GET(req: NextRequest) {
  const ip = clientIp(req);
  // Limite basse : cette route permet de tester des adresses email, donc
  // on la protège plus strictement que les autres endpoints publics.
  const limitResult = rateLimit(`orders:${ip}`, { limit: 8, windowMs: 10 * 60_000 });
  if (!limitResult.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans quelques minutes." },
      { status: 429 }
    );
  }

  const parsed = schema.safeParse({ email: req.nextUrl.searchParams.get("email") });
  if (!parsed.success) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  const orders = await prisma.order.findMany({
    where: { customerEmail: parsed.data.email, status: "payée" },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
    take: 20,
  });

  return NextResponse.json({
    orders: orders.map((o) => ({
      id: o.id,
      status: o.status,
      totalCents: o.totalCents,
      discountCents: o.discountCents,
      couponCode: o.couponCode,
      shippingMethod: o.shippingMethod,
      shippingCents: o.shippingCents,
      giftWrap: o.giftWrap,
      shippingAddress: o.shippingLine1
        ? {
            name: o.shippingName,
            line1: o.shippingLine1,
            line2: o.shippingLine2,
            city: o.shippingCity,
            postalCode: o.shippingPostal,
            country: o.shippingCountry,
          }
        : null,
      createdAt: o.createdAt,
      items: o.items.map((i) => ({
        name: i.product.name,
        image: i.product.image,
        slug: i.product.slug,
        size: i.size,
        quantity: i.quantity,
        priceCents: i.priceCents,
      })),
    })),
  });
}
