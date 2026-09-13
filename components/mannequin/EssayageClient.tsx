"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Mannequin3D from "./Mannequin3D";
import SlotPicker from "./SlotPicker";
import type { GarmentSelection } from "./MannequinScene";
import { CATEGORY_HAUT_STYLE, firstColorHex } from "./types";
import type { MannequinProduct, Slot } from "./types";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/format";

const SIZES = ["XS", "S", "M", "L", "XL"];

export default function EssayageClient({
  groups,
  initialProductId,
}: {
  groups: Record<Slot, MannequinProduct[]>;
  initialProductId?: string;
}) {
  const findInitial = (): { slot: Slot; product: MannequinProduct } | null => {
    if (!initialProductId) return null;
    for (const slot of Object.keys(groups) as Slot[]) {
      const match = groups[slot].find((p) => p.id === initialProductId);
      if (match) return { slot, product: match };
    }
    return null;
  };
  const initial = findInitial();

  const [selected, setSelected] = useState<Partial<Record<Slot, MannequinProduct>>>(
    initial ? { [initial.slot]: initial.product } : {}
  );
  const [size, setSize] = useState("M");
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);

  function setSlot(slot: Slot, product: MannequinProduct | null) {
    setSelected((prev) => {
      const next = { ...prev };
      if (product) next[slot] = product;
      else delete next[slot];
      return next;
    });
  }

  const selection: GarmentSelection = useMemo(() => {
    const haut = selected.haut
      ? {
          style: CATEGORY_HAUT_STYLE[selected.haut.category] ?? "shirt",
          color: firstColorHex(selected.haut.colors),
        }
      : null;
    const bas = selected.bas ? { color: firstColorHex(selected.bas.colors) } : null;
    const robe = selected.robe ? { color: firstColorHex(selected.robe.colors) } : null;
    const accessoire = selected.accessoire
      ? { color: firstColorHex(selected.accessoire.colors) }
      : null;
    return { haut, bas, robe, accessoire };
  }, [selected]);

  const items = Object.values(selected);
  const total = items.reduce((sum, p) => sum + p.priceCents, 0);

  function handleAddOutfit() {
    let anyAdded = false;
    for (const p of items) {
      const variant = p.variants.find((v) => v.size === size && v.stock > 0);
      if (!variant) continue;
      add({
        productId: p.id,
        slug: p.slug,
        name: p.name,
        size,
        priceCents: p.priceCents,
        image: p.image,
        quantity: 1,
      });
      anyAdded = true;
    }
    if (anyAdded) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  }

  const missingInSize = items.filter(
    (p) => !p.variants.some((v) => v.size === size && v.stock > 0)
  );

  return (
    <div className="grid md:grid-cols-2 gap-8 md:gap-12">
      <div className="md:sticky md:top-24 h-fit">
        <Mannequin3D selection={selection} />
        <p className="font-mono text-[11px] text-muted mt-3">
          Cliquer-glisser pour faire tourner le mannequin.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-8">
          <p className="font-display text-xl italic border-b border-line pb-4">
            Composez la tenue
          </p>
          <SlotPicker
            label="Hauts"
            products={groups.haut}
            selectedId={selected.haut?.id ?? null}
            onSelect={(p) => setSlot("haut", p)}
            disabled={!!selected.robe}
          />
          <SlotPicker
            label="Bas"
            products={groups.bas}
            selectedId={selected.bas?.id ?? null}
            onSelect={(p) => setSlot("bas", p)}
            disabled={!!selected.robe}
          />
          <SlotPicker
            label="Robes"
            products={groups.robe}
            selectedId={selected.robe?.id ?? null}
            onSelect={(p) => setSlot("robe", p)}
          />
          <SlotPicker
            label="Accessoires"
            products={groups.accessoire}
            selectedId={selected.accessoire?.id ?? null}
            onSelect={(p) => setSlot("accessoire", p)}
          />

          {selected.robe && (
            <p className="font-mono text-[11px] text-muted -mt-4">
              Une robe remplace le haut et le bas sur le mannequin.
            </p>
          )}
        </div>

        {items.length > 0 && (
          <div className="border border-line p-6">
            <p className="font-mono text-xs tracking-tag uppercase text-ink-soft mb-4">
              Tenue sélectionnée
            </p>
            <ul className="flex flex-col gap-2 mb-4">
              {items.map((p) => (
                <li key={p.id} className="flex justify-between text-sm font-mono">
                  <Link href={`/produits/${p.slug}`} className="focus-ring hover:text-brick">
                    {p.name}
                  </Link>
                  <span>{formatPrice(p.priceCents)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between font-mono text-sm mb-6 pt-3 border-t border-line">
              <span className="font-medium">Total</span>
              <span className="font-medium">{formatPrice(total)}</span>
            </div>

            <label className="block font-mono text-xs tracking-tag uppercase text-ink-soft mb-2">
              Taille pour toute la tenue
            </label>
            <div className="flex gap-2 mb-4">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`focus-ring font-mono text-sm w-11 h-11 border transition-colors ${
                    size === s
                      ? "bg-ink text-bone border-ink"
                      : "border-ink hover:bg-ink hover:text-bone"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {missingInSize.length > 0 && (
              <p className="text-xs text-brick font-mono mb-4">
                Indisponible en {size} : {missingInSize.map((p) => p.name).join(", ")}
              </p>
            )}

            <button
              onClick={handleAddOutfit}
              disabled={missingInSize.length === items.length}
              className="focus-ring w-full font-mono text-xs tracking-tag uppercase px-6 py-4 bg-ink text-bone hover:bg-brick-dark transition-colors disabled:bg-muted disabled:cursor-not-allowed"
            >
              {added ? "Ajouté au panier ✓" : "Ajouter la tenue au panier"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
