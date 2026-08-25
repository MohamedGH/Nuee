import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Fil d'Ariane"
      className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 pt-6 flex items-center flex-wrap gap-1 font-mono text-[11px] tracking-tag uppercase text-muted"
    >
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={12} aria-hidden />}
          {item.href ? (
            <Link href={item.href} className="focus-ring hover:text-ink">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink-soft">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
