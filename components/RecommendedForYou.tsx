"use client";

import { useEffect, useState } from "react";
import { useRecentlyViewed } from "@/store/recentlyViewed";
import { useFavorites } from "@/store/favorites";
import { useCart } from "@/store/cart";
import ProductCard from "@/components/ProductCard";
import { trackViewItemList } from "@/lib/analytics";
import {
  rankCategories,
  allocateSlots,
  mergeRecommendations,
  limitIds,
  buildExcludeList,
} from "@/lib/recommendations";

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

const TOTAL = 4;

export default function RecommendedForYou() {
  const recentIds = useRecentlyViewed((s) => s.ids);
  const favoriteIds = useFavorites((s) => s.ids);
  // Sélecteur renvoyant une chaîne : stable par valeur, pas de ré-exécution
  // de l'effet à chaque changement de quantité dans le panier.
  const cartKey = useCart((s) => s.items.map((i) => i.productId).join(","));
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    // Une réponse arrivée après un changement de comportement (ou un
    // démontage) ne doit pas écraser un état plus récent.
    let cancelled = false;

    // /api/products plafonne `ids` et `exclude` à 50 : au-delà il renvoie
    // une liste vide sans erreur, donc on plafonne ici en gardant le plus
    // récent/pertinent d'abord.
    const seenIds = limitIds([...recentIds, ...favoriteIds]);
    if (seenIds.length === 0) {
      setProducts([]);
      setCategories([]);
      return;
    }
    const cartIds = cartKey ? cartKey.split(",") : [];
    const exclude = buildExcludeList(cartIds, recentIds, favoriteIds);

    (async () => {
      try {
        const seenRes = await fetch(`/api/products?ids=${seenIds.join(",")}`);
        const { products: seen = [] } = (await seenRes.json()) as { products?: Product[] };

        const allocation = allocateSlots(rankCategories(recentIds, favoriteIds, seen), TOTAL);
        if (allocation.length === 0) {
          if (!cancelled) setProducts([]);
          return;
        }

        const fetched = Object.fromEntries(
          await Promise.all(
            allocation.map(async ({ category }) => {
              const res = await fetch(
                `/api/products?category=${encodeURIComponent(category)}&exclude=${exclude.join(",")}&limit=${TOTAL}`
              );
              const data = (await res.json()) as { products?: Product[] };
              return [category, data.products ?? []] as const;
            })
          )
        );

        const merged = mergeRecommendations(allocation, fetched, TOTAL, new Set(exclude));
        if (cancelled) return;

        setCategories(allocation.map((a) => a.category));
        setProducts(merged);
        if (merged.length > 0) {
          trackViewItemList(
            merged.map((p) => ({
              item_id: p.id,
              item_name: p.name,
              item_category: p.category,
              price: p.priceCents / 100,
            })),
            "Recommandé pour vous"
          );
        }
      } catch {
        // Hors ligne ou erreur serveur : pas de recommandations, pas de rejet non géré.
        if (!cancelled) setProducts([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mounted, recentIds, favoriteIds, cartKey]);

  if (!mounted || products.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-16 md:py-24 border-t border-line">
      <div className="flex items-baseline justify-between mb-8">
        <h2 className="font-display text-2xl italic">Recommandé pour vous</h2>
        {categories.length > 0 && (
          <p className="font-mono text-xs tracking-tag uppercase text-ink-soft">
            D'après votre intérêt pour {categories.map((c) => c.toLowerCase()).join(" et ")}
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
