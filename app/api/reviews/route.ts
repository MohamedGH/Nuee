import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limitResult = rateLimit(`review:${ip}`, { limit: 5, windowMs: 60 * 60_000 });
  if (!limitResult.allowed) {
    return NextResponse.json(
      { error: "Trop d'avis envoyés récemment. Réessayez plus tard." },
      { status: 429 }
    );
  }

  const parsed = reviewSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Formulaire invalide", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    select: { id: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  const review = await prisma.review.create({
    data: {
      productId: parsed.data.productId,
      authorName: parsed.data.authorName,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      verified: false, // seuls les avis liés à une commande confirmée devraient l'être en production
    },
  });

  return NextResponse.json({ review });
}
