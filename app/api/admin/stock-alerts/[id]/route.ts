import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminRequest, isSameOrigin } from "@/lib/adminAuth";

const schema = z.object({ notified: z.boolean() });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(req) || !isSameOrigin(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  const alert = await prisma.stockAlert.update({
    where: { id: params.id },
    data: { notified: parsed.data.notified },
  });
  return NextResponse.json({ alert });
}
