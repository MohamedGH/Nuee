import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import AddToCart from "@/components/AddToCart";
import FavoriteButton from "@/components/FavoriteButton";
import RelatedProducts from "@/components/RelatedProducts";
import ReviewsSection from "@/components/ReviewsSection";
import SizeGuide from "@/components/SizeGuide";
import Breadcrumbs from "@/components/Breadcrumbs";
import RecentlyViewed from "@/components/RecentlyViewed";
import TrackRecentlyViewed from "@/components/TrackRecentlyViewed";
import StarRating from "@/components/StarRating";
import { CATEGORY_SLOT } from "@/components/mannequin/types";
import { Shirt } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      variants: true,
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!product) notFound();

  const colors = product.colors.split(",");
  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  const related = await prisma.product.findMany({
    where: { category: product.category, id: { not: product.id } },
    include: { variants: true },
    take: 4,
  });

  return (
    <div>
      <TrackRecentlyViewed productId={product.id} />

      <Breadcrumbs
        items={[
          { label: "Accueil", href: "/" },
          { label: "Collection", href: "/produits" },
          { label: product.category, href: `/produits?cat=${encodeURIComponent(product.category)}` },
          { label: product.name },
        ]}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-10 grid md:grid-cols-2 gap-8 md:gap-12">
        <div className="relative aspect-[4/5]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
          <span className="absolute top-4 left-4 bg-bone/90 font-mono text-[10px] tracking-tag px-2 py-1">
            LOOK N°{String(product.lookNumber).padStart(2, "0")}
          </span>
          <FavoriteButton productId={product.id} className="absolute top-4 right-4" />
        </div>

        <div className="max-w-md">
          <p className="font-mono text-xs tracking-tag uppercase text-brick mb-3">
            {product.category}
          </p>
          <h1 className="font-display text-4xl italic leading-tight mb-3">
            {product.name}
          </h1>
          {product.reviews.length > 0 && (
            <div className="mb-4">
              <StarRating rating={averageRating} count={product.reviews.length} />
            </div>
          )}
          <p className="font-mono text-xl mb-6">{formatPrice(product.priceCents)}</p>
          <p className="text-ink-soft leading-relaxed mb-8">
            {product.description}
          </p>

          <p className="font-mono text-xs tracking-tag uppercase text-ink-soft mb-3">
            Coloris
          </p>
          <div className="flex gap-2 mb-8">
            {colors.map((c) => (
              <span
                key={c}
                className="font-mono text-xs border border-line px-3 py-1.5 text-ink-soft"
              >
                {c}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between mb-1">
            {CATEGORY_SLOT[product.category] ? (
              <Link
                href={`/essayage?produit=${product.slug}`}
                className="focus-ring inline-flex items-center gap-1.5 font-mono text-xs tracking-tag uppercase underline underline-offset-4 text-ink-soft hover:text-brick"
              >
                <Shirt size={14} aria-hidden />
                Essayer en 3D
              </Link>
            ) : (
              <span />
            )}
            <SizeGuide category={product.category} />
          </div>

          <AddToCart
            productId={product.id}
            slug={product.slug}
            name={product.name}
            priceCents={product.priceCents}
            image={product.image}
            variants={product.variants.map((v) => ({ size: v.size, stock: v.stock }))}
          />
        </div>
      </div>

      <ReviewsSection productId={product.id} reviews={product.reviews} />

      <RelatedProducts
        products={related.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          category: p.category,
          priceCents: p.priceCents,
          image: p.image,
          lookNumber: p.lookNumber,
          inStock: p.variants.some((v) => v.stock > 0),
        }))}
      />

      <RecentlyViewed excludeId={product.id} />
    </div>
  );
}
