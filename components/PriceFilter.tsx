"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trackFilter } from "@/lib/analytics";

export default function PriceFilter({
  defaultMin,
  defaultMax,
}: {
  defaultMin?: number;
  defaultMax?: number;
}) {
  const [min, setMin] = useState(defaultMin?.toString() ?? "");
  const [max, setMax] = useState(defaultMax?.toString() ?? "");
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    trackFilter({
      minPrice: min ? Number(min) : undefined,
      maxPrice: max ? Number(max) : undefined,
    });
    const params = new URLSearchParams(searchParams?.toString());
    if (min) params.set("min", min);
    else params.delete("min");
    if (max) params.set("max", max);
    else params.delete("max");
    router.push(`/produits?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <label className="sr-only" htmlFor="price-min">Prix minimum</label>
      <input
        id="price-min"
        type="number"
        min={0}
        inputMode="numeric"
        value={min}
        onChange={(e) => setMin(e.target.value)}
        placeholder="Min €"
        className="focus-ring w-20 border border-line px-2 py-2 bg-bone font-mono text-xs"
      />
      <span className="text-ink-soft font-mono text-xs">–</span>
      <label className="sr-only" htmlFor="price-max">Prix maximum</label>
      <input
        id="price-max"
        type="number"
        min={0}
        inputMode="numeric"
        value={max}
        onChange={(e) => setMax(e.target.value)}
        placeholder="Max €"
        className="focus-ring w-20 border border-line px-2 py-2 bg-bone font-mono text-xs"
      />
      <button
        type="submit"
        className="focus-ring font-mono text-xs tracking-tag uppercase border border-ink px-3 py-2 hover:bg-ink hover:text-bone transition-colors"
      >
        OK
      </button>
    </form>
  );
}
