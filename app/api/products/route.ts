import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const querySchema = z.object({
  ids: z
    .string()
    .transform((s) => s.split(",").map((id) => id.trim()).filter(Boolean))
    .pipe(z.array(z.string().max(64)).max(50)),
});

export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get("ids") || "";
  const parsed = querySchema.safeParse({ ids: idsParam });

  if (!parsed.success || parsed.data.ids.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: parsed.data.ids } },
    include: { variants: true },
  });

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      priceCents: p.priceCents,
      image: p.image,
      lookNumber: p.lookNumber,
      inStock: p.variants.some((v) => v.stock > 0),
    })),
  });
}
