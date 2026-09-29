import type { WeightedVariant } from "@/lib/abtest";

export type ExperimentDefinition<T extends string> = {
  /** Identifiant unique — utilisé comme clé de hash et comme dimension GA4 (experiment_id). */
  key: string;
  /** Description courte : quoi, pourquoi — pour qui reprend ce code plus tard. */
  description: string;
  /** Variantes et leurs poids relatifs. La première sert de témoin (contrôle). */
  variants: readonly WeightedVariant<T>[];
  /**
   * Coupe-circuit : si false, tout le monde reçoit le témoin
   * (variants[0].value) sans passer par le hash, et aucune exposition
   * n'est suivie — utile pour désactiver une expérience terminée sans
   * retoucher le composant qui l'utilise.
   */
  active: boolean;
};

function defineExperiment<T extends string>(def: ExperimentDefinition<T>) {
  return def;
}

/**
 * Toutes les expériences actives du site, dans un seul fichier — pour
 * éviter deux expériences avec la même clé (silencieusement corrélées
 * par le hash) et pour savoir d'un coup d'œil ce qui tourne en ce
 * moment sans grep-per le code des composants.
 */
export const experiments = {
  ctaColor: defineExperiment({
    key: "cta-color",
    description:
      "Couleur du bouton « Ajouter au panier » sur la fiche produit — témoin encre vs accent brique.",
    variants: [
      { value: "ink", weight: 1 },
      { value: "brick", weight: 1 },
    ] as const,
    active: true,
  }),
} satisfies Record<string, ExperimentDefinition<string>>;

export type ExperimentName = keyof typeof experiments;
