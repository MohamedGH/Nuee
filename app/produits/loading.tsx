import ProductCardSkeleton from "@/components/ProductCardSkeleton";

export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-10 md:py-16 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 border-b border-line pb-6">
        <div className="h-10 bg-line w-48" />
        <div className="h-10 bg-line w-full md:w-64" />
      </div>
      <div className="flex flex-wrap gap-2 mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 bg-line w-24" />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
