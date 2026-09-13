import { prisma } from "@/lib/prisma";
import StockInput from "@/components/admin/StockInput";

export const dynamic = "force-dynamic";

export default async function AdminStockPage() {
  const products = await prisma.product.findMany({
    include: { variants: true },
    orderBy: { lookNumber: "asc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl italic mb-8">Stock</h1>

      <div className="flex flex-col gap-8">
        {products.map((p) => (
          <div key={p.id} className="border border-line p-5">
            <p className="font-display text-lg mb-4">{p.name}</p>
            <div className="flex flex-wrap gap-4">
              {p.variants.map((v) => (
                <div key={v.id} className="flex items-center gap-2">
                  <span className="font-mono text-xs text-ink-soft w-6">{v.size}</span>
                  <StockInput variantId={v.id} stock={v.stock} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
