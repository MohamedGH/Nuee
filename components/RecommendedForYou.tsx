"use client";

import { useEffect, useState } from "react";
import { useRecentlyViewed } from "@/store/recentlyViewed";
import { useFavorites } from "@/store/favorites";
import ProductCard from "@/components/ProductCard";
import { trackViewItemList } from "@/lib/analytics";

type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  priceCents: number;
  image: string;
  lookNumber: number;
  inStock: boolean;
};

export default function RecommendedForYou() {
  const recentIds = useRecentlyViewed((s) => s.ids);
  const favoriteIds = useFavorites((s) => s.ids);
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    // Les favoris comptent double : un ajout aux favoris est un signal plus
    // fort qu'une simple consultation.
    const seenIds = [...new Set([...recentIds, ...favoriteIds])];
    if (seenIds.length === 0) {
      setProducts([]);
      return;
    }

    fetch(`/api/products?ids=${seenIds.join(",")}`)
      .then((res) => res.json())
      .then((data) => {
        const seen: Product[] = data.products || [];
        if (seen.length === 0) return;

        const scores = new Map<string, number>();
        for (const id of recentIds) {
          const p = seen.find((x) => x.id === id);
          if (p) scores.set(p.category, (scores.get(p.category) ?? 0) + 1);
        }
        for (const id of favoriteIds) {
          const p = seen.find((x) => x.id === id);
          if (p) scores.set(p.category, (scores.get(p.category) ?? 0) + 2);
        }

        const topCategory = [...scores.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
        if (!topCategory) return;

        setCategory(topCategory);
        return fetch(
          `/api/products?category=${encodeURIComponent(topCategory)}&exclude=${seenIds.join(",")}&limit=4`
        )
          .then((res) => res.json())
          .then((data) => {
            const recommended = data.products || [];
            setProducts(recommended);
            if (recommended.length > 0) {
              trackViewItemList(
                recommended.map((p: Product) => ({
                  item_id: p.id,
                  item_name: p.name,
                  item_category: p.category,
                  price: p.priceCents / 100,
                })),
                "Recommandé pour vous"
              );
            }
          });
      });
  }, [mounted, recentIds, favoriteIds]);

  if (!mounted || products.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-16 md:py-24 border-t border-line">
      <div className="flex items-baseline justify-between mb-8">
        <h2 className="font-display text-2xl italic">Recommandé pour vous</h2>
        {category && (
          <p className="font-mono text-xs tracking-tag uppercase text-ink-soft">
            D'après votre intérêt pour {category.toLowerCase()}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        {products.map((p) => (
          <ProductCard key={p.id} {...p} listName="Recommandé pour vous" />
        ))}
      </div>
    </section>
  );
}
