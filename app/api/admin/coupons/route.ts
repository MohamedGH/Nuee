import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminRequest, isSameOrigin } from "@/lib/adminAuth";

const createSchema = z
  .object({
    code: z.string().trim().toUpperCase().min(3).max(32),
    percentOff: z.number().int().min(1).max(100).optional(),
    amountOff: z.number().int().min(1).optional(),
    maxUses: z.number().int().min(1).optional(),
  })
  .refine((d) => Boolean(d.percentOff) !== Boolean(d.amountOff), {
    message: "Choisis soit un pourcentage, soit un montant fixe — pas les deux.",
  });

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ coupons });
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req) || !isSameOrigin(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Requête invalide" },
      { status: 400 }
    );
  }

  try {
    const coupon = await prisma.coupon.create({ data: parsed.data });
    return NextResponse.json({ coupon });
  } catch {
    return NextResponse.json({ error: "Ce code existe déjà." }, { status: 409 });
  }
}
