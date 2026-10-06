"use client";

import { useState } from "react";
import { twoProportionZTest, type SignificanceResult } from "@/lib/statistics";

export default function SignificanceCalculator() {
  const [controlVisitors, setControlVisitors] = useState("");
  const [controlConversions, setControlConversions] = useState("");
  const [treatmentVisitors, setTreatmentVisitors] = useState("");
  const [treatmentConversions, setTreatmentConversions] = useState("");
  const [result, setResult] = useState<SignificanceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      setResult(
        twoProportionZTest(
          { visitors: Number(controlVisitors), conversions: Number(controlConversions) },
          { visitors: Number(treatmentVisitors), conversions: Number(treatmentConversions) }
        )
      );
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Données invalides.");
    }
  }

  return (
    <div className="border border-line p-6">
      <p className="font-mono text-xs tracking-tag uppercase text-ink-soft mb-1">
        Calculateur de significativité
      </p>
      <p className="text-sm text-ink-soft mb-6">
        Reporte les chiffres relevés dans GA4 (visiteurs exposés à chaque
        variante, conversions parmi eux) pour savoir si l'écart observé
        est réel ou probablement du bruit.
      </p>

      <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-6 mb-6">
        <div>
          <p className="font-mono text-xs tracking-tag uppercase mb-3">Témoin</p>
          <label className="block font-mono text-xs text-ink-soft mb-1">Visiteurs</label>
          <input
            required
            type="number"
            min={1}
            value={controlVisitors}
            onChange={(e) => setControlVisitors(e.target.value)}
            className="focus-ring w-full border border-line px-3 py-2 bg-bone font-mono text-sm mb-3"
          />
          <label className="block font-mono text-xs text-ink-soft mb-1">Conversions</label>
          <input
            required
            type="number"
            min={0}
            value={controlConversions}
            onChange={(e) => setControlConversions(e.target.value)}
            className="focus-ring w-full border border-line px-3 py-2 bg-bone font-mono text-sm"
          />
        </div>

        <div>
          <p className="font-mono text-xs tracking-tag uppercase mb-3">Traitement</p>
          <label className="block font-mono text-xs text-ink-soft mb-1">Visiteurs</label>
          <input
            required
            type="number"
            min={1}
            value={treatmentVisitors}
            onChange={(e) => setTreatmentVisitors(e.target.value)}
            className="focus-ring w-full border border-line px-3 py-2 bg-bone font-mono text-sm mb-3"
          />
          <label className="block font-mono text-xs text-ink-soft mb-1">Conversions</label>
          <input
            required
            type="number"
            min={0}
            value={treatmentConversions}
            onChange={(e) => setTreatmentConversions(e.target.value)}
            className="focus-ring w-full border border-line px-3 py-2 bg-bone font-mono text-sm"
          />
        </div>

        <button
          type="submit"
          className="sm:col-span-2 focus-ring font-mono text-xs tracking-tag uppercase px-6 py-3 bg-ink text-bone hover:bg-brick-dark transition-colors w-fit"
        >
          Calculer
        </button>
      </form>

      {error && <p role="alert" className="text-brick text-xs font-mono mb-4">{error}</p>}

      {result && (
        <div className="border-t border-line pt-6">
          <div className="grid sm:grid-cols-3 gap-4 mb-4 font-mono text-sm">
            <div>
              <p className="text-xs text-ink-soft mb-1">Taux témoin</p>
              <p>{(result.controlRate * 100).toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-xs text-ink-soft mb-1">Taux traitement</p>
              <p>{(result.treatmentRate * 100).toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-xs text-ink-soft mb-1">Écart relatif</p>
              <p className={result.relativeUplift >= 0 ? "text-brick" : ""}>
                {result.relativeUplift >= 0 ? "+" : ""}
                {(result.relativeUplift * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          <div
            className={`px-4 py-3 font-mono text-sm ${
              result.significant ? "bg-ink text-bone" : "border border-line text-ink-soft"
            }`}
          >
            {result.significant ? (
              <>Écart significatif (confiance {(result.confidenceLevel * 100).toFixed(1)}%, p = {result.pValue.toFixed(4)})</>
            ) : (
              <>
                Pas encore significatif (p = {result.pValue.toFixed(4)}, seuil habituel : p &lt;
                0,05) — l'écart observé peut encore être du bruit d'échantillonnage.
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
