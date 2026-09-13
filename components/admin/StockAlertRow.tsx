"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StockAlertRow({ id, notified }: { id: string; notified: boolean }) {
  const [value, setValue] = useState(notified);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    setBusy(true);
    const next = !value;
    setValue(next);
    try {
      const res = await fetch(`/api/admin/stock-alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notified: next }),
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
        value ? "border-line text-ink-soft" : "border-ink bg-ink text-bone"
      }`}
    >
      {value ? "Prévenu(e)" : "En attente"}
    </button>
  );
}
