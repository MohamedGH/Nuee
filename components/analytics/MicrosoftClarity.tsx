"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    __clarityOnLoad?: () => void;
    __clarityOnError?: () => void;
  }
}

/**
 * Injecte le tag Microsoft Clarity (heatmaps, replays de session).
 * Autonome et réutilisable, au même titre que GoogleAnalytics.
 *
 * @param projectId  Identifiant de projet Clarity.
 * @param nonce      Nonce CSP à propager sur la balise <script>.
 * @param onLoad     Appelé une fois le script clarity.ms effectivement
 *                    chargé (le tag Clarity s'injecte lui-même de façon
 *                    asynchrone, donc ce n'est pas le onLoad du <Script>
 *                    Next.js qui suffit — il ne couvrirait que le petit
 *                    snippet inline, toujours "chargé" avec succès).
 * @param onError    Appelé si clarity.ms échoue à charger (bloqueur de pub).
 */
export default function MicrosoftClarity({
  projectId,
  nonce,
  onLoad,
  onError,
}: {
  projectId: string;
  nonce?: string;
  onLoad?: () => void;
  onError?: () => void;
}) {
  if (process.env.NODE_ENV !== "production" && !/^[a-z0-9]+$/i.test(projectId)) {
    console.error(`MicrosoftClarity: "${projectId}" ne ressemble pas à un ID de projet Clarity valide.`);
  }

  useEffect(() => {
    window.__clarityOnLoad = onLoad;
    window.__clarityOnError = onError;
    return () => {
      delete window.__clarityOnLoad;
      delete window.__clarityOnError;
    };
  }, [onLoad, onError]);

  return (
    <>
      <link rel="preconnect" href="https://www.clarity.ms" />
      <Script id="clarity-init" strategy="afterInteractive" nonce={nonce}>
        {`
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            t.onload=function(){ if (window.__clarityOnLoad) window.__clarityOnLoad(); };
            t.onerror=function(){ if (window.__clarityOnError) window.__clarityOnError(); };
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${projectId}");
        `}
      </Script>
    </>
  );
}
