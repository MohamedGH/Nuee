export default function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] bg-line" />
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="h-4 bg-line w-3/4 mb-2" />
          <div className="h-3 bg-line w-1/2" />
        </div>
        <div className="h-4 bg-line w-10 shrink-0" />
      </div>
    </div>
  );
}
