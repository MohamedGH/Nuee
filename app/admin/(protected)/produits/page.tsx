import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { lookNumber: "asc" } });

  return (
    <div>
      <h1 className="font-display text-3xl italic mb-8">Produits</h1>

      <div className="flex flex-col gap-3">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/admin/produits/${p.id}`}
            className="focus-ring flex items-center gap-4 border border-line p-3 hover:border-ink transition-colors"
          >
            <div className="relative w-12 h-14 shrink-0 bg-line">
              <Image src={p.image} alt={p.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <p className="font-display">{p.name}</p>
              <p className="font-mono text-xs text-ink-soft">{p.category}</p>
            </div>
            <p className="font-mono text-sm">{formatPrice(p.priceCents)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
