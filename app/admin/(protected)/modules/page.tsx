import { getModuleStatuses } from "@/lib/moduleStatus";

export const dynamic = "force-dynamic";

export default function AdminModulesPage() {
  const modules = getModuleStatuses();
  const activeCount = modules.filter((m) => m.active).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-3xl italic">Modules</h1>
        <p className="font-mono text-xs text-ink-soft">
          {activeCount}/{modules.length} actifs
        </p>
      </div>
      <p className="text-ink-soft text-sm mb-10 max-w-2xl">
        État réel de chaque module optionnel du site, calculé depuis la
        configuration effectivement chargée — pas un simple rappel de ce
        qui existe dans le code.
      </p>

      <div className="flex flex-col gap-4">
        {modules.map((m) => (
          <div key={m.name} className="border border-line p-5 flex items-start gap-4">
            <span
              aria-hidden
              className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${
                m.active ? "bg-brick" : "bg-line border border-ink-soft"
              }`}
            />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-4 mb-1">
                <p className="font-display text-lg">{m.name}</p>
                <span
                  className={`font-mono text-[10px] tracking-tag uppercase px-2 py-1 shrink-0 ${
                    m.active ? "bg-ink text-bone" : "text-ink-soft border border-line"
                  }`}
                >
                  {m.active ? "Actif" : "Inactif"}
                </span>
              </div>
              <p className="text-sm text-ink-soft mb-2">{m.description}</p>
              <p className="font-mono text-xs text-muted">{m.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="font-mono text-xs text-muted mt-8">
        Détail de chaque module : README (sections "Analytique", "Tests
        A/B", "Espace administrateur").
      </p>
    </div>
  );
}
