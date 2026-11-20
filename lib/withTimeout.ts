export class TimeoutError extends Error {
  constructor(public readonly ms: number, label: string) {
    super(`${label} : délai de ${ms} ms dépassé`);
    this.name = "TimeoutError";
  }
}

/**
 * Borne la durée d'une promesse. Ne peut pas ANNULER le travail sous-jacent
 * (une requête Prisma continue côté base) : elle libère seulement
 * l'appelant, pour qu'un service lent ne bloque pas la requête entrante.
 */
export function withTimeout<T>(promise: PromiseLike<T>, ms: number, label = "opération"): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(ms, label)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/**
 * fetch avec délai maximum ET annulation réelle de la requête
 * (AbortController). Lève TimeoutError si le délai est dépassé. Un signal
 * fourni par l'appelant dans `init` est remplacé par celui du délai.
 */
export async function fetchWithTimeout(
  input: string | URL,
  init: RequestInit = {},
  ms: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (err) {
    if (controller.signal.aborted) throw new TimeoutError(ms, "requête HTTP");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
