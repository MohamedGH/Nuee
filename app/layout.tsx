import type { Metadata } from "next";
import { Fraunces, Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

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
  return (
    <html lang="fr">
      <body
        className={`${fraunces.variable} ${archivo.variable} ${mono.variable} font-body antialiased`}
      >
        <Header />
        <main>{children}</main>
        <footer className="border-t border-line mt-24 py-10 px-4 sm:px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between gap-4 max-w-6xl mx-auto text-sm text-ink-soft">
            <p className="font-mono tracking-tag uppercase text-xs">
              NUÉE — Paris, démo portfolio
            </p>
            <p>Livraison test uniquement — aucun paiement réel n'est prélevé.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
