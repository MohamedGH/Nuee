import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const idsList = z
  .string()
  .transform((s) => s.split(",").map((id) => id.trim()).filter(Boolean))
  .pipe(z.array(z.string().max(64)).max(50));

const querySchema = z.object({
  ids: idsList.optional(),
  category: z.string().trim().max(60).optional(),
  exclude: idsList.optional(),
  limit: z.coerce.number().int().min(1).max(20).default(8),
});

function serialize(p: any) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    priceCents: p.priceCents,
    image: p.image,
    lookNumber: p.lookNumber,
    inStock: p.variants.some((v: { stock: number }) => v.stock > 0),
  };
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const parsed = querySchema.safeParse({
    ids: params.get("ids") || undefined,
    category: params.get("category") || undefined,
    exclude: params.get("exclude") || undefined,
    limit: params.get("limit") || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ products: [] });
  }
  const { ids, category, exclude, limit } = parsed.data;

  // Recherche par IDs explicites (favoris, consultés récemment) — priorité
  // sur les autres filtres si fournie.
  if (ids) {
    if (ids.length === 0) return NextResponse.json({ products: [] });
    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      include: { variants: true },
    });
    return NextResponse.json({ products: products.map(serialize) });
  }

  // Recherche par catégorie — utilisée pour les recommandations dérivées
  // du comportement (catégories les plus consultées/aimées).
  if (category) {
    const products = await prisma.product.findMany({
      where: {
        category,
        ...(exclude && exclude.length > 0 ? { id: { notIn: exclude } } : {}),
      },
      include: { variants: true },
      take: limit,
      orderBy: { lookNumber: "asc" },
    });
    return NextResponse.json({ products: products.map(serialize) });
  }

  return NextResponse.json({ products: [] });
}
