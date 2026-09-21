"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useFavorites } from "@/store/favorites";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";

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

export default function FavoritesPage() {
  const ids = useFavorites((s) => s.ids);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/products?ids=${ids.join(",")}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []))
      .finally(() => setLoading(false));
  }, [ids, mounted]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-10 md:py-16">
      <h1 className="font-display text-4xl italic mb-10 border-b border-line pb-6 flex items-baseline gap-3">
        Favoris
        {mounted && ids.length > 0 && (
          <span className="font-mono text-sm text-ink-soft">
            ({ids.length})
          </span>
        )}
      </h1>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {ids.slice(0, 8).map((id) => (
            <ProductCardSkeleton key={id} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div>
          <p className="text-ink-soft mb-6">
            Aucune pièce mise de côté pour l'instant.
          </p>
          <Link
            href="/produits"
            className="focus-ring inline-block font-mono text-xs tracking-tag uppercase border border-ink px-6 py-3 hover:bg-ink hover:text-bone transition-colors"
          >
            Voir la collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {products.map((p) => (
            <ProductCard key={p.id} {...p} listName="Favoris" />
          ))}
        </div>
      )}
    </div>
  );
}
