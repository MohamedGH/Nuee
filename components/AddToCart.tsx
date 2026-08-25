"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/store/cart";
import StockAlertForm from "@/components/StockAlertForm";

type Variant = { size: string; stock: number };

type Props = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  image: string;
  variants: Variant[];
};

export default function AddToCart({
  productId,
  slug,
  name,
  priceCents,
  image,
  variants,
}: Props) {
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);
  const router = useRouter();

  const selectedVariant = variants.find((v) => v.size === size);
  const maxQuantity = Math.min(selectedVariant?.stock ?? 10, 10);
  const outOfStock = selectedVariant?.stock === 0;

  function handleAdd() {
    if (!size || outOfStock) return;
    add({ productId, slug, name, size, priceCents, image, quantity });
    setAdded(true);
    setQuantity(1);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div>
      <p className="font-mono text-xs tracking-tag uppercase text-ink-soft mb-3">
        Taille
      </p>
      <div className="flex flex-wrap gap-2 mb-6">
        {variants.map((v) => (
          <button
            key={v.size}
            onClick={() => {
              setSize(v.size);
              setQuantity(1);
            }}
            aria-label={v.stock === 0 ? `Taille ${v.size}, en rupture de stock` : `Taille ${v.size}`}
            className={`focus-ring font-mono text-sm w-12 h-12 border transition-colors ${
              size === v.size
                ? "bg-ink text-bone border-ink"
                : v.stock === 0
                ? "border-line text-muted line-through hover:border-ink"
                : "border-ink hover:bg-ink hover:text-bone"
            }`}
          >
            {v.size}
          </button>
        ))}
      </div>

      {size && selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 3 && (
        <p className="text-xs text-brick mb-4 font-mono">
          Plus que {selectedVariant.stock} en stock
        </p>
      )}

      {size && outOfStock && (
        <div className="mb-6">
          <p className="text-xs text-brick mb-3 font-mono">
            Taille {size} en rupture de stock.
          </p>
          <StockAlertForm productId={productId} size={size} />
        </div>
      )}

      {size && !outOfStock && (
        <div className="mb-6">
          <p className="font-mono text-xs tracking-tag uppercase text-ink-soft mb-3">
            Quantité
          </p>
          <div className="flex items-center border border-ink w-fit">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Diminuer la quantité"
              className="focus-ring p-3 hover:bg-ink hover:text-bone transition-colors"
            >
              <Minus size={14} aria-hidden />
            </button>
            <span className="font-mono text-sm w-8 text-center" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
              aria-label="Augmenter la quantité"
              disabled={quantity >= maxQuantity}
              className="focus-ring p-3 hover:bg-ink hover:text-bone transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus size={14} aria-hidden />
            </button>
          </div>
        </div>
      )}

      {!outOfStock && (
        <button
          onClick={handleAdd}
          disabled={!size}
          className="focus-ring w-full md:w-auto font-mono text-xs tracking-tag uppercase px-8 py-4 bg-ink text-bone hover:bg-brick-dark transition-colors disabled:bg-muted disabled:cursor-not-allowed"
        >
          {added ? "Ajouté ✓" : "Ajouter au panier"}
        </button>
      )}

      {added && (
        <button
          onClick={() => router.push("/panier")}
          className="focus-ring ml-4 font-mono text-xs tracking-tag uppercase underline underline-offset-4 hover:text-brick"
        >
          Voir le panier
        </button>
      )}
    </div>
  );
}
