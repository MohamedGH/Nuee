import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/rateLimit";

const schema = z.object({ email: z.string().trim().email("Email invalide").max(254) });

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limitResult = rateLimit(`newsletter:${ip}`, { limit: 10, windowMs: 60 * 60_000 });
  if (!limitResult.allowed) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  try {
    await prisma.newsletterSubscriber.create({ data: { email: parsed.data.email } });
  } catch {
    // Déjà abonné — on répond succès pour ne pas révéler l'inscription existante.
  }

  return NextResponse.json({ ok: true });
}
