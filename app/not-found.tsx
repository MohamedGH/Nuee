import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-12 py-24 text-center">
      <p className="font-mono text-xs tracking-tag uppercase text-brick mb-6">
        Erreur 404
      </p>
      <h1 className="font-display text-4xl italic mb-6">Cette pièce n'existe pas.</h1>
      <p className="text-ink-soft leading-relaxed mb-10">
        Le lien est peut-être obsolète, ou la pièce a été retirée de la
        collection.
      </p>
      <Link
        href="/produits"
        className="focus-ring inline-block font-mono text-xs tracking-tag uppercase border border-ink px-6 py-3 hover:bg-ink hover:text-bone transition-colors"
      >
        Voir la collection
      </Link>
    </div>
  );
}
