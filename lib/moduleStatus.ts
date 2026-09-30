import { env } from "@/lib/env";
import { experiments } from "@/lib/experiments";
import { getSocialPlatforms } from "@/lib/social";

export type ModuleStatus = {
  name: string;
  active: boolean;
  description: string;
  /** Détail court affiché sous le statut — jamais une valeur secrète. */
  detail: string;
};

/**
 * État réel des modules tiers/optionnels du site, calculé côté serveur
 * à partir des variables d'environnement effectivement chargées — pas
 * une simple relecture de .env.example. Sert la page /admin/modules.
 * Ne renvoie jamais de secret (clé API, hash, token), seulement des
 * booléens et des libellés.
 */
export function getModuleStatuses(): ModuleStatus[] {
  const socialPlatforms = getSocialPlatforms();
  const experimentList = Object.values(experiments);
  const activeExperiments = experimentList.filter((e) => e.active);

  return [
    {
      name: "Google Analytics 4",
      active: Boolean(env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
      description:
        "Mesure d'audience et tunnel de conversion (vue produit, recherche, ajout panier, début de paiement, achat).",
      detail: env.NEXT_PUBLIC_GA_MEASUREMENT_ID
        ? "Chargé côté navigateur après consentement du visiteur."
        : "NEXT_PUBLIC_GA_MEASUREMENT_ID non renseignée — aucun script chargé.",
    },
    {
      name: "Achat côté serveur (Measurement Protocol)",
      active: Boolean(env.NEXT_PUBLIC_GA_MEASUREMENT_ID && env.GA4_API_SECRET),
      description:
        "Envoie l'event d'achat depuis le webhook Stripe plutôt que le navigateur — fiable même si le script GA est bloqué.",
      detail: env.GA4_API_SECRET
        ? "Clé API configurée — actif dès qu'un visiteur consentant finalise un paiement."
        : "GA4_API_SECRET non renseignée — l'achat n'est alors suivi que côté navigateur (moins fiable).",
    },
    {
      name: "Microsoft Clarity",
      active: Boolean(env.NEXT_PUBLIC_CLARITY_ID),
      description: "Cartes de chaleur et enregistrements de session anonymisés.",
      detail: env.NEXT_PUBLIC_CLARITY_ID
        ? "Chargé côté navigateur après consentement du visiteur."
        : "NEXT_PUBLIC_CLARITY_ID non renseignée — aucun script chargé.",
    },
    {
      name: "API Topics (Privacy Sandbox)",
      active: process.env.NEXT_PUBLIC_ENABLE_TOPICS === "true",
      description:
        "Centres d'intérêt classés par le navigateur (Chrome), sans cookie tiers — pas d'effet concret sans partenaire publicitaire côté NUÉE.",
      detail:
        process.env.NEXT_PUBLIC_ENABLE_TOPICS === "true"
          ? "Activée — observation au montage, après consentement."
          : "Désactivée (NEXT_PUBLIC_ENABLE_TOPICS ≠ \"true\").",
    },
    {
      name: "Réseaux sociaux",
      active: socialPlatforms.length > 0,
      description: "Badges en pied de page + profils listés dans les données structurées de l'accueil.",
      detail:
        socialPlatforms.length > 0
          ? `${socialPlatforms.length} réseau(x) configuré(s) : ${socialPlatforms.map((p) => p.label).join(", ")}.`
          : "Aucune URL renseignée (NEXT_PUBLIC_INSTAGRAM_URL, etc.) — rien n'est affiché.",
    },
    {
      name: "Tests A/B",
      active: activeExperiments.length > 0,
      description: "Répartition déterministe des visiteurs entre variantes, résultats lisibles dans GA4.",
      detail:
        activeExperiments.length > 0
          ? `${activeExperiments.length}/${experimentList.length} expérience(s) active(s) : ${activeExperiments
              .map((e) => e.key)
              .join(", ")}.`
          : "Aucune expérience active — tous les visiteurs reçoivent le témoin.",
    },
    {
      name: "Espace administrateur",
      active: Boolean(env.ADMIN_PASSWORD_HASH && env.ADMIN_SESSION_SECRET),
      description: "Tableau de bord, commandes, stock, avis, coupons — protégé par mot de passe.",
      detail:
        env.ADMIN_PASSWORD_HASH && env.ADMIN_SESSION_SECRET
          ? "Configuré (vous y êtes) — session signée de 12h."
          : "Configuration incomplète — voir README.",
    },
    {
      name: "Signaux de confidentialité (GPC / Do Not Track)",
      active: true,
      description:
        "Un navigateur envoyant ce signal reçoit un refus automatique de suivi, sans même voir le bandeau de consentement.",
      detail: "Toujours actif — ne dépend d'aucune variable d'environnement.",
    },
  ];
}
