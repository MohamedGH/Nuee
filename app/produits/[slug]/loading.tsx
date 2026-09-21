export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-10 grid md:grid-cols-2 gap-8 md:gap-12 animate-pulse">
      <div className="aspect-[4/5] bg-line" />
      <div className="max-w-md">
        <div className="h-3 bg-line w-24 mb-4" />
        <div className="h-9 bg-line w-3/4 mb-4" />
        <div className="h-6 bg-line w-20 mb-6" />
        <div className="h-4 bg-line w-full mb-2" />
        <div className="h-4 bg-line w-5/6 mb-8" />
        <div className="flex gap-2 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 w-12 bg-line" />
          ))}
        </div>
        <div className="h-12 bg-line w-40" />
      </div>
    </div>
  );
}
