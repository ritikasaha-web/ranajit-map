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

export const formatDuration = (minutes: number): string => {
  const totalSeconds = Math.round(minutes * 60);

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
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

// component_names.ts
export function prefetchLayers(layers: ComponentLayer[]): Promise<void> {
  return Promise.all(
    layers.map(
      (l) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // don't block compositing on 404s
          img.src = l.src;
        }),
    ),
  ).then(() => undefined);
}
export const compressImage = (
  file: File,
  maxWidth = 900,
  quality = 0.55,
  maxBytes = 45 * 1024,
): Promise<File> => {
  const canvasToBlob = (
    canvas: HTMLCanvasElement,
    outputType: string,
    outputQuality: number,
  ) =>
    new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Canvas compression failed"));
        },
        outputType,
        outputQuality,
      );
    });

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, maxWidth / img.width);
        let width = Math.max(1, Math.round(img.width * scale));
        let height = Math.max(1, Math.round(img.height * scale));
        let outputQuality = quality;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Canvas context unavailable"));
          return;
        }

        // Always output as JPEG — quality param is ignored for PNG
        const outputType = "image/jpeg";
        const outputName = file.name.replace(/\.[^.]+$/, ".jpg");

        try {
          let blob: Blob;

          do {
            canvas.width = width;
            canvas.height = height;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            blob = await canvasToBlob(canvas, outputType, outputQuality);

            if (blob.size <= maxBytes) break;

            if (outputQuality > 0.25) {
              outputQuality = Math.max(0.25, outputQuality - 0.1);
            } else {
              width = Math.max(240, Math.round(width * 0.85));
              height = Math.max(
                1,
                Math.round((img.height * width) / img.width),
              );
            }
          } while (blob.size > maxBytes && width > 240);

          resolve(
            new File([blob], outputName, {
              type: outputType,
              lastModified: Date.now(),
            }),
          );
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};
