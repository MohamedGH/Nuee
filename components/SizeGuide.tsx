"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useFocusTrap } from "@/lib/useFocusTrap";

const CHEST_TABLE: Record<string, { tour: string; longueur: string }> = {
  XS: { tour: "84–88 cm", longueur: "66 cm" },
  S: { tour: "89–93 cm", longueur: "68 cm" },
  M: { tour: "94–98 cm", longueur: "70 cm" },
  L: { tour: "99–104 cm", longueur: "72 cm" },
  XL: { tour: "105–111 cm", longueur: "74 cm" },
};

export default function SizeGuide({ category }: { category: string }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useFocusTrap(open, () => setOpen(false));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus-ring font-mono text-xs tracking-tag uppercase underline underline-offset-4 text-ink-soft hover:text-brick"
      >
        Guide des tailles
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-ink/60 flex items-end md:items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-guide-title"
            className="bg-bone max-w-md w-full p-6 md:p-8 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 id="size-guide-title" className="font-display text-2xl italic">
                Guide des tailles
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="focus-ring p-1 hover:text-brick"
              >
                <X size={20} aria-hidden />
              </button>
            </div>

            <p className="text-sm text-ink-soft mb-6">
              Mesures pour «&nbsp;{category}&nbsp;», à plat, en centimètres.
              En cas de doute entre deux tailles, préférez la taille au-dessus.
            </p>

            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="border-b border-line text-ink-soft text-xs tracking-tag uppercase">
                  <th className="text-left py-2">Taille</th>
                  <th className="text-left py-2">Tour de poitrine</th>
                  <th className="text-left py-2">Longueur</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(CHEST_TABLE).map(([size, m]) => (
                  <tr key={size} className="border-b border-line">
                    <td className="py-2">{size}</td>
                    <td className="py-2">{m.tour}</td>
                    <td className="py-2">{m.longueur}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
