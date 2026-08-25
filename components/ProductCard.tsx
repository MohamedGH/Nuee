import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import FavoriteButton from "@/components/FavoriteButton";

type Props = {
  id: string;
  slug: string;
  name: string;
  category: string;
  priceCents: number;
  image: string;
  lookNumber: number;
  inStock?: boolean;
};

export default function ProductCard({
  id,
  slug,
  name,
  category,
  priceCents,
  image,
  lookNumber,
  inStock = true,
}: Props) {
  return (
    <Link href={`/produits/${slug}`} className="group focus-ring block">
      <div className="relative aspect-[4/5] overflow-hidden bg-line">
        <Image
          src={image}
          alt={name}
          fill
          className={`object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
            inStock ? "" : "grayscale opacity-70"
          }`}
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        <span className="absolute top-3 left-3 bg-bone/90 font-mono text-[10px] tracking-tag px-2 py-1">
          LOOK N°{String(lookNumber).padStart(2, "0")}
        </span>
        <FavoriteButton productId={id} className="absolute top-2 right-2" />
        {!inStock && (
          <span className="absolute bottom-3 left-3 bg-ink text-bone font-mono text-[10px] tracking-tag uppercase px-2 py-1">
            Rupture de stock
          </span>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between">
        <div>
          <p className="font-display text-lg leading-tight">{name}</p>
          <p className="font-mono text-[11px] tracking-tag uppercase text-muted mt-0.5">
            {category}
          </p>
        </div>
        <p className="font-mono text-sm shrink-0 pl-3">{formatPrice(priceCents)}</p>
      </div>
    </Link>
  );
}
