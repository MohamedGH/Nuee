"use client";

import { useEffect } from "react";
import { useToast } from "@/store/toast";

export default function Toaster() {
  const { toast, dismiss } = useToast();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(dismiss, 5000);
    return () => clearTimeout(timer);
  }, [toast, dismiss]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-ink text-bone px-5 py-3 flex items-center gap-4 shadow-lg max-w-[90vw]"
    >
      <p className="text-sm">{toast.message}</p>
      {toast.actionLabel && toast.onAction && (
        <button
          onClick={() => {
            toast.onAction?.();
            dismiss();
          }}
          className="focus-ring font-mono text-xs tracking-tag uppercase underline underline-offset-4 shrink-0 hover:text-brick"
        >
          {toast.actionLabel}
        </button>
      )}
    </div>
  );
}
