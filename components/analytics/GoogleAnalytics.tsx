"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

// Empêche une double initialisation (StrictMode en dev, remontage après
// un basculement de consentement, plusieurs instances du composant) —
// gtag('config') ne doit s'exécuter qu'une fois par measurementId.
const initialized = new Set<string>();

/**
 * Injecte gtag.js, initialise GA4, et suit les changements de page.
 * Autonome et réutilisable : ne dépend ni du bandeau de consentement ni
 * d'aucun autre module analytique — le composant appelant décide quand le
 * monter (ex: après consentement).
 *
 * L'initialisation (dataLayer, fonction gtag, config) se fait dans le
 * onLoad du script externe plutôt que dans un <script> inline séparé :
 * ça évite d'avoir un second bloc de JS à autoriser via la CSP (nonce),
 * là où le onLoad n'est que du code déjà présent dans notre bundle.
 *
 * Sans le suivi de route ci-dessous, gtag('config') ne compte qu'un seul
 * page_view au chargement initial : les navigations côté client de
 * Next.js (<Link>, router.push) n'en déclenchent aucun de plus, faussant
 * les statistiques de pages vues sur toute app Next.js/GA4 qui n'y pense
 * pas.
 *
 * @param measurementId  Identifiant GA4, ex. "G-XXXXXXXXXX".
 * @param nonce           Nonce CSP à propager sur la balise <script src=…>.
 * @param anonymizeIp     Anonymise l'IP côté GA4 (défaut: true).
 * @param onLoad          Appelé une fois gtag.js chargé et initialisé.
 * @param onError         Appelé si gtag.js échoue à charger (ex: bloqueur
 *                        de pub) — utile pour ne pas compter sur des
 *                        données qui ne remonteront jamais.
 */
export default function GoogleAnalytics({
  measurementId,
  nonce,
  anonymizeIp = true,
  onLoad,
  onError,
}: {
  measurementId: string;
  nonce?: string;
  anonymizeIp?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const readyRef = useRef(false);

  if (process.env.NODE_ENV !== "production" && !/^G-[A-Z0-9]+$/.test(measurementId)) {
    console.error(
      `GoogleAnalytics: "${measurementId}" ne ressemble pas à un ID de mesure GA4 valide (attendu: "G-XXXXXXXXXX").`
    );
  }

  // Un page_view par changement de route — pas au tout premier rendu,
  // déjà couvert par le gtag('config') initial ci-dessous.
  useEffect(() => {
    if (!readyRef.current || !window.gtag) return;
    const page_path = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;
    window.gtag("event", "page_view", {
      page_path,
      send_to: measurementId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return (
    <>
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
        nonce={nonce}
        onLoad={() => {
          if (!initialized.has(measurementId)) {
            initialized.add(measurementId);
            window.dataLayer = window.dataLayer || [];
            window.gtag = function gtag() {
              window.dataLayer!.push(arguments);
            };
            window.gtag("js", new Date());
            window.gtag("config", measurementId, { anonymize_ip: anonymizeIp });
          }
          readyRef.current = true;
          onLoad?.();
        }}
        onError={onError}
      />
    </>
  );
}
