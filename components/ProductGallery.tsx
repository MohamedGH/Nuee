"use client";

import { useState } from "react";
import Image from "next/image";
import FavoriteButton from "@/components/FavoriteButton";

export default function ProductGallery({
  images,
  alt,
  lookNumber,
  productId,
}: {
  images: string[];
  alt: string;
  lookNumber: number;
  productId: string;
}) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-[4/5]">
        <Image
          src={images[active]}
          alt={alt}
          fill
          className="object-cover"
          priority
        />
        <span className="absolute top-4 left-4 bg-bone/90 font-mono text-[10px] tracking-tag px-2 py-1">
          LOOK N°{String(lookNumber).padStart(2, "0")}
        </span>
        <FavoriteButton productId={productId} className="absolute top-4 right-4" />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 mt-3" role="tablist" aria-label="Autres vues">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-label={`Vue ${i + 1} sur ${images.length}`}
              onClick={() => setActive(i)}
              className={`focus-ring relative w-16 h-20 shrink-0 overflow-hidden border ${
                active === i ? "border-ink border-2" : "border-line"
              }`}
            >
              <Image src={src} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
