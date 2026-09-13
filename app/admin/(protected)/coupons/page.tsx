import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import CouponForm from "@/components/admin/CouponForm";
import CouponToggle from "@/components/admin/CouponToggle";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-display text-3xl italic mb-8">Coupons</h1>

      <CouponForm />

      <div className="mt-10">
        {coupons.length === 0 ? (
          <p className="text-ink-soft text-sm">Aucun coupon pour le moment.</p>
        ) : (
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="text-left text-ink-soft text-xs tracking-tag uppercase border-b border-line">
                <th className="py-2 pr-4">Code</th>
                <th className="py-2 pr-4">Réduction</th>
                <th className="py-2 pr-4">Utilisations</th>
                <th className="py-2 pr-4">Actif</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-line">
                  <td className="py-3 pr-4">{c.code}</td>
                  <td className="py-3 pr-4">
                    {c.percentOff ? `${c.percentOff}%` : formatPrice(c.amountOff ?? 0)}
                  </td>
                  <td className="py-3 pr-4">
                    {c.usedCount}
                    {c.maxUses ? ` / ${c.maxUses}` : ""}
                  </td>
                  <td className="py-3 pr-4">
                    <CouponToggle id={c.id} active={c.active} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
