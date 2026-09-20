"use client";

import { Minus, Plus } from "lucide-react";

export default function QuantityStepper({
  quantity,
  min = 1,
  max = 10,
  onChange,
  size = "sm",
}: {
  quantity: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  size?: "sm" | "lg";
}) {
  const padding = size === "lg" ? "p-3" : "p-2";
  const iconSize = size === "lg" ? 14 : 12;
  const textWidth = size === "lg" ? "w-8" : "w-7";
  const textSize = size === "lg" ? "text-sm" : "text-xs";
  const border = size === "lg" ? "border-ink" : "border-line";

  return (
    <div className={`flex items-center border ${border} w-fit`}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, quantity - 1))}
        aria-label="Diminuer la quantité"
        disabled={quantity <= min}
        className={`focus-ring ${padding} hover:bg-ink hover:text-bone transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-ink`}
      >
        <Minus size={iconSize} aria-hidden />
      </button>
      <span
        className={`font-mono ${textSize} ${textWidth} text-center`}
        aria-live="polite"
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, quantity + 1))}
        aria-label="Augmenter la quantité"
        disabled={quantity >= max}
        className={`focus-ring ${padding} hover:bg-ink hover:text-bone transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-ink`}
      >
        <Plus size={iconSize} aria-hidden />
      </button>
    </div>
  );
}
