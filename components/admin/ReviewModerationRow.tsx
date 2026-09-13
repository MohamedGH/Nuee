"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StarRating from "@/components/StarRating";

export default function ReviewModerationRow({
  id,
  productName,
  authorName,
  comment,
  rating,
  verified,
}: {
  id: string;
  productName: string;
  authorName: string;
  comment: string;
  rating: number;
  verified: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const router = useRouter();

  async function toggleVerified() {
    setBusy(true);
    try {
      await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: !verified }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Supprimer cet avis ?")) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      setDeleted(true);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (deleted) return null;

  return (
    <div className="border border-line p-4 flex items-start justify-between gap-4">
      <div>
        <p className="font-mono text-xs text-ink-soft mb-1">{productName}</p>
        <StarRating rating={rating} />
        <p className="text-sm my-2">{comment}</p>
        <p className="font-mono text-xs">
          {authorName}
          {verified && <span className="text-brick ml-2">Vérifié</span>}
        </p>
      </div>
      <div className="flex flex-col gap-2 shrink-0">
        <button
          onClick={toggleVerified}
          disabled={busy}
          className="focus-ring font-mono text-xs tracking-tag uppercase border border-ink px-3 py-1.5 hover:bg-ink hover:text-bone transition-colors disabled:opacity-40"
        >
          {verified ? "Retirer vérifié" : "Marquer vérifié"}
        </button>
        <button
          onClick={handleDelete}
          disabled={busy}
          className="focus-ring font-mono text-xs tracking-tag uppercase text-brick hover:underline disabled:opacity-40"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
