import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { colorHex } from "@/lib/colors";
import { SITE_URL } from "@/lib/site";
import AddToCart from "@/components/AddToCart";
import ProductGallery from "@/components/ProductGallery";
import RelatedProducts from "@/components/RelatedProducts";
import ReviewsSection from "@/components/ReviewsSection";
import SizeGuide from "@/components/SizeGuide";
import Breadcrumbs from "@/components/Breadcrumbs";
import RecentlyViewed from "@/components/RecentlyViewed";
import TrackRecentlyViewed from "@/components/TrackRecentlyViewed";
import TrackViewItem from "@/components/TrackViewItem";
import StarRating from "@/components/StarRating";
import JsonLd from "@/components/JsonLd";
import { CATEGORY_SLOT } from "@/components/mannequin/types";
import { Shirt } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!product) return {};

  const url = `${SITE_URL}/produits/${product.slug}`;
  const description = product.description.length > 155
    ? `${product.description.slice(0, 152)}…`
    : product.description;

  return {
    title: product.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url,
      images: [{ url: product.image, width: 900, height: 1150, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [product.image],
    },
  };
}

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
  const galleryImages = [product.image, ...(product.images?.split(",").filter(Boolean) ?? [])];
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
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          image: [product.image, ...galleryImages.slice(1)],
          sku: product.id,
          category: product.category,
          brand: { "@type": "Brand", name: "NUÉE" },
          offers: {
            "@type": "Offer",
            url: `${SITE_URL}/produits/${product.slug}`,
            priceCurrency: "EUR",
            price: (product.priceCents / 100).toFixed(2),
            availability: product.variants.some((v) => v.stock > 0)
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
          ...(product.reviews.length > 0
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: averageRating.toFixed(1),
                  reviewCount: product.reviews.length,
                },
                review: product.reviews.slice(0, 10).map((r) => ({
                  "@type": "Review",
                  author: { "@type": "Person", name: r.authorName },
                  datePublished: r.createdAt.toISOString().slice(0, 10),
                  reviewBody: r.comment,
                  reviewRating: {
                    "@type": "Rating",
                    ratingValue: r.rating,
                    bestRating: 5,
                    worstRating: 1,
                  },
                })),
              }
            : {}),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Collection", item: `${SITE_URL}/produits` },
            {
              "@type": "ListItem",
              position: 3,
              name: product.category,
              item: `${SITE_URL}/produits?cat=${encodeURIComponent(product.category)}`,
            },
            { "@type": "ListItem", position: 4, name: product.name, item: `${SITE_URL}/produits/${product.slug}` },
          ],
        }}
      />

      <TrackRecentlyViewed productId={product.id} />
      <TrackViewItem
        id={product.id}
        name={product.name}
        category={product.category}
        priceCents={product.priceCents}
      />

      <Breadcrumbs
        items={[
          { label: "Accueil", href: "/" },
          { label: "Collection", href: "/produits" },
          { label: product.category, href: `/produits?cat=${encodeURIComponent(product.category)}` },
          { label: product.name },
        ]}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-10 grid md:grid-cols-2 gap-8 md:gap-12">
        <ProductGallery
          images={galleryImages}
          alt={product.name}
          lookNumber={product.lookNumber}
          productId={product.id}
          category={product.category}
          priceCents={product.priceCents}
        />

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
                className="flex items-center gap-2 font-mono text-xs border border-line px-3 py-1.5 text-ink-soft"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-line/50 shrink-0"
                  style={{ backgroundColor: colorHex(c) }}
                  aria-hidden
                />
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
            category={product.category}
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
