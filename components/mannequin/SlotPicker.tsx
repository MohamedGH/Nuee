"use client";

import Image from "next/image";
import { formatPrice } from "@/lib/format";
import { firstColorHex } from "./types";
import type { MannequinProduct } from "./types";

export default function SlotPicker({
  label,
  products,
  selectedId,
  onSelect,
  disabled,
}: {
  label: string;
  products: MannequinProduct[];
  selectedId: string | null;
  onSelect: (product: MannequinProduct | null) => void;
  disabled?: boolean;
}) {
  if (products.length === 0) return null;

  return (
    <div className={disabled ? "opacity-40 pointer-events-none" : ""}>
      <p className="font-mono text-xs tracking-tag uppercase text-ink-soft mb-3">
        {label}
      </p>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {products.map((p) => {
          const active = p.id === selectedId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(active ? null : p)}
              aria-pressed={active}
              className={`focus-ring shrink-0 w-20 text-left group ${
                active ? "" : ""
              }`}
            >
              <div
                className={`relative w-20 h-24 overflow-hidden border ${
                  active ? "border-ink border-2" : "border-line"
                }`}
              >
                <Image src={p.image} alt={p.name} fill className="object-cover" />
                <span
                  className="absolute bottom-1 left-1 w-3 h-3 rounded-full border border-bone"
                  style={{ backgroundColor: firstColorHex(p.colors) }}
                  aria-hidden
                />
              </div>
              <p className="font-mono text-[10px] mt-1.5 leading-tight line-clamp-2">
                {p.name}
              </p>
              <p className="font-mono text-[10px] text-ink-soft">
                {formatPrice(p.priceCents)}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
