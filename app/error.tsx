"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-12 py-24 text-center">
      <p className="font-mono text-xs tracking-tag uppercase text-brick mb-6">
        Erreur
      </p>
      <h1 className="font-display text-4xl italic mb-6">
        Quelque chose s'est mal passé.
      </h1>
      <p className="text-ink-soft leading-relaxed mb-10">
        Ce n'est pas de votre fait — réessayez, ou revenez à la collection.
      </p>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={reset}
          className="focus-ring font-mono text-xs tracking-tag uppercase px-6 py-3 bg-ink text-bone hover:bg-brick-dark transition-colors"
        >
          Réessayer
        </button>
        <Link
          href="/produits"
          className="focus-ring font-mono text-xs tracking-tag uppercase border border-ink px-6 py-3 hover:bg-ink hover:text-bone transition-colors"
        >
          Voir la collection
        </Link>
      </div>
    </div>
  );
}
