import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-12 py-24 text-center">
      <p className="font-mono text-xs tracking-tag uppercase text-ink-soft mb-6">
        Paiement annulé
      </p>
      <h1 className="font-display text-4xl italic mb-6">Rien n'a été débité.</h1>
      <p className="text-ink-soft leading-relaxed mb-10">
        Le panier a été conservé, vous pouvez reprendre le paiement quand
        vous voulez.
      </p>
      <Link
        href="/panier"
        className="focus-ring inline-block font-mono text-xs tracking-tag uppercase border border-ink px-6 py-3 hover:bg-ink hover:text-bone transition-colors"
      >
        Retour au panier
      </Link>
    </div>
  );
}
