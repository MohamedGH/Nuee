export type SocialPlatform = {
  key: string;
  label: string;
  shortLabel: string;
  url: string;
};

/**
 * Chaque réseau est optionnel et absent tant que son URL n'est pas
 * renseignée — même logique que les modules analytics : rien ne
 * s'affiche par défaut, chaque intégration est un choix explicite.
 */
export function getSocialPlatforms(): SocialPlatform[] {
  const platforms: (SocialPlatform | null)[] = [
    process.env.NEXT_PUBLIC_INSTAGRAM_URL
      ? { key: "instagram", label: "Instagram", shortLabel: "IG", url: process.env.NEXT_PUBLIC_INSTAGRAM_URL }
      : null,
    process.env.NEXT_PUBLIC_PINTEREST_URL
      ? { key: "pinterest", label: "Pinterest", shortLabel: "PIN", url: process.env.NEXT_PUBLIC_PINTEREST_URL }
      : null,
    process.env.NEXT_PUBLIC_TIKTOK_URL
      ? { key: "tiktok", label: "TikTok", shortLabel: "TT", url: process.env.NEXT_PUBLIC_TIKTOK_URL }
      : null,
    process.env.NEXT_PUBLIC_FACEBOOK_URL
      ? { key: "facebook", label: "Facebook", shortLabel: "FB", url: process.env.NEXT_PUBLIC_FACEBOOK_URL }
      : null,
  ];
  return platforms.filter((p): p is SocialPlatform => p !== null);
}
