"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useFavorites } from "@/store/favorites";

export default function FavoriteButton({
  productId,
  className = "",
}: {
  productId: string;
  className?: string;
}) {
  const { has, toggle } = useFavorites();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const active = mounted && has(productId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={active}
      className={`focus-ring bg-bone/90 p-2 hover:bg-bone transition-colors ${className}`}
    >
      <Heart
        size={16}
        className={active ? "fill-brick text-brick" : "text-ink"}
        aria-hidden
      />
    </button>
  );
}
