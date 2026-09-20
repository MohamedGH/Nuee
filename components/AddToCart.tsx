"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import StockAlertForm from "@/components/StockAlertForm";
import QuantityStepper from "@/components/QuantityStepper";
import { trackAddToCart } from "@/lib/analytics";

type Variant = { size: string; stock: number };

type Props = {
  productId: string;
  slug: string;
  name: string;
  category: string;
  priceCents: number;
  image: string;
  variants: Variant[];
};

export default function AddToCart({
  productId,
  slug,
  name,
  category,
  priceCents,
  image,
  variants,
}: Props) {
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const add = useCart((s) => s.add);
  const router = useRouter();

  const selectedVariant = variants.find((v) => v.size === size);
  const maxQuantity = Math.min(selectedVariant?.stock ?? 10, 10);
  const outOfStock = selectedVariant?.stock === 0;

  function handleAdd() {
    if (!size) {
      setSizeError(true);
      return;
    }
    if (outOfStock) return;
    add({ productId, slug, name, size, priceCents, image, quantity });
    trackAddToCart({
      item_id: productId,
      item_name: name,
      item_category: category,
      price: priceCents / 100,
      quantity,
    });
    setAdded(true);
    setQuantity(1);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div>
      <p
        role={sizeError ? "alert" : undefined}
        className={`font-mono text-xs tracking-tag uppercase mb-3 ${
          sizeError ? "text-brick" : "text-ink-soft"
        }`}
      >
        {sizeError ? "Choisis une taille" : "Taille"}
      </p>
      <div
        className={`flex flex-wrap gap-2 mb-6 ${sizeError ? "outline outline-1 outline-brick outline-offset-4" : ""}`}
      >
        {variants.map((v) => (
          <button
            key={v.size}
            onClick={() => {
              setSize(v.size);
              setQuantity(1);
              setSizeError(false);
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
          <QuantityStepper
            quantity={quantity}
            max={maxQuantity}
            onChange={setQuantity}
            size="lg"
          />
        </div>
      )}

      {!outOfStock && (
        <button
          onClick={handleAdd}
          className="focus-ring w-full md:w-auto font-mono text-xs tracking-tag uppercase px-8 py-4 bg-ink text-bone hover:bg-brick-dark transition-colors"
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
