import { withTimeout } from "@/lib/withTimeout";

export type CheckResult = { ok: boolean; ms: number };
export type HealthReport = { status: "ok" | "degraded"; checks: Record<string, CheckResult> };

/**
 * Exécute des vérifications de dépendances en parallèle, chacune bornée
 * par un délai. Une dépendance lente est comptée en échec plutôt que de
 * faire pendre la sonde (un load balancer qui attend une sonde bloquée
 * retire l'instance trop tard). Le rapport ne contient jamais le texte
 * des erreurs — il est lisible publiquement ; `onFailure` sert aux logs
 * serveur.
 */
export async function runChecks(
  checks: Record<string, () => Promise<unknown>>,
  timeoutMs: number,
  onFailure?: (name: string, err: unknown) => void
): Promise<HealthReport> {
  const entries = await Promise.all(
    Object.entries(checks).map(async ([name, check]): Promise<[string, CheckResult]> => {
      const start = Date.now();
      try {
        await withTimeout(check(), timeoutMs, name);
        return [name, { ok: true, ms: Date.now() - start }];
      } catch (err) {
        onFailure?.(name, err);
        return [name, { ok: false, ms: Date.now() - start }];
      }
    })
  );
  const results = Object.fromEntries(entries);
  const allOk = entries.every(([, r]) => r.ok);
  return { status: allOk ? "ok" : "degraded", checks: results };
}
