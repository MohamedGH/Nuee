"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Connexion refusée.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bone px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border border-line p-8"
      >
        <p className="font-display text-2xl italic mb-1">NUÉE</p>
        <p className="font-mono text-xs tracking-tag uppercase text-ink-soft mb-8">
          Espace administrateur
        </p>

        <label className="block font-mono text-xs tracking-tag uppercase text-ink-soft mb-2">
          Mot de passe
        </label>
        <input
          type="password"
          required
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="focus-ring w-full border border-line px-3 py-2 mb-4 bg-bone font-body"
        />

        {error && <p role="alert" className="text-brick text-xs font-mono mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading || !password}
          className="focus-ring w-full font-mono text-xs tracking-tag uppercase px-6 py-3 bg-ink text-bone hover:bg-brick-dark transition-colors disabled:opacity-40"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
