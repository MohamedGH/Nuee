"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { trackPurchase } from "@/lib/analytics";

export default function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const clear = useCart((s) => s.clear);
  const sessionId = searchParams.session_id;

  useEffect(() => {
    clear();
  }, [clear]);

  useEffect(() => {
    if (!sessionId) return;

    // Évite de compter deux fois le même achat si la page est rechargée.
    const dedupeKey = `nuee-purchase-tracked:${sessionId}`;
    if (window.sessionStorage.getItem(dedupeKey)) return;

    fetch(`/api/orders/by-session?session_id=${encodeURIComponent(sessionId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((order) => {
        if (!order) return;
        trackPurchase({
          transactionId: order.id,
          value: order.totalCents / 100,
          shipping: order.shippingCents / 100,
          discount: order.discountCents / 100,
          items: order.items.map((i: any) => ({
            item_id: i.id,
            item_name: i.name,
            item_category: i.category,
            price: i.priceCents / 100,
            quantity: i.quantity,
          })),
        });
        window.sessionStorage.setItem(dedupeKey, "1");
      })
      .catch(() => {
        // Le suivi analytique n'est jamais bloquant pour l'expérience d'achat.
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
      <Link
        href="/produits"
        className="focus-ring inline-block font-mono text-xs tracking-tag uppercase border border-ink px-6 py-3 hover:bg-ink hover:text-bone transition-colors"
      >
        Continuer les achats
      </Link>
    </div>
  );
}
