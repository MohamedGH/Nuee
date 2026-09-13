import { FREE_SHIPPING_THRESHOLD_CENTS, amountToFreeShipping } from "@/lib/shipping";
import { formatPrice } from "@/lib/format";

export default function FreeShippingBar({ subtotalCents }: { subtotalCents: number }) {
  const remaining = amountToFreeShipping(subtotalCents);
  const progress = Math.min(
    100,
    (subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100
  );

  return (
    <div className="mb-6">
      <p className="font-mono text-xs text-ink-soft mb-2">
        {remaining > 0 ? (
          <>
            Plus que <span className="text-brick">{formatPrice(remaining)}</span> pour
            la livraison offerte
          </>
        ) : (
          <span className="text-brick">Livraison offerte débloquée</span>
        )}
      </p>
      <div className="h-1 bg-line w-full">
        <div
          className="h-1 bg-brick transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
