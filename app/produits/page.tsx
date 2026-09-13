import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import SortSelect from "@/components/SortSelect";
import PriceFilter from "@/components/PriceFilter";

export const dynamic = "force-dynamic";

const SORT_OPTIONS: Record<string, any> = {
  nouveautes: { createdAt: "desc" },
  "prix-asc": { priceCents: "asc" },
  "prix-desc": { priceCents: "desc" },
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: { cat?: string; q?: string; sort?: string; min?: string; max?: string };
}) {
  const cat = searchParams.cat;
  const q = searchParams.q?.trim();
  const sort = searchParams.sort && SORT_OPTIONS[searchParams.sort] ? searchParams.sort : "nouveautes";
  const min = searchParams.min ? Number(searchParams.min) : undefined;
  const max = searchParams.max ? Number(searchParams.max) : undefined;

  const where: any = {};
  if (cat) where.category = cat;
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { category: { contains: q } },
    ];
  }
  if (min !== undefined || max !== undefined) {
    where.priceCents = {};
    if (min !== undefined && !Number.isNaN(min)) where.priceCents.gte = min * 100;
    if (max !== undefined && !Number.isNaN(max)) where.priceCents.lte = max * 100;
  }

  const [products, categoriesRaw] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: SORT_OPTIONS[sort],
      include: { variants: true },
    }),
    prisma.product.findMany({ select: { category: true }, distinct: ["category"] }),
  ]);

  const categories = categoriesRaw.map((c) => c.category);

  const keepParams = (overrides: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    if (cat) p.set("cat", cat);
    if (q) p.set("q", q);
    if (sort !== "nouveautes") p.set("sort", sort);
    if (min !== undefined) p.set("min", String(min));
    if (max !== undefined) p.set("max", String(max));
    for (const [k, v] of Object.entries(overrides)) {
      if (v === undefined) p.delete(k);
      else p.set(k, v);
    }
    const qs = p.toString();
    return qs ? `/produits?${qs}` : "/produits";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-10 md:py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 border-b border-line pb-6">
        <h1 className="font-display text-4xl italic">Collection</h1>
        <SearchBar defaultValue={q} />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex flex-wrap gap-2 font-mono text-xs tracking-tag uppercase">
          <Link
            href={keepParams({ cat: undefined })}
            className={`focus-ring px-3 py-1.5 border ${
              !cat ? "bg-ink text-bone border-ink" : "border-line text-ink-soft hover:border-ink"
            }`}
          >
            Tout
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={keepParams({ cat: c })}
              className={`focus-ring px-3 py-1.5 border ${
                cat === c
                  ? "bg-ink text-bone border-ink"
                  : "border-line text-ink-soft hover:border-ink"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <PriceFilter defaultMin={min} defaultMax={max} />
          <SortSelect currentSort={sort} basePath={keepParams({ sort: undefined })} />
        </div>
      </div>

      {(q || cat || min !== undefined || max !== undefined) && (
        <div className="flex items-center justify-between mb-6">
          <p className="font-mono text-xs text-ink-soft">
            {products.length} résultat{products.length !== 1 ? "s" : ""}
            {q ? <> pour «&nbsp;{q}&nbsp;»</> : null}
          </p>
          <Link
            href="/produits"
            className="focus-ring font-mono text-xs text-ink-soft hover:text-ink underline underline-offset-4"
          >
            Réinitialiser les filtres
          </Link>
        </div>
      )}

      {products.length === 0 ? (
        <p className="text-ink-soft">Aucune pièce ne correspond à cette recherche.</p>
      ) : (
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
