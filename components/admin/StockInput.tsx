"use client";

import { useState } from "react";

export default function StockInput({
  variantId,
  stock,
}: {
  variantId: string;
  stock: number;
}) {
  const [value, setValue] = useState(stock);
  const [saved, setSaved] = useState(true);
  const [saving, setSaving] = useState(false);

  async function handleBlur() {
    if (value === stock || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/variants/${variantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: value }),
      });
      setSaved(res.ok);
    } catch {
      setSaved(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <input
      type="number"
      min={0}
      value={value}
      onChange={(e) => {
        setValue(Number(e.target.value));
        setSaved(false);
      }}
      onBlur={handleBlur}
      className={`focus-ring w-16 border px-2 py-1 font-mono text-sm bg-bone ${
        !saved ? "border-brick" : value === 0 ? "border-brick/50" : "border-line"
      }`}
    />
  );
}
