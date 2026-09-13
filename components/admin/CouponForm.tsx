"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CouponForm() {
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "amount">("percent");
  const [value, setValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { code };
      if (type === "percent") body.percentOff = Number(value);
      else body.amountOff = Math.round(Number(value) * 100);
      if (maxUses) body.maxUses = Number(maxUses);

      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        return;
      }
      setCode("");
      setValue("");
      setMaxUses("");
      router.refresh();
    } catch {
      setError("Impossible de créer le coupon.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-line p-6 max-w-lg">
      <p className="font-mono text-xs tracking-tag uppercase text-ink-soft mb-4">
        Nouveau coupon
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block font-mono text-xs text-ink-soft mb-1">Code</label>
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="focus-ring w-full border border-line px-3 py-2 bg-bone font-mono text-sm uppercase"
          />
        </div>
        <div>
          <label className="block font-mono text-xs text-ink-soft mb-1">
            Utilisations max (optionnel)
          </label>
          <input
            type="number"
            min={1}
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            className="focus-ring w-full border border-line px-3 py-2 bg-bone font-mono text-sm"
          />
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 font-mono text-sm">
          <input
            type="radio"
            checked={type === "percent"}
            onChange={() => setType("percent")}
            className="accent-ink"
          />
          Pourcentage
        </label>
        <label className="flex items-center gap-2 font-mono text-sm">
          <input
            type="radio"
            checked={type === "amount"}
            onChange={() => setType("amount")}
            className="accent-ink"
          />
          Montant fixe (€)
        </label>
      </div>

      <div className="mb-4">
        <input
          required
          type="number"
          min={type === "percent" ? 1 : 0.5}
          max={type === "percent" ? 100 : undefined}
          step={type === "percent" ? 1 : 0.5}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={type === "percent" ? "10" : "5.00"}
          className="focus-ring w-40 border border-line px-3 py-2 bg-bone font-mono text-sm"
        />
      </div>

      {error && <p className="text-brick text-xs font-mono mb-4">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="focus-ring font-mono text-xs tracking-tag uppercase px-6 py-3 bg-ink text-bone hover:bg-brick-dark transition-colors disabled:opacity-40"
      >
        {loading ? "Création…" : "Créer le coupon"}
      </button>
    </form>
  );
}
