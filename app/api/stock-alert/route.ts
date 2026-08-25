import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stockAlertSchema } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limitResult = rateLimit(`stock-alert:${ip}`, { limit: 15, windowMs: 60 * 60_000 });
  if (!limitResult.allowed) {
    return NextResponse.json(
      { error: "Trop de demandes. Réessayez plus tard." },
      { status: 429 }
    );
  }

  const parsed = stockAlertSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const variant = await prisma.variant.findFirst({
    where: { productId: parsed.data.productId, size: parsed.data.size },
  });
  if (!variant) {
    return NextResponse.json({ error: "Taille introuvable" }, { status: 404 });
  }

  try {
    await prisma.stockAlert.create({ data: parsed.data });
  } catch {
    // Contrainte unique (productId, size, email) déjà en place — on répond
    // succès pour ne pas révéler si l'email était déjà inscrit.
  }

  return NextResponse.json({ ok: true });
}
