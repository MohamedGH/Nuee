import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [orders, lowStock, pendingReviews, pendingAlerts, recentOrders] = await Promise.all([
    prisma.order.findMany({ where: { status: "payée" } }),
    prisma.variant.findMany({
      where: { stock: { lte: 3 } },
      include: { product: true },
      orderBy: { stock: "asc" },
      take: 8,
    }),
    prisma.review.count({ where: { verified: false } }),
    prisma.stockAlert.count({ where: { notified: false } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const revenue = orders.reduce((sum, o) => sum + o.totalCents, 0);

  return (
    <div>
      <h1 className="font-display text-3xl italic mb-8">Tableau de bord</h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { label: "Commandes payées", value: orders.length },
          { label: "Chiffre d'affaires", value: formatPrice(revenue) },
          { label: "Avis à modérer", value: pendingReviews },
          { label: "Alertes réassort en attente", value: pendingAlerts },
        ].map((s) => (
          <div key={s.label} className="border border-line p-5">
            <p className="font-mono text-xs tracking-tag uppercase text-ink-soft mb-2">
              {s.label}
            </p>
            <p className="font-display text-2xl">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4 border-b border-line pb-3">
        <h2 className="font-display text-xl italic">Commandes récentes</h2>
        <Link
          href="/admin/commandes"
          className="focus-ring font-mono text-xs tracking-tag uppercase text-ink-soft hover:text-ink"
        >
          Voir toutes les commandes
        </Link>
      </div>

      {recentOrders.length === 0 ? (
        <p className="text-ink-soft text-sm mb-12">Aucune commande pour le moment.</p>
      ) : (
        <table className="w-full text-sm font-mono mb-12">
          <thead>
            <tr className="text-left text-ink-soft text-xs tracking-tag uppercase border-b border-line">
              <th className="py-2">Date</th>
              <th className="py-2">Email</th>
              <th className="py-2">Total</th>
              <th className="py-2">Statut</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o.id} className="border-b border-line">
                <td className="py-2">{new Date(o.createdAt).toLocaleDateString("fr-FR")}</td>
                <td className="py-2">{o.customerEmail}</td>
                <td className="py-2">{formatPrice(o.totalCents)}</td>
                <td className="py-2">{o.status}</td>
                <td className="py-2">
                  <Link
                    href={`/admin/commandes/${o.id}`}
                    className="focus-ring text-ink-soft hover:text-ink underline underline-offset-4"
                  >
                    Détail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex items-center justify-between mb-4 border-b border-line pb-3">
        <h2 className="font-display text-xl italic">Stock bas</h2>
        <Link
          href="/admin/stock"
          className="focus-ring font-mono text-xs tracking-tag uppercase text-ink-soft hover:text-ink"
        >
          Voir tout le stock
        </Link>
      </div>

      {lowStock.length === 0 ? (
        <p className="text-ink-soft text-sm">Aucune référence sous le seuil d'alerte.</p>
      ) : (
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="text-left text-ink-soft text-xs tracking-tag uppercase border-b border-line">
              <th className="py-2">Produit</th>
              <th className="py-2">Taille</th>
              <th className="py-2">Stock</th>
            </tr>
          </thead>
          <tbody>
            {lowStock.map((v) => (
              <tr key={v.id} className="border-b border-line">
                <td className="py-2">{v.product.name}</td>
                <td className="py-2">{v.size}</td>
                <td className={`py-2 ${v.stock === 0 ? "text-brick" : ""}`}>{v.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
