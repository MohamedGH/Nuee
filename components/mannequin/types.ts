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

export { firstColorHex } from "@/lib/colors";

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
