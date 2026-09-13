"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/commandes", label: "Commandes" },
  { href: "/admin/produits", label: "Produits" },
  { href: "/admin/stock", label: "Stock" },
  { href: "/admin/alertes", label: "Alertes" },
  { href: "/admin/avis", label: "Avis" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/newsletter", label: "Newsletter" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="border-b border-line bg-bone">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="font-display text-lg italic">NUÉE — Admin</span>
          <nav className="hidden md:flex items-center gap-5 font-mono text-xs tracking-tag uppercase text-ink-soft overflow-x-auto">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`focus-ring hover:text-ink ${pathname === l.href ? "text-ink" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="focus-ring font-mono text-xs tracking-tag uppercase text-ink-soft hover:text-brick"
        >
          Déconnexion
        </button>
      </div>
      <nav className="md:hidden flex items-center gap-4 overflow-x-auto px-4 pb-3 font-mono text-xs tracking-tag uppercase text-ink-soft">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`focus-ring whitespace-nowrap ${pathname === l.href ? "text-ink" : ""}`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
