"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

export default function ReviewForm({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [authorName, setAuthorName] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, authorName, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        return;
      }
      setSuccess(true);
      setAuthorName("");
      setComment("");
      setRating(5);
      router.refresh();
    } catch {
      setError("Impossible d'envoyer l'avis pour le moment.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="focus-ring font-mono text-xs tracking-tag uppercase underline underline-offset-4 hover:text-brick"
      >
        Laisser un avis
      </button>
    );
  }

  if (success) {
    return (
      <p className="text-sm text-ink-soft font-mono">
        Merci, votre avis a été publié.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-line p-6 max-w-md">
      <p className="font-mono text-xs tracking-tag uppercase text-ink-soft mb-3">
        Note
      </p>
      <div className="flex gap-1 mb-4" role="radiogroup" aria-label="Note sur 5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
            onClick={() => setRating(n)}
            className="focus-ring p-0.5"
          >
            <Star
              size={22}
              className={n <= rating ? "fill-brick text-brick" : "text-line"}
            />
          </button>
        ))}
      </div>

      <label className="block font-mono text-xs tracking-tag uppercase text-ink-soft mb-2">
        Nom
      </label>
      <input
        required
        minLength={2}
        maxLength={60}
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        className="focus-ring w-full border border-line px-3 py-2 mb-4 bg-bone font-body text-sm"
      />

      <label className="block font-mono text-xs tracking-tag uppercase text-ink-soft mb-2">
        Avis
      </label>
      <textarea
        required
        minLength={10}
        maxLength={800}
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="focus-ring w-full border border-line px-3 py-2 mb-4 bg-bone font-body text-sm"
      />

      {error && <p className="text-brick text-xs mb-4 font-mono">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="focus-ring font-mono text-xs tracking-tag uppercase px-6 py-3 bg-ink text-bone hover:bg-brick-dark transition-colors disabled:opacity-40"
        >
          {loading ? "Envoi…" : "Publier l'avis"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="focus-ring font-mono text-xs tracking-tag uppercase text-ink-soft hover:text-ink"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
