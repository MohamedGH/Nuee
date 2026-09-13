export const COLOR_PALETTE: Record<string, string> = {
  Ink: "#1C1A16",
  Bone: "#EDE6D6",
  Brick: "#8A3A26",
  Muted: "#8C8578",
};

export function colorHex(name: string): string {
  return COLOR_PALETTE[name.trim()] ?? "#8C8578";
}

export function firstColorHex(colors: string): string {
  return colorHex(colors.split(",")[0] ?? "");
}
