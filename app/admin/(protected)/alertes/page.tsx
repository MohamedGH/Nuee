import { prisma } from "@/lib/prisma";
import StockAlertRow from "@/components/admin/StockAlertRow";

export const dynamic = "force-dynamic";

export default async function AdminStockAlertsPage() {
  const alerts = await prisma.stockAlert.findMany({
    orderBy: [{ notified: "asc" }, { createdAt: "desc" }],
    include: { product: { include: { variants: true } } },
    take: 200,
  });

  return (
    <div>
      <h1 className="font-display text-3xl italic mb-2">Alertes réassort</h1>
      <p className="text-ink-soft text-sm mb-8">
        Personnes en attente d'un retour en stock. Marque "prévenu(e)" une
        fois l'email envoyé manuellement.
      </p>

      {alerts.length === 0 ? (
        <p className="text-ink-soft text-sm">Aucune alerte enregistrée.</p>
      ) : (
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="text-left text-ink-soft text-xs tracking-tag uppercase border-b border-line">
              <th className="py-2 pr-4">Produit</th>
              <th className="py-2 pr-4">Taille</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Stock actuel</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((a) => {
              const currentStock =
                a.product.variants.find((v) => v.size === a.size)?.stock ?? 0;
              return (
                <tr key={a.id} className="border-b border-line">
                  <td className="py-3 pr-4">{a.product.name}</td>
                  <td className="py-3 pr-4">{a.size}</td>
                  <td className="py-3 pr-4">{a.email}</td>
                  <td className={`py-3 pr-4 ${currentStock > 0 ? "text-brick" : ""}`}>
                    {currentStock}
                  </td>
                  <td className="py-3 pr-4">
                    <StockAlertRow id={a.id} notified={a.notified} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
