import { prisma } from "@/lib/prisma";
import ReviewModerationRow from "@/components/admin/ReviewModerationRow";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: true },
    take: 200,
  });

  return (
    <div>
      <h1 className="font-display text-3xl italic mb-8">Avis</h1>

      {reviews.length === 0 ? (
        <p className="text-ink-soft text-sm">Aucun avis pour le moment.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((r) => (
            <ReviewModerationRow
              key={r.id}
              id={r.id}
              productName={r.product.name}
              authorName={r.authorName}
              comment={r.comment}
              rating={r.rating}
              verified={r.verified}
            />
          ))}
        </div>
      )}
    </div>
  );
}
