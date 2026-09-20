export default function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1.5 -right-1.5 bg-brick text-bone text-[10px] font-mono min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
}
