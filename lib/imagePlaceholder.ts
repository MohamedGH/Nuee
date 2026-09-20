// Un aplat neutre encodé en data URI, précalculé — sert de blurDataURL à
// toutes les images produit pour lisser le chargement (pas de flash blanc
// brutal). Pas de Buffer/btoa au runtime : une chaîne littérale, donc sûre
// aussi bien dans un composant serveur que dans un bundle client.
export const IMAGE_BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjEwIj48cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSIxMCIgZmlsbD0iJTIzREFEM0M0Ii8+PC9zdmc+";
