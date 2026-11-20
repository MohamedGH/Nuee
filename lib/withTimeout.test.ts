import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { withTimeout, fetchWithTimeout, TimeoutError } from "./withTimeout";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("withTimeout", () => {
  it("renvoie la valeur d'une promesse qui se résout à temps", async () => {
    await expect(withTimeout(Promise.resolve(42), 1000)).resolves.toBe(42);
  });

  it("propage le rejet d'origine (pas masqué en timeout)", async () => {
    await expect(withTimeout(Promise.reject(new Error("boom")), 1000)).rejects.toThrow("boom");
  });

  it("lève TimeoutError si la promesse dépasse le délai", async () => {
    const never = new Promise<never>(() => {});
    const result = withTimeout(never, 500, "base");
    const assertion = expect(result).rejects.toBeInstanceOf(TimeoutError);
    await vi.advanceTimersByTimeAsync(501);
    await assertion;
  });

  it("nomme l'opération et le délai dans le message", async () => {
    const result = withTimeout(new Promise<never>(() => {}), 250, "base");
    const assertion = expect(result).rejects.toThrow(/base.*250 ms/);
    await vi.advanceTimersByTimeAsync(251);
    await assertion;
  });

  it("libère son minuteur une fois la promesse résolue (pas de fuite)", async () => {
    await withTimeout(Promise.resolve("ok"), 10_000);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("n'attend pas le délai complet quand la promesse est rapide", async () => {
    const result = withTimeout(new Promise((r) => setTimeout(() => r("vite"), 50)), 10_000);
    await vi.advanceTimersByTimeAsync(60);
    await expect(result).resolves.toBe("vite");
  });
});

describe("fetchWithTimeout", () => {
  function stubFetchHonoringAbort() {
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init: RequestInit) => {
        return new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
        });
      })
    );
  }

  it("renvoie la réponse quand le serveur répond à temps", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("ok", { status: 200 })));
    const res = await fetchWithTimeout("https://example.com", {}, 1000);
    expect(res.status).toBe(200);
  });

  it("ANNULE réellement la requête et lève TimeoutError quand le serveur pend", async () => {
    stubFetchHonoringAbort();
    const result = fetchWithTimeout("https://example.com", {}, 300);
    const assertion = expect(result).rejects.toBeInstanceOf(TimeoutError);
    await vi.advanceTimersByTimeAsync(301);
    await assertion;
    const signal = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1].signal as AbortSignal;
    expect(signal.aborted).toBe(true);
  });

  it("propage une erreur réseau ordinaire sans la transformer en timeout", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("réseau coupé")));
    await expect(fetchWithTimeout("https://example.com", {}, 1000)).rejects.toThrow("réseau coupé");
  });

  it("libère son minuteur après réponse", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("ok")));
    await fetchWithTimeout("https://example.com", {}, 10_000);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("transmet méthode et corps tels quels", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("ok"));
    vi.stubGlobal("fetch", fetchMock);
    await fetchWithTimeout("https://example.com", { method: "POST", body: "x" }, 1000);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "POST", body: "x" });
  });
});
