import StarRating from "@/components/StarRating";
import ReviewForm from "@/components/ReviewForm";

type Review = {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  verified: boolean;
  createdAt: Date;
};

export default function ReviewsSection({
  productId,
  reviews,
}: {
  productId: string;
  reviews: Review[];
}) {
  const average =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-line pb-4">
        <div>
          <h2 className="font-display text-2xl italic mb-2">Avis</h2>
          <StarRating rating={average} count={reviews.length} size={16} />
        </div>
        <ReviewForm productId={productId} />
      </div>

      {reviews.length === 0 ? (
        <p className="text-ink-soft text-sm">
          Aucun avis pour le moment — soyez le premier à en laisser un.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-line pb-6">
              <div className="flex items-center justify-between mb-2">
                <StarRating rating={r.rating} />
                <p className="font-mono text-[11px] text-muted">
                  {new Date(r.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <p className="text-sm text-ink-soft leading-relaxed mb-2">
                {r.comment}
              </p>
              <p className="font-mono text-xs">
                {r.authorName}
                {r.verified && (
                  <span className="text-brick ml-2">Achat vérifié</span>
                )}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
