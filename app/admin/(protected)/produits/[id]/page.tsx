import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductEditForm from "@/components/admin/ProductEditForm";

export const dynamic = "force-dynamic";

export default async function AdminProductEditPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) notFound();

  return (
    <div>
      <Link
        href="/admin/produits"
        className="focus-ring font-mono text-xs tracking-tag uppercase text-ink-soft hover:text-ink"
      >
        ← Produits
      </Link>

      <h1 className="font-display text-3xl italic mt-4 mb-8">{product.name}</h1>

      <ProductEditForm
        productId={product.id}
        initialName={product.name}
        initialDescription={product.description}
        initialPriceCents={product.priceCents}
      />

      <p className="font-mono text-xs text-muted mt-6">
        Catégorie, coloris, images et tailles ne sont pas modifiables ici —
        cela demanderait de gérer l'upload de fichiers, hors du périmètre de
        cette démo. Le stock se gère depuis{" "}
        <Link href="/admin/stock" className="underline underline-offset-4">
          Stock
        </Link>
        .
      </p>
    </div>
  );
}
