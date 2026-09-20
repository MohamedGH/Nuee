"use client";

import { Suspense, useEffect, useState } from "react";
import { GA_MEASUREMENT_ID, CLARITY_PROJECT_ID, trackBrowsingTopics } from "@/lib/analytics";
import { GoogleAnalytics, MicrosoftClarity, BrowsingTopics } from "@/components/analytics";
import { hasOptOutSignal } from "@/lib/privacySignals";

const CONSENT_KEY = "nuee-analytics-consent";
const TOPICS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_TOPICS === "true";

export default function CookieConsent({ nonce }: { nonce?: string }) {
  const [consent, setConsent] = useState<"accepted" | "rejected" | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (hasOptOutSignal()) {
      // Signal navigateur contraignant (GPC) ou correct à respecter (DNT) —
      // refus automatique, sans même solliciter la personne, et jamais
      // écrasable par un futur clic "Accepter" sur cet appareil.
      setConsent("rejected");
      return;
    }
    const stored = window.localStorage.getItem(CONSENT_KEY);
    if (stored === "accepted" || stored === "rejected") setConsent(stored);
  }, []);

  function choose(value: "accepted" | "rejected") {
    window.localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
  }

  const analyticsConfigured = Boolean(GA_MEASUREMENT_ID || CLARITY_PROJECT_ID || TOPICS_ENABLED);
  const granted = mounted && consent === "accepted";

  return (
    <>
      {granted && GA_MEASUREMENT_ID && (
        <Suspense fallback={null}>
          <GoogleAnalytics
            measurementId={GA_MEASUREMENT_ID}
            nonce={nonce}
            onError={() => console.warn("Google Analytics n'a pas pu se charger (bloqueur de pub ?)")}
          />
        </Suspense>
      )}

      {granted && CLARITY_PROJECT_ID && (
        <MicrosoftClarity
          projectId={CLARITY_PROJECT_ID}
          nonce={nonce}
          onError={() => console.warn("Microsoft Clarity n'a pas pu se charger (bloqueur de pub ?)")}
        />
      )}

      {granted && TOPICS_ENABLED && (
        <BrowsingTopics
          onObserved={(topics) => trackBrowsingTopics(topics.map((t) => t.topic))}
        />
      )}

      {mounted && analyticsConfigured && consent === null && (
        <div
          role="region"
          aria-label="Consentement aux cookies"
          aria-live="polite"
          className="fixed bottom-0 inset-x-0 z-50 bg-ink text-bone px-4 sm:px-6 md:px-12 py-4 flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <p className="text-sm text-bone/85 max-w-2xl">
            Ce site utilise des cookies de mesure d'audience (Google
            Analytics){TOPICS_ENABLED ? " et l'API Topics du navigateur (centres d'intérêt, sans cookie tiers)" : ""} pour
            comprendre comment la boutique est parcourue. Rien n'est chargé
            sans votre accord.
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
