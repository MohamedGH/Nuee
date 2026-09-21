export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-10 animate-pulse">
      <div className="h-9 bg-line w-56 mb-3" />
      <div className="h-4 bg-line w-full max-w-xl mb-10" />
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        <div className="aspect-[3/4] bg-line" />
        <div className="flex flex-col gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 bg-line w-20 mb-3" />
              <div className="flex gap-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="w-20 h-24 bg-line" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
