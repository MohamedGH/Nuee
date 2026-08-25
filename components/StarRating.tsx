import { Star } from "lucide-react";

export default function StarRating({
  rating,
  count,
  size = 14,
}: {
  rating: number;
  count?: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={size}
            className={n <= Math.round(rating) ? "fill-brick text-brick" : "text-line"}
          />
        ))}
      </div>
      <span className="sr-only">{rating.toFixed(1)} sur 5</span>
      {count !== undefined && (
        <span className="font-mono text-xs text-ink-soft">
          {rating > 0 ? rating.toFixed(1) : "—"} ({count})
        </span>
      )}
    </div>
  );
}
