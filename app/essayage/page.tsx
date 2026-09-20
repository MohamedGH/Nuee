import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { CATEGORY_SLOT } from "@/components/mannequin/types";
import type { Slot, MannequinProduct } from "@/components/mannequin/types";
import EssayageClient from "@/components/mannequin/EssayageClient";
import Breadcrumbs from "@/components/Breadcrumbs";

import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export function generateMetadata({
  searchParams,
}: {
  searchParams: { produit?: string };
}): Metadata {
  return {
    title: "Essayage 3D",
    description:
      "Composez une tenue sur un mannequin 3D et voyez comment les pièces NUÉE s'associent avant d'acheter.",
    alternates: { canonical: `${SITE_URL}/essayage` },
    // Avec ?produit=, c'est la même page pré-remplie différemment — pas
    // une page distincte à indexer.
    robots: searchParams.produit ? { index: false, follow: true } : undefined,
  };
}

export default async function EssayagePage({
  searchParams,
}: {
  searchParams: { produit?: string };
}) {
  const products = await prisma.product.findMany({
    include: { variants: true },
    orderBy: { lookNumber: "asc" },
  });

  const groups: Record<Slot, MannequinProduct[]> = {
    haut: [],
    bas: [],
    robe: [],
    accessoire: [],
  };

  for (const p of products) {
    const slot = CATEGORY_SLOT[p.category];
    if (!slot) continue;
    groups[slot].push({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      priceCents: p.priceCents,
      image: p.image,
      colors: p.colors,
      variants: p.variants.map((v) => ({ size: v.size, stock: v.stock })),
    });
  }

  const initial = searchParams.produit
    ? products.find((p) => p.slug === searchParams.produit)
    : undefined;

  return (
    <div>
      <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Essayage 3D" }]} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-10">
        <h1 className="font-display text-4xl italic mb-3">Essayage 3D</h1>
        <p className="text-ink-soft text-sm mb-10 max-w-xl">
          Composez une tenue sur le mannequin — silhouette et couleurs
          indicatives, pas un rendu photoréaliste des pièces.
        </p>

        <EssayageClient groups={groups} initialProductId={initial?.id} />
      </div>
    </div>
  );
}
