export type Slot = "haut" | "bas" | "robe" | "accessoire";

export const CATEGORY_SLOT: Record<string, Slot> = {
  Manteaux: "haut",
  Vestes: "haut",
  Pulls: "haut",
  Chemises: "haut",
  Pantalons: "bas",
  Robes: "robe",
  Accessoires: "accessoire",
};

// Silhouette utilisée pour choisir la géométrie du haut (voir Mannequin3D).
export type HautStyle = "coat" | "jacket" | "knit" | "shirt";

export const CATEGORY_HAUT_STYLE: Record<string, HautStyle> = {
  Manteaux: "coat",
  Vestes: "jacket",
  Pulls: "knit",
  Chemises: "shirt",
};

export const PALETTE: Record<string, string> = {
  Ink: "#1C1A16",
  Bone: "#EDE6D6",
  Brick: "#8A3A26",
  Muted: "#8C8578",
};

export function firstColorHex(colors: string): string {
  const first = colors.split(",")[0]?.trim();
  return PALETTE[first] ?? "#8C8578";
}

export type MannequinProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  priceCents: number;
  image: string;
  colors: string;
  variants: { size: string; stock: number }[];
};
