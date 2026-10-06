import { experiments } from "@/lib/experiments";
import SignificanceCalculator from "@/components/admin/SignificanceCalculator";

export const dynamic = "force-dynamic";

export default function AdminExperimentsPage() {
  const list = Object.values(experiments);

  return (
    <div>
      <h1 className="font-display text-3xl italic mb-8">Tests A/B</h1>

      <p className="font-mono text-xs tracking-tag uppercase text-ink-soft mb-4">
        Expériences déclarées
      </p>
      <div className="flex flex-col gap-3 mb-12">
        {list.map((e) => (
          <div key={e.key} className="border border-line p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="font-mono text-sm">{e.key}</p>
              <span
                className={`font-mono text-[10px] tracking-tag uppercase px-2 py-1 ${
                  e.active ? "bg-ink text-bone" : "text-ink-soft border border-line"
                }`}
              >
                {e.active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-sm text-ink-soft mb-2">{e.description}</p>
            <p className="font-mono text-xs text-muted">
              Variantes :{" "}
              {e.variants.map((v) => `${v.value} (poids ${v.weight})`).join(", ")}
            </p>
          </div>
        ))}
      </div>

      <p className="font-mono text-xs tracking-tag uppercase text-ink-soft mb-4">
        Analyser un résultat
      </p>
      <SignificanceCalculator />
    </div>
  );
}
