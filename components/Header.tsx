"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingBag, Heart, Search } from "lucide-react";
import { useCart } from "@/store/cart";
import { useFavorites } from "@/store/favorites";

const links = [
  { href: "/produits", label: "Collection" },
  { href: "/essayage", label: "Essayage 3D" },
  { href: "/produits?cat=Manteaux", label: "Manteaux" },
  { href: "/produits?cat=Accessoires", label: "Accessoires" },
  { href: "/commandes", label: "Suivre ma commande" },
];

export default function Header() {
  const count = useCart((s) => s.count());
  const favCount = useFavorites((s) => s.ids.length);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);
  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-bone/95 backdrop-blur border-b border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 h-16 md:h-20 flex items-center justify-between">
        <Link href="/" className="focus-ring shrink-0">
          <span className="font-display text-xl md:text-2xl tracking-wide">
            NUÉE
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-mono text-xs tracking-tag uppercase text-ink-soft">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-ink focus-ring">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href="/produits"
            aria-label="Rechercher"
            className="focus-ring hidden md:flex p-2 hover:text-brick"
          >
            <Search size={18} aria-hidden />
          </Link>

          <Link
            href="/favoris"
            aria-label="Voir les favoris"
            className="focus-ring relative p-2 hover:text-brick"
          >
            <Heart size={18} aria-hidden />
            {mounted && favCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brick text-bone text-[10px] font-mono w-4 h-4 flex items-center justify-center rounded-full">
                {favCount}
              </span>
            )}
          </Link>

          <Link
            href="/panier"
            aria-label="Voir le panier"
            className="focus-ring font-mono text-xs tracking-tag uppercase flex items-center gap-2 border border-ink px-3 md:px-4 py-2 hover:bg-ink hover:text-bone transition-colors"
          >
            <ShoppingBag size={16} className="md:hidden" aria-hidden />
            <span className="hidden md:inline">
              Panier {mounted && count > 0 ? `(${count})` : ""}
            </span>
            {mounted && count > 0 && <span className="md:hidden">{count}</span>}
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            className="focus-ring md:hidden p-2 -mr-2 border border-transparent hover:border-ink"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          className="md:hidden fixed inset-x-0 top-16 bottom-0 bg-bone z-50 px-6 py-10 flex flex-col gap-1 overflow-y-auto"
          aria-label="Menu principal"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="focus-ring font-display text-3xl italic py-4 border-b border-line"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
