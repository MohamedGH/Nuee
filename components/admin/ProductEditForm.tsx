"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductEditForm({
  productId,
  initialName,
  initialDescription,
  initialPriceCents,
}: {
  productId: string;
  initialName: string;
  initialDescription: string;
  initialPriceCents: number;
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [price, setPrice] = useState((initialPriceCents / 100).toFixed(2));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          priceCents: Math.round(Number(price) * 100),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Impossible d'enregistrer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-line p-6 max-w-lg">
      <label className="block font-mono text-xs tracking-tag uppercase text-ink-soft mb-2">
        Nom
      </label>
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="focus-ring w-full border border-line px-3 py-2 mb-4 bg-bone font-body"
      />

      <label className="block font-mono text-xs tracking-tag uppercase text-ink-soft mb-2">
        Description
      </label>
      <textarea
        required
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="focus-ring w-full border border-line px-3 py-2 mb-4 bg-bone font-body text-sm"
      />

      <label className="block font-mono text-xs tracking-tag uppercase text-ink-soft mb-2">
        Prix (€)
      </label>
      <input
        required
        type="number"
        min={0}
        step={0.5}
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="focus-ring w-32 border border-line px-3 py-2 mb-6 bg-bone font-mono text-sm"
      />

      {error && <p role="alert" className="text-brick text-xs font-mono mb-4">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="focus-ring font-mono text-xs tracking-tag uppercase px-6 py-3 bg-ink text-bone hover:bg-brick-dark transition-colors disabled:opacity-40"
      >
        {loading ? "Enregistrement…" : saved ? "Enregistré ✓" : "Enregistrer"}
      </button>
    </form>
  );
}
