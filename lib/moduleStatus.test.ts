import { describe, it, expect } from "vitest";
import { getModuleStatuses } from "./moduleStatus";

describe("getModuleStatuses", () => {
  const statuses = getModuleStatuses();

  it("renvoie au moins un module", () => {
    expect(statuses.length).toBeGreaterThan(0);
  });

  it("chaque module a un nom, une description et un détail non vides", () => {
    for (const m of statuses) {
      expect(m.name.trim().length).toBeGreaterThan(0);
      expect(m.description.trim().length).toBeGreaterThan(0);
      expect(m.detail.trim().length).toBeGreaterThan(0);
    }
  });

  it("ne mentionne jamais de valeur secrète dans le détail affiché", () => {
    // Un hash bcrypt ou une clé API commencent toujours par ces
    // préfixes — leur présence dans un texte destiné à l'admin serait
    // une fuite, même dans une interface protégée par mot de passe.
    const suspiciousPatterns = [/\$2[aby]\$/, /^sk_/, /^whsec_/];
    for (const m of statuses) {
      for (const pattern of suspiciousPatterns) {
        expect(pattern.test(m.detail)).toBe(false);
      }
    }
  });

  it("les noms de module sont uniques", () => {
    const names = statuses.map((m) => m.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
