"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { GA_MEASUREMENT_ID, CLARITY_PROJECT_ID } from "@/lib/analytics";

const CONSENT_KEY = "nuee-analytics-consent";

export default function CookieConsent({ nonce }: { nonce?: string }) {
  const [consent, setConsent] = useState<"accepted" | "rejected" | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = window.localStorage.getItem(CONSENT_KEY);
    if (stored === "accepted" || stored === "rejected") setConsent(stored);
  }, []);

  function choose(value: "accepted" | "rejected") {
    window.localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
  }

  const analyticsConfigured = Boolean(GA_MEASUREMENT_ID || CLARITY_PROJECT_ID);

  return (
    <>
      {mounted && consent === "accepted" && GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
            nonce={nonce}
          />
          <Script id="ga4-init" strategy="afterInteractive" nonce={nonce}>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });
              window.gtag = gtag;
            `}
          </Script>
        </>
      )}

      {mounted && consent === "accepted" && CLARITY_PROJECT_ID && (
        <Script id="clarity-init" strategy="afterInteractive" nonce={nonce}>
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
          `}
        </Script>
      )}

      {mounted && analyticsConfigured && consent === null && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-ink text-bone px-4 sm:px-6 md:px-12 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-bone/85 max-w-2xl">
            Ce site utilise des cookies de mesure d'audience (Google
            Analytics) pour comprendre comment la boutique est parcourue.
            Rien n'est chargé sans votre accord.
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => choose("rejected")}
              className="focus-ring font-mono text-xs tracking-tag uppercase border border-bone/40 px-4 py-2 hover:border-bone transition-colors"
            >
              Refuser
            </button>
            <button
              onClick={() => choose("accepted")}
              className="focus-ring font-mono text-xs tracking-tag uppercase bg-bone text-ink px-4 py-2 hover:bg-bone/90 transition-colors"
            >
              Accepter
            </button>
          </div>
        </div>
      )}
    </>
  );
}
