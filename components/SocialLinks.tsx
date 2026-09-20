import type { SocialPlatform } from "@/lib/social";

/**
 * Rend les réseaux sociaux configurés comme des badges typographiques
 * (pas de logos de marque, pour rester dans l'esprit "étiquette" déjà
 * utilisé partout sur le site, et éviter toute question de droits sur
 * des logos tiers). Autonome et réutilisable : reçoit sa liste en prop,
 * ne lit rien lui-même — c'est l'appelant qui décide de la source
 * (getSocialPlatforms() aujourd'hui, une autre config demain).
 *
 * Ne rend rien si la liste est vide.
 */
export default function SocialLinks({
  platforms,
  className = "",
}: {
  platforms: SocialPlatform[];
  className?: string;
}) {
  if (platforms.length === 0) return null;

  return (
    <ul className={`flex items-center gap-3 ${className}`}>
      {platforms.map((p) => (
        <li key={p.key}>
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={p.label}
            className="focus-ring flex items-center justify-center w-9 h-9 border border-line font-mono text-[10px] tracking-tag text-ink-soft hover:border-ink hover:text-ink transition-colors"
          >
            {p.shortLabel}
          </a>
        </li>
      ))}
    </ul>
  );
}
