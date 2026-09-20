"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Une erreur est survenue.");
        setState("idle");
        return;
      }
      setState("done");
    } catch {
      setError("Impossible d'envoyer pour le moment.");
      setState("idle");
    }
  }

  if (state === "done") {
    return <p className="text-ink-soft">Merci, vous êtes inscrit(e).</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="vous@exemple.fr"
        className="focus-ring flex-1 min-w-0 border border-line px-3 py-2 bg-bone font-body text-sm"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="focus-ring font-mono text-xs tracking-tag uppercase border border-ink px-4 hover:bg-ink hover:text-bone transition-colors disabled:opacity-40 shrink-0"
      >
        {state === "loading" ? "…" : "S'inscrire"}
      </button>
      {error && <p role="alert" className="text-brick text-xs font-mono">{error}</p>}
    </form>
  );
}
