"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";

export default function SearchBar({ defaultValue }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue || "");
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams?.toString());
    if (value.trim()) params.set("q", value.trim());
    else params.delete("q");
    router.push(`/produits?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full md:w-64">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Rechercher une pièce…"
        aria-label="Rechercher"
        className="focus-ring w-full border border-line pl-9 pr-3 py-2 bg-bone font-body text-sm"
      />
      <button
        type="submit"
        aria-label="Lancer la recherche"
        className="focus-ring absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-soft"
      >
        <Search size={16} aria-hidden />
      </button>
    </form>
  );
}
