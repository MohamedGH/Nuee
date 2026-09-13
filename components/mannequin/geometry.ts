import * as THREE from "three";

/**
 * Déplace les sommets d'une géométrie de révolution (capsule, cône, cylindre)
 * radialement, selon une somme de sinusoïdes, pour simuler des plis de tissu
 * plutôt qu'une surface plastique parfaitement lisse.
 */
export function addFolds(geometry: THREE.BufferGeometry, amplitude = 0.011, frequency = 7) {
  const pos = geometry.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const angle = Math.atan2(v.z, v.x);
    const len = Math.hypot(v.x, v.z);
    if (len < 0.001) continue;

    const offset =
      Math.sin(angle * frequency + v.y * 9) * amplitude +
      Math.sin(v.y * 22 + angle * 2) * amplitude * 0.35;

    const nx = v.x / len;
    const nz = v.z / len;
    v.x += nx * offset;
    v.z += nz * offset;
    pos.setXYZ(i, v.x, v.y, v.z);
  }

  pos.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Texture procédurale imitant une armure toile légère : pas de fichier
 * externe, juste un canvas dessiné au runtime puis répété sur le maillage.
 * Donne un aspect "tissu" (grain, variation de teinte) plutôt qu'un plastique
 * uniforme, sans dépendre d'un CDN d'assets.
 */
export function makeFabricTexture(baseHex: string): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, size, size);

  // Trame croisée façon toile, en clair et en sombre superposés.
  ctx.globalAlpha = 0.1;
  ctx.strokeStyle = "#000000";
  for (let i = -size; i < size * 2; i += 3) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + size, size);
    ctx.stroke();
  }
  ctx.strokeStyle = "#ffffff";
  ctx.globalAlpha = 0.06;
  for (let i = -size; i < size * 2; i += 3) {
    ctx.beginPath();
    ctx.moveTo(i, size);
    ctx.lineTo(i + size, 0);
    ctx.stroke();
  }

  // Grain fin.
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 250; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? "#000000" : "#ffffff";
    ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 5);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Profil (rayon, hauteur) revolu autour de l'axe Y — silhouette du buste du mannequin. */
export const MANNEQUIN_PROFILE: [number, number][] = [
  [0.001, 1.72],
  [0.1, 1.695],
  [0.125, 1.63],
  [0.12, 1.56],
  [0.078, 1.47],
  [0.066, 1.41],
  [0.095, 1.345],
  [0.225, 1.3],
  [0.215, 1.19],
  [0.198, 1.07],
  [0.188, 0.97],
  [0.168, 0.89],
  [0.192, 0.79],
  [0.218, 0.67],
  [0.202, 0.59],
  [0.16, 0.535],
];

/** Profil du manteau : ajusté à la poitrine, évasé vers l'ourlet. */
export const COAT_PROFILE: [number, number][] = [
  [0.24, 1.3],
  [0.235, 1.15],
  [0.22, 1.0],
  [0.225, 0.85],
  [0.26, 0.7],
  [0.32, 0.5],
  [0.36, 0.3],
  [0.39, 0.15],
];

export function latheGeometry(profile: [number, number][], segments = 28) {
  const points = profile.map(([r, y]) => new THREE.Vector2(r, y));
  return new THREE.LatheGeometry(points, segments);
}
