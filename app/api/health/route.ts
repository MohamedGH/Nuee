import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Liveness : « le processus répond ». Volontairement SANS dépendance
 * (pas de base de données) — si cette sonde échouait parce que la base est
 * lente, l'orchestrateur redémarrerait des instances saines en boucle.
 * Pour « l'instance peut-elle servir du trafic ? », voir /api/ready.
 */
export function GET() {
  return NextResponse.json(
    { status: "ok", uptimeSeconds: Math.round(process.uptime()) },
    { headers: { "Cache-Control": "no-store" } }
  );
}
