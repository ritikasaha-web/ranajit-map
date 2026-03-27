export const fourPoledComponentSet: Set<string> = new Set([
  "beacon",
  "antenna",
  "cable",
  "equipment_shelter",
  "fuel_tank",
  "ladder",
  "lightning_rod",
  "microwave",
  "power_cabinate",
  "rrh",
  "tma",
  "waveguides",
  "diesel_generator",
  "fcu",
]);

export const monopoleComponentSet: Set<string> = new Set([
  "beacon",
  "antenna",
  "antenna_mounting_frames",
  "cable",
  "down_conductor",
  "fuel_tank",
  "lightning_rod",
  "microwave",
  "power_cabinate",
  "rf_jumpers",
  "rrh",
  "equipment_shelter",
  "fcu",
  "diesel_generator",
]);
export const tripoleComponentSet: Set<string> = new Set([
  "beacon",
  "antenna_mounting_frames",
  "cable",
  "antenna",
  "equipment_shelter",
  "fuel_tank",
  "ladder",
  "lightning_rod",
  "microwave",
  "power_cabinate",
  "rf_jumpers",
  "rrh",
  "waveguides",
  "diesel_generator",
  "fcu",
]);
export const guyedMastComponentSet: Set<string> = new Set([
  "beacon",
  "cable",
  "antenna",
  "down_conductor",
  "ladder",
  "equipment_shelter",
  "lightning_rod",
  "microwave",
  "power_cabinate",
  "fuel_tank",
  "rrh",
  "tma",
  "diesel_generator",
  "fcu",
]);

export const baseTypes: Record<string, string> = {
  RTT: "RTT",
  GBT: "GBT",
  GBM: "GBT",
  PYLON: "PYLON",
};

export function formatLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export const applyFormatting = (text: string) => {
  const normalized = text.toLowerCase();

  if (upperCaseSet.has(normalized)) {
    return text.toUpperCase();
  }

  return formatLabel(text);
};

export const upperCaseSet: Set<string> = new Set([
  "spr",
  "slr",
  "fcu",
  "rrh",
  "rru",
  "smps",
  "4g-rmu",
  "amf",
  "dcem",
  "odc",
  "imps",
  "mtib",
  "shl",
  "stb",
  "tma",
  "tmib",
  "wcdma-rmu",
  "misc",
  "bk cab",
  "abb",
  "sim",
  "dcdb",
  "dgb",
  "rm",
  "ac",
  "rtu",
  "gbt",
  "rtt",
  "ipms",
  "rms",
  "gbm",
  "dg",
]);
export const lowerCaseSet: Set<string> = new Set([
  "(mm)",
  "mm",
  "(cm)",
  "cm",
  "(m)",
  "m",
]);

/* ── Shared tower image cache & compositor ──────────────────────
   Import this in both TowerPreview and ExpandTowerPreview so the
   browser never re-fetches or re-decodes the same layer twice.
──────────────────────────────────────────────────────────────── */

export interface ComponentLayer {
  src: string;
  id: string;
  anchor: { x: number; y: number };
}

const MAX_CACHE_SIZE = 50;

function makeLRUCache<V>(maxSize: number) {
  const map = new Map<string, V>();
  return {
    has: (k: string) => map.has(k),
    get: (k: string) => map.get(k),
    set: (k: string, v: V) => {
      if (map.size >= maxSize) map.delete(map.keys().next().value!);
      map.set(k, v);
    },
  };
}

// One shared cache — survives across modal open/close and component mounts
const imageBitmapCache = makeLRUCache<ImageBitmap>(MAX_CACHE_SIZE);
const towerCache = makeLRUCache<string>(MAX_CACHE_SIZE);

export async function loadImage(src: string): Promise<ImageBitmap> {
  const cached = imageBitmapCache.get(src);
  if (cached) return cached;

  const res = await fetch(src);
  const blob = await res.blob();
  const bitmap = await createImageBitmap(blob);
  imageBitmapCache.set(src, bitmap);
  return bitmap;
}

export async function generateTowerImage(
  layers: ComponentLayer[],
): Promise<string> {
  const key = layers.map((l) => l.src).join("|");

  const cached = towerCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = 500;
  canvas.height = 420;
  const ctx = canvas.getContext("2d")!;

  const images = await Promise.all(layers.map((l) => loadImage(l.src)));
  images.forEach((img) =>
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height),
  );

  const result = canvas.toDataURL("image/webp");
  towerCache.set(key, result);
  return result;
}

/** Call this when tower data arrives (e.g. after useTower resolves)
 *  to warm the bitmap cache before the user opens the modal. */
export function prefetchLayers(layers: ComponentLayer[]): void {
  layers.forEach(({ src }) => {
    if (!imageBitmapCache.has(src)) loadImage(src); // fire-and-forget
  });
}
