import { describe, it, expect, afterEach, vi } from "vitest";
import { hasOptOutSignal } from "./privacySignals";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("hasOptOutSignal", () => {
  it("renvoie false sans signal particulier", () => {
    vi.stubGlobal("navigator", {});
    vi.stubGlobal("window", {});
    expect(hasOptOutSignal()).toBe(false);
  });

  it("détecte Global Privacy Control", () => {
    vi.stubGlobal("navigator", { globalPrivacyControl: true });
    vi.stubGlobal("window", {});
    expect(hasOptOutSignal()).toBe(true);
  });

  it("détecte Do Not Track = \"1\" sur navigator", () => {
    vi.stubGlobal("navigator", { doNotTrack: "1" });
    vi.stubGlobal("window", {});
    expect(hasOptOutSignal()).toBe(true);
  });

  it("détecte Do Not Track = \"yes\" (ancien Safari/IE)", () => {
    vi.stubGlobal("navigator", { doNotTrack: "yes" });
    vi.stubGlobal("window", {});
    expect(hasOptOutSignal()).toBe(true);
  });

  it("ignore Do Not Track désactivé explicitement (\"0\")", () => {
    vi.stubGlobal("navigator", { doNotTrack: "0" });
    vi.stubGlobal("window", {});
    expect(hasOptOutSignal()).toBe(false);
  });

  it("retombe sur window.doNotTrack si navigator.doNotTrack est absent", () => {
    vi.stubGlobal("navigator", {});
    vi.stubGlobal("window", { doNotTrack: "1" });
    expect(hasOptOutSignal()).toBe(true);
  });

  it("renvoie false hors navigateur (navigator indéfini)", () => {
    vi.stubGlobal("navigator", undefined);
    expect(hasOptOutSignal()).toBe(false);
  });
});
