import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import RecommendedForYou from "@/components/RecommendedForYou";
import JsonLd from "@/components/JsonLd";
import { IMAGE_BLUR_DATA_URL } from "@/lib/imagePlaceholder";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { getSocialPlatforms } from "@/lib/social";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
};

export default async function HomePage() {
  const socialPlatforms = getSocialPlatforms();
  const products = await prisma.product.findMany({
    orderBy: { lookNumber: "asc" },
    take: 4,
    include: { variants: true },
  });

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
          description:
            "NUÉE — vêtements essentiels en petites séries, coupes droites, matières brutes. Paris.",
          ...(socialPlatforms.length > 0
            ? { sameAs: socialPlatforms.map((p) => p.url) }
            : {}),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: SITE_URL,
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE_URL}/produits?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 pt-10 pb-14 md:pt-16 md:pb-20 grid md:grid-cols-12 gap-8 md:items-end">
        <div className="md:col-span-7">
          <p className="font-mono text-xs tracking-tag uppercase text-brick mb-6">
            Collection — Huit pièces
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl italic leading-[0.95]">
            La coupe
            <br />
            avant la mode.
          </h1>
          <p className="mt-8 max-w-md text-ink-soft leading-relaxed">
            NUÉE façonne des pièces en petites séries — huit vêtements, une
            couture visible, aucune saison. Chaque pièce est numérotée comme
            un tirage.
          </p>
          <Link
            href="/produits"
            className="focus-ring inline-block mt-8 font-mono text-xs tracking-tag uppercase border border-ink px-6 py-3 hover:bg-ink hover:text-bone transition-colors"
          >
            Voir la collection
          </Link>
        </div>
        <div className="md:col-span-5 relative aspect-[3/4]">
          {products[0] && (
            <>
              <Image
                src={products[0].image}
                alt={products[0].name}
                fill
                placeholder="blur"
                blurDataURL={IMAGE_BLUR_DATA_URL}
                className="object-cover"
                priority
              />
              <span className="absolute top-3 left-3 bg-bone/90 font-mono text-[10px] tracking-tag px-2 py-1">
                LOOK N°{String(products[0].lookNumber).padStart(2, "0")}
              </span>
            </>
          )}
        </div>
      </section>

      <section className="bg-ink text-bone py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 grid md:grid-cols-12 gap-8">
          <p className="md:col-span-7 font-display italic text-3xl sm:text-4xl md:text-5xl leading-[1.15]">
            Une couture, pas dix. Un ourlet laissé brut plutôt que caché.
            La laine avant qu'on la traite.
          </p>
          <div className="md:col-span-4 md:col-start-9 flex flex-col justify-end">
            <p className="text-bone/70 leading-relaxed text-sm">
              Huit pièces, sans saison, cousues en petite série. Ce qui
              reste visible — une couture, un fil qui dépasse — n'est pas
              corrigé : c'est la preuve que la pièce a été faite à la main,
              pas moulée.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-16 md:py-24">
        <div className="flex items-baseline justify-between mb-8 border-b border-line pb-4">
          <h2 className="font-display text-2xl italic">Les huit looks</h2>
          <Link
            href="/produits"
            className="font-mono text-xs tracking-tag uppercase text-ink-soft hover:text-ink focus-ring"
          >
            Tout voir
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              slug={p.slug}
              name={p.name}
              category={p.category}
              priceCents={p.priceCents}
              image={p.image}
              lookNumber={p.lookNumber}
              inStock={p.variants.some((v) => v.stock > 0)}
              listName="Accueil"
            />
          ))}
        </div>
      </section>

      <RecommendedForYou />
    </div>
  );
}
