import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: true } } },
  });

  if (!order) notFound();

  return (
    <div>
      <Link
        href="/admin/commandes"
        className="focus-ring font-mono text-xs tracking-tag uppercase text-ink-soft hover:text-ink"
      >
        ← Commandes
      </Link>

      <div className="flex items-center justify-between mt-4 mb-8">
        <h1 className="font-display text-3xl italic">Commande</h1>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 flex flex-col gap-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 border-b border-line pb-4">
              <div className="relative w-16 h-20 shrink-0 bg-line">
                <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-display">{item.product.name}</p>
                <p className="font-mono text-xs text-ink-soft">
                  Taille {item.size} · Qté {item.quantity}
                </p>
              </div>
              <p className="font-mono text-sm">{formatPrice(item.priceCents * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="border border-line p-5 h-fit font-mono text-sm">
          <p className="text-xs tracking-tag uppercase text-ink-soft mb-3">Client</p>
          <p className="mb-4">{order.customerEmail}</p>

          <p className="text-xs tracking-tag uppercase text-ink-soft mb-3 pt-3 border-t border-line">
            Adresse de livraison
          </p>
          {order.shippingLine1 ? (
            <address className="not-italic leading-relaxed mb-4">
              {order.shippingName && <>{order.shippingName}<br /></>}
              {order.shippingLine1}<br />
              {order.shippingLine2 && <>{order.shippingLine2}<br /></>}
              {order.shippingPostal} {order.shippingCity}<br />
              {order.shippingCountry}
            </address>
          ) : (
            <p className="text-ink-soft mb-4">
              {order.status === "pending"
                ? "Pas encore transmise (paiement non confirmé)."
                : "Non transmise par Stripe pour cette commande."}
            </p>
          )}

          <p className="text-xs tracking-tag uppercase text-ink-soft mb-3 pt-3 border-t border-line">
            Détails
          </p>
          <div className="flex justify-between mb-1">
            <span className="text-ink-soft">Date</span>
            <span>{new Date(order.createdAt).toLocaleDateString("fr-FR")}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-ink-soft">Livraison</span>
            <span>{order.shippingMethod}</span>
          </div>
          {order.discountCents > 0 && (
            <div className="flex justify-between mb-1 text-brick">
              <span>Réduction {order.couponCode ? `(${order.couponCode})` : ""}</span>
              <span>-{formatPrice(order.discountCents)}</span>
            </div>
          )}
          {order.giftWrap && (
            <div className="flex justify-between mb-1">
              <span className="text-ink-soft">Emballage cadeau</span>
              <span>Oui</span>
            </div>
          )}
          <div className="flex justify-between pt-3 border-t border-line font-medium">
            <span>Total</span>
            <span>{formatPrice(order.totalCents)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
