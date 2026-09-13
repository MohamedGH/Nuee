import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { Fraunces, Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import NewsletterForm from "@/components/NewsletterForm";
import CookieConsent from "@/components/CookieConsent";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["400", "500", "600"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "NUÉE — Essentiels façonnés",
  description:
    "NUÉE. Vêtements essentiels en petites séries, coupes droites, matières brutes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = headers().get("x-nonce") ?? undefined;

  return (
    <html lang="fr">
      <body
        className={`${fraunces.variable} ${archivo.variable} ${mono.variable} font-body antialiased`}
      >
        <Header />
        <main>{children}</main>
        <footer className="border-t border-line mt-24 py-12 px-4 sm:px-6 md:px-12">
          <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-4 text-sm">
            <div>
              <p className="font-display text-xl italic mb-3">NUÉE</p>
              <p className="text-ink-soft leading-relaxed">
                Paris — huit pièces, sans saison, cousues en petite série.
                Démo portfolio.
              </p>
            </div>

            <div>
              <p className="font-mono text-xs tracking-tag uppercase text-ink-soft mb-3">
                Boutique
              </p>
              <ul className="flex flex-col gap-2 text-ink-soft">
                <li><Link href="/produits" className="focus-ring hover:text-ink">Collection</Link></li>
                <li><Link href="/essayage" className="focus-ring hover:text-ink">Essayage 3D</Link></li>
                <li><Link href="/favoris" className="focus-ring hover:text-ink">Favoris</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-mono text-xs tracking-tag uppercase text-ink-soft mb-3">
                Aide
              </p>
              <ul className="flex flex-col gap-2 text-ink-soft">
                <li><Link href="/commandes" className="focus-ring hover:text-ink">Suivre ma commande</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-mono text-xs tracking-tag uppercase text-ink-soft mb-3">
                Newsletter
              </p>
              <NewsletterForm />
            </div>
          </div>

          <p className="max-w-6xl mx-auto text-xs text-muted mt-10 pt-6 border-t border-line">
            Livraison test uniquement — aucun paiement réel n'est prélevé.
          </p>
        </footer>
        <CookieConsent nonce={nonce} />
      </body>
    </html>
  );
}
