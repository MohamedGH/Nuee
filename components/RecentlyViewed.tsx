"use client";

import { useEffect, useState } from "react";
import { useRecentlyViewed } from "@/store/recentlyViewed";
import ProductCard from "@/components/ProductCard";

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

export default function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const ids = useRecentlyViewed((s) => s.ids);
  const [products, setProducts] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const otherIds = ids.filter((id) => id !== excludeId);
    if (otherIds.length === 0) {
      setProducts([]);
      return;
    }
    fetch(`/api/products?ids=${otherIds.join(",")}`)
      .then((res) => res.json())
      .then((data) => {
        // Préserve l'ordre "vu le plus récemment d'abord".
        const byId = new Map((data.products || []).map((p: Product) => [p.id, p]));
        setProducts(otherIds.map((id) => byId.get(id)).filter(Boolean) as Product[]);
      });
  }, [ids, excludeId, mounted]);

  if (!mounted || products.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 pb-24">
      <h2 className="font-display text-2xl italic mb-8 border-b border-line pb-4">
        Consultés récemment
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        {products.slice(0, 4).map((p) => (
          <ProductCard key={p.id} {...p} listName="Consultés récemment" />
        ))}
      </div>
    </section>
  );
}
