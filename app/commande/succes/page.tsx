"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/format";

type OrderSummary = {
  id: string;
  totalCents: number;
  discountCents: number;
  shippingCents: number;
  items: { id: string; name: string; category: string; priceCents: number; quantity: number }[];
};

export default function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const clear = useCart((s) => s.clear);
  const sessionId = searchParams.session_id;
  const [order, setOrder] = useState<OrderSummary | null>(null);

  useEffect(() => {
    clear();
  }, [clear]);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/orders/by-session?session_id=${encodeURIComponent(sessionId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setOrder)
      .catch(() => {
        // Le récapitulatif est un confort, pas un élément bloquant.
      });
  }, [sessionId]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-12 py-24 text-center">
      <p className="font-mono text-xs tracking-tag uppercase text-brick mb-6">
        Commande confirmée
      </p>
      <h1 className="font-display text-4xl italic mb-6">Merci.</h1>
      <p className="text-ink-soft leading-relaxed mb-2">
        Le paiement de test a été accepté. Un email de confirmation aurait
        normalement été envoyé.
      </p>
      {sessionId && (
        <p className="font-mono text-xs text-muted mb-10 break-all">
          Référence : {sessionId}
        </p>
      )}

      {order && (
        <div className="border border-line p-6 text-left mb-10">
          <p className="font-mono text-xs tracking-tag uppercase text-ink-soft mb-4">
            Récapitulatif
          </p>
          <div className="flex flex-col gap-3 mb-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm font-mono">
                <span>
                  {item.name} <span className="text-ink-soft">× {item.quantity}</span>
                </span>
                <span>{formatPrice(item.priceCents * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-mono text-sm pt-3 border-t border-line font-medium">
            <span>Total payé</span>
            <span>{formatPrice(order.totalCents)}</span>
          </div>
        </div>
      )}

      <Link
        href="/produits"
        className="focus-ring inline-block font-mono text-xs tracking-tag uppercase border border-ink px-6 py-3 hover:bg-ink hover:text-bone transition-colors"
      >
        Continuer les achats
      </Link>
    </div>
  );
}
