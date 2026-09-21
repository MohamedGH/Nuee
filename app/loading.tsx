export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 pt-10 pb-14 md:pt-16 md:pb-20 grid md:grid-cols-12 gap-8 md:items-end">
        <div className="md:col-span-7">
          <div className="h-4 bg-line w-40 mb-6" />
          <div className="h-16 bg-line w-full max-w-md mb-4" />
          <div className="h-16 bg-line w-2/3 max-w-sm mb-8" />
          <div className="h-4 bg-line w-full max-w-sm mb-2" />
          <div className="h-4 bg-line w-2/3 max-w-sm mb-8" />
          <div className="h-12 bg-line w-48" />
        </div>
        <div className="md:col-span-5 aspect-[3/4] bg-line" />
      </div>
    </div>
  );
}
