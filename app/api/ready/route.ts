import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runChecks } from "@/lib/health";

export const dynamic = "force-dynamic";

/**
 * Readiness : « cette instance peut-elle servir du trafic ? ». À pointer
 * depuis le load balancer / l'orchestrateur pour retirer une instance dont
 * la base est injoignable, sans la redémarrer. 503 si dégradé.
 */
export async function GET() {
  const report = await runChecks(
    { database: () => prisma.$queryRaw`SELECT 1` },
    2000,
    (name, err) => console.error(`Sonde ready: "${name}" en échec`, err)
  );
  return NextResponse.json(report, {
    status: report.status === "ok" ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
