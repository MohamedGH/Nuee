import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";

export const dynamic = "force-dynamic";

const STATUSES = ["pending", "payée", "expédiée", "livrée", "remboursée", "annulée"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { statut?: string; q?: string };
}) {
  const statut = searchParams.statut;
  const q = searchParams.q?.trim();

  const orders = await prisma.order.findMany({
    where: {
      ...(statut ? { status: statut } : {}),
      ...(q ? { customerEmail: { contains: q } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: true },
  });

  const qs = (overrides: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const next = { statut, q, ...overrides };
    if (next.statut) p.set("statut", next.statut);
    if (next.q) p.set("q", next.q);
    const s = p.toString();
    return s ? `/admin/commandes?${s}` : "/admin/commandes";
  };

  return (
    <div>
      <h1 className="font-display text-3xl italic mb-8">Commandes</h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <form action="/admin/commandes" className="flex gap-2">
          {statut && <input type="hidden" name="statut" value={statut} />}
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Recherche par email"
            className="focus-ring border border-line px-3 py-2 bg-bone font-mono text-sm"
          />
          <button
            type="submit"
            className="focus-ring font-mono text-xs tracking-tag uppercase border border-ink px-4 hover:bg-ink hover:text-bone transition-colors"
          >
            Chercher
          </button>
        </form>

        <div className="flex flex-wrap gap-2 font-mono text-xs tracking-tag uppercase">
          <Link
            href={qs({ statut: undefined })}
            className={`px-3 py-1.5 border ${!statut ? "bg-ink text-bone border-ink" : "border-line text-ink-soft"}`}
          >
            Tout
          </Link>
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={qs({ statut: s })}
              className={`px-3 py-1.5 border ${statut === s ? "bg-ink text-bone border-ink" : "border-line text-ink-soft"}`}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="text-ink-soft text-sm">Aucune commande ne correspond.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="text-left text-ink-soft text-xs tracking-tag uppercase border-b border-line">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Articles</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Statut</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-line">
                  <td className="py-3 pr-4 whitespace-nowrap">
                    {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="py-3 pr-4">{o.customerEmail}</td>
                  <td className="py-3 pr-4">
                    {o.items.reduce((sum, i) => sum + i.quantity, 0)}
                  </td>
                  <td className="py-3 pr-4">{formatPrice(o.totalCents)}</td>
                  <td className="py-3 pr-4">
                    <OrderStatusSelect orderId={o.id} status={o.status} />
                  </td>
                  <td className="py-3 pr-4">
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
        </div>
      )}
    </div>
  );
}
