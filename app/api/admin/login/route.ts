import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminConfigured, verifyAdminPassword, createSessionToken, ADMIN_COOKIE } from "@/lib/adminAuth";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { env } from "@/lib/env";

const schema = z.object({ password: z.string().min(1).max(200) });

export async function POST(req: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Espace admin non configuré (ADMIN_PASSWORD_HASH / ADMIN_SESSION_SECRET manquants)." },
      { status: 503 }
    );
  }

  // Limite volontairement basse : c'est la seule porte d'entrée à protéger
  // contre le bruteforce.
  const ip = clientIp(req);
  const limitResult = rateLimit(`admin-login:${ip}`, { limit: 8, windowMs: 15 * 60_000 });
  if (!limitResult.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans quelques minutes." },
      { status: 429 }
    );
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const ok = await verifyAdminPassword(parsed.data.password);
  if (!ok) {
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 12 * 60 * 60,
  });
  return response;
}
