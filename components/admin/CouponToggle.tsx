"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CouponToggle({ id, active }: { id: string; active: boolean }) {
  const [value, setValue] = useState(active);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    setBusy(true);
    const next = !value;
    setValue(next);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: next }),
      });
      if (!res.ok) setValue(!next);
      else router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={busy}
      className={`focus-ring font-mono text-xs tracking-tag uppercase px-3 py-1 border disabled:opacity-40 ${
        value ? "border-ink bg-ink text-bone" : "border-line text-ink-soft"
      }`}
    >
      {value ? "Actif" : "Inactif"}
    </button>
  );
}
