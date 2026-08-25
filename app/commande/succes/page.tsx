"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/store/cart";

export default function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const clear = useCart((s) => s.clear);

  useEffect(() => {
    clear();
  }, [clear]);

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
      {searchParams.session_id && (
        <p className="font-mono text-xs text-muted mb-10 break-all">
          Référence : {searchParams.session_id}
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
