import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { runChecks } from "./health";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("runChecks", () => {
  it("renvoie ok quand toutes les vérifications réussissent", async () => {
    const report = await runChecks({ database: async () => 1, cache: async () => 1 }, 1000);
    expect(report.status).toBe("ok");
    expect(report.checks.database.ok).toBe(true);
    expect(report.checks.cache.ok).toBe(true);
  });

  it("renvoie degraded dès qu'une vérification échoue, et garde les autres lisibles", async () => {
    const report = await runChecks(
      { database: async () => { throw new Error("connexion refusée"); }, cache: async () => 1 },
      1000
    );
    expect(report.status).toBe("degraded");
    expect(report.checks.database.ok).toBe(false);
    expect(report.checks.cache.ok).toBe(true);
  });

  it("compte une dépendance qui pend comme un échec (la sonde ne pend pas)", async () => {
    const result = runChecks({ database: () => new Promise(() => {}) }, 2000);
    await vi.advanceTimersByTimeAsync(2001);
    const report = await result;
    expect(report.status).toBe("degraded");
    expect(report.checks.database.ok).toBe(false);
  });

  it("n'expose JAMAIS le texte de l'erreur dans le rapport (public)", async () => {
    const report = await runChecks(
      { database: async () => { throw new Error("password=hunter2 host=10.0.0.5"); } },
      1000
    );
    expect(JSON.stringify(report)).not.toMatch(/hunter2|10\.0\.0\.5|password/);
  });

  it("transmet l'erreur réelle aux logs serveur via onFailure", async () => {
    const onFailure = vi.fn();
    await runChecks({ database: async () => { throw new Error("détail interne"); } }, 1000, onFailure);
    expect(onFailure).toHaveBeenCalledOnce();
    expect(onFailure.mock.calls[0][0]).toBe("database");
    expect((onFailure.mock.calls[0][1] as Error).message).toBe("détail interne");
  });

  it("n'appelle pas onFailure quand tout va bien", async () => {
    const onFailure = vi.fn();
    await runChecks({ database: async () => 1 }, 1000, onFailure);
    expect(onFailure).not.toHaveBeenCalled();
  });

  it("exécute les vérifications en parallèle (le total n'est pas la somme)", async () => {
    const slow = () => new Promise((r) => setTimeout(r, 500));
    const result = runChecks({ a: slow, b: slow, c: slow }, 5000);
    await vi.advanceTimersByTimeAsync(500);
    const report = await result;
    expect(report.status).toBe("ok");
    expect(report.checks.a.ms).toBeLessThan(1000);
  });

  it("renvoie ok avec zéro vérification", async () => {
    expect((await runChecks({}, 1000)).status).toBe("ok");
  });
});
