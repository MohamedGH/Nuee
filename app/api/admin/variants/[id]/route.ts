import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminRequest, isSameOrigin } from "@/lib/adminAuth";

const schema = z.object({ stock: z.number().int().min(0).max(9999) });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(req) || !isSameOrigin(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Stock invalide" }, { status: 400 });
  }

  const variant = await prisma.variant.update({
    where: { id: params.id },
    data: { stock: parsed.data.stock },
  });

  return NextResponse.json({ variant });
}
