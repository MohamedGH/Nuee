"use client";

import { useState } from "react";

export default function StockAlertForm({
  productId,
  size,
}: {
  productId: string;
  size: string;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/stock-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, size, email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Une erreur est survenue.");
        setState("idle");
        return;
      }
      setState("done");
    } catch {
      setError("Impossible d'enregistrer votre email pour le moment.");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <p className="text-xs font-mono text-ink-soft">
        On vous préviendra dès que la taille {size} sera de retour.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="vous@exemple.fr"
        className="focus-ring flex-1 border border-line px-3 py-2 bg-bone font-body text-sm"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="focus-ring font-mono text-xs tracking-tag uppercase border border-ink px-4 py-2 hover:bg-ink hover:text-bone transition-colors disabled:opacity-40 whitespace-nowrap"
      >
        {state === "loading" ? "…" : `Me prévenir — taille ${size}`}
      </button>
      {error && <p className="text-brick text-xs font-mono">{error}</p>}
    </form>
  );
}
