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
  if (!res.ok) {
    // Without this check a 404 hands the Next.js HTML error page to
    // createImageBitmap, which throws an opaque InvalidStateError
    // ("The source image could not be decoded").
    throw new Error(`Image fetch failed (${res.status}): ${src}`);
  }
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

  // A missing/corrupt layer image just gets skipped — one bad asset
  // shouldn't take down the whole tower render.
  const results = await Promise.allSettled(layers.map((l) => loadImage(l.src)));
  for (const [i, r] of results.entries()) {
    if (r.status === "fulfilled") {
      ctx.drawImage(r.value, 0, 0, canvas.width, canvas.height);
    } else {
      console.warn(`Skipping tower layer "${layers[i]?.id}":`, r.reason);
    }
  }

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

type Photo = { id: number; label: string; url: string; default?: boolean };

export const STATIC_PHOTOS: Record<string, Photo[]> = {
  "003401": [
    {
      id: 1,
      label: "Site Image 1",
      url: "/uploads/site_image/003401/23f65f2a-48f3-46f4-b19b-ea8130c5b64e.jpg",
      default: true,
    },
    {
      id: 2,
      label: "Site Image 2",
      url: "/uploads/site_image/003401/7b3f69c9-bfd3-43b0-b20b-4a41b283c486.jpg",
    },
    {
      id: 3,
      label: "Site Image 3",
      url: "/uploads/site_image/003401/8dd59b6b-ef67-4cdb-baa4-897d3014086f.jpg",
    },
    {
      id: 4,
      label: "Site Image 4",
      url: "/uploads/site_image/003401/9fd5ae1a-dda4-4751-85d6-f7469dd7ed0c.jpg",
    },
    {
      id: 5,
      label: "Site Image 5",
      url: "/uploads/site_image/003401/fa47b445-b990-4291-a80c-47d1cd6d8de8.jpg",
    },
  ],
  "007938": [
    {
      id: 6,
      label: "Site Image 1",
      url: "/uploads/site_image/007938/295663fd-9d71-43c2-8a0c-dcde37487210.png",
      default: true,
    },
    {
      id: 7,
      label: "Site Image 2",
      url: "/uploads/site_image/007938/4b2c185c-7eaa-4f9b-a20d-46ae19be14d6.png",
    },
    {
      id: 8,
      label: "Site Image 3",
      url: "/uploads/site_image/007938/71c559b6-bee3-42ff-ae0a-ce5141d491d0.png",
    },
    {
      id: 9,
      label: "Site Image 4",
      url: "/uploads/site_image/007938/98786bb0-45e2-4b0b-8575-d2d945fe74be.png",
    },
    {
      id: 10,
      label: "Site Image 5",
      url: "/uploads/site_image/007938/b78583c3-e812-405b-aec1-736c00a476f1.png",
    },
  ],
  "008653": [
    {
      id: 11,
      label: "Site Image 1",
      url: "/uploads/site_image/008653/16d44549-d98f-4d3a-8868-2b9ef3a2faea.jpg",
      default: true,
    },
    {
      id: 12,
      label: "Site Image 2",
      url: "/uploads/site_image/008653/6606aac2-4442-4194-8eea-4df59d5cfa74.jpg",
    },
    {
      id: 13,
      label: "Site Image 3",
      url: "/uploads/site_image/008653/c8dbb96e-6dff-4c3d-9ef4-f152e4d6ec4f.jpg",
    },
  ],
  ACJMBIL0009: [
    {
      id: 14,
      label: "Site Image 1",
      url: "/uploads/site_image/ACJMBIL0009/2af7d5bf-cfdb-4410-8c83-098a49edf761.png",
      default: true,
    },
    {
      id: 15,
      label: "Site Image 2",
      url: "/uploads/site_image/ACJMBIL0009/5cdf27f4-1a4d-4160-99e4-28cf6d22c320.png",
    },
    {
      id: 16,
      label: "Site Image 3",
      url: "/uploads/site_image/ACJMBIL0009/6d134f17-63a9-478b-b27e-147b22fcd164.png",
    },
    {
      id: 17,
      label: "Site Image 4",
      url: "/uploads/site_image/ACJMBIL0009/ccdd7aa4-1322-4fb8-b3ca-b571c5fec2b0.png",
    },
    {
      id: 18,
      label: "Site Image 5",
      url: "/uploads/site_image/ACJMBIL0009/f88e935d-bc05-4afd-82f0-87ab2fb2213a.png",
    },
  ],
  ACJMCHW0010: [
    {
      id: 19,
      label: "Site Image 1",
      url: "/uploads/site_image/ACJMCHW0010/17f4d47d-bc46-4420-906d-1013bb61c68f.png",
      default: true,
    },
    {
      id: 20,
      label: "Site Image 2",
      url: "/uploads/site_image/ACJMCHW0010/56a66b1e-fcd8-443f-b888-6cc41ac7b971.png",
    },
    {
      id: 21,
      label: "Site Image 3",
      url: "/uploads/site_image/ACJMCHW0010/9cf5a6da-36e7-4daa-b56d-4b9138e50080.png",
    },
    {
      id: 22,
      label: "Site Image 4",
      url: "/uploads/site_image/ACJMCHW0010/c47d1ec7-51f9-42e7-9e7e-7b4d34d00c55.png",
    },
    {
      id: 23,
      label: "Site Image 5",
      url: "/uploads/site_image/ACJMCHW0010/feb2cd92-2d31-440e-b081-a51d84dd814e.png",
    },
  ],
  ACJMJAM0022: [
    {
      id: 24,
      label: "Site Image 1",
      url: "/uploads/site_image/ACJMJAM0022/3a00ac4e-7cd0-42fe-bf8d-906619e5bcbe.png",
      default: true,
    },
    {
      id: 25,
      label: "Site Image 2",
      url: "/uploads/site_image/ACJMJAM0022/7536979e-2be7-4e34-a7c6-37383505e5f2.png",
    },
    {
      id: 26,
      label: "Site Image 3",
      url: "/uploads/site_image/ACJMJAM0022/9a658fa0-d41c-4f34-bf49-47aaae37e5b8.png",
    },
    {
      id: 27,
      label: "Site Image 4",
      url: "/uploads/site_image/ACJMJAM0022/9e9d5222-0c2b-4670-984e-31443956f1b2.png",
    },
    {
      id: 28,
      label: "Site Image 5",
      url: "/uploads/site_image/ACJMJAM0022/fa801026-c371-426c-b4ea-a911ce420add.png",
    },
  ],
  ACJMKAT0026: [
    {
      id: 29,
      label: "Site Image 1",
      url: "/uploads/site_image/ACJMKAT0026/4045121b-4a27-4cad-a629-00d628371e6a.png",
      default: true,
    },
    {
      id: 30,
      label: "Site Image 2",
      url: "/uploads/site_image/ACJMKAT0026/44a02367-c65c-440d-8f73-9ea6e120ffa9.png",
    },
    {
      id: 31,
      label: "Site Image 3",
      url: "/uploads/site_image/ACJMKAT0026/4860a538-8564-4e9a-b14e-e7a6ee651500.png",
    },
    {
      id: 32,
      label: "Site Image 4",
      url: "/uploads/site_image/ACJMKAT0026/a1620c3e-98b2-4589-81f5-dd0c8a680f5a.png",
    },
    {
      id: 33,
      label: "Site Image 5",
      url: "/uploads/site_image/ACJMKAT0026/fc37c591-e30a-43fb-afa8-b485b6ed888c.png",
    },
  ],
  cnsvjxdvpo: [
    {
      id: 34,
      label: "Site Image 1",
      url: "/uploads/site_image/cnsvjxdvpo/1988fe4d-666d-40c4-8a95-7c36604e6130.jpg",
      default: true,
    },
    {
      id: 35,
      label: "Site Image 2",
      url: "/uploads/site_image/cnsvjxdvpo/7c5d5f6a-e3ed-480d-bb11-0f90140b27fc.jpg",
    },
    {
      id: 36,
      label: "Site Image 3",
      url: "/uploads/site_image/cnsvjxdvpo/9db98447-93a3-428c-9779-254c63f6c8a6.jpg",
    },
    {
      id: 37,
      label: "Site Image 4",
      url: "/uploads/site_image/cnsvjxdvpo/ba88c9b6-e072-41ec-8fba-739172bc762d.jpg",
    },
    {
      id: 38,
      label: "Site Image 5",
      url: "/uploads/site_image/cnsvjxdvpo/eb28ef9d-ff9f-4023-92ee-ab5c249dfb03.jpg",
    },
  ],
  KA0101: [
    {
      id: 39,
      label: "Site Image 1",
      url: "/uploads/site_image/KA0101/f7eb48a3-76bc-4c66-bc22-4d54d7da395c.png",
      default: true,
    },
  ],
  KA0237: [
    {
      id: 40,
      label: "Site Image 1",
      url: "/uploads/site_image/KA0237/2857c6ff-caa2-40fc-b893-ce49c05ad759.png",
      default: true,
    },
    {
      id: 41,
      label: "Site Image 2",
      url: "/uploads/site_image/KA0237/7dab1a3f-5477-4d79-99e2-ce27258932e7.jpg",
    },
    {
      id: 42,
      label: "Site Image 3",
      url: "/uploads/site_image/KA0237/b54977e6-0987-4404-8d46-e1896810722f.jpg",
    },
    {
      id: 43,
      label: "Site Image 4",
      url: "/uploads/site_image/KA0237/bee44972-46cb-4110-80f5-3bbd38c4f821.jpg",
    },
    {
      id: 44,
      label: "Site Image 5",
      url: "/uploads/site_image/KA0237/caf5b1ba-8438-4c80-88f5-bd978d91b70d.jpg",
    },
    {
      id: 45,
      label: "Site Image 6",
      url: "/uploads/site_image/KA0237/d27e6fcc-dbad-424d-954a-083700fbe519.jpg",
    },
  ],
  KA0287: [
    {
      id: 46,
      label: "Site Image 1",
      url: "/uploads/site_image/KA0287/22abf5ee-8ca7-44c0-a48f-1ec96b478236.jpg",
      default: true,
    },
    {
      id: 47,
      label: "Site Image 2",
      url: "/uploads/site_image/KA0287/5332cfdd-42b3-4423-a0d3-2713f53d47e8.jpg",
    },
    {
      id: 48,
      label: "Site Image 3",
      url: "/uploads/site_image/KA0287/67f73cb5-5b40-439d-9227-1dcd0f3b68ff.jpg",
    },
    {
      id: 49,
      label: "Site Image 4",
      url: "/uploads/site_image/KA0287/6bee9754-ab77-4606-9f62-3bb35fce50b8.jpg",
    },
    {
      id: 50,
      label: "Site Image 5",
      url: "/uploads/site_image/KA0287/739ef75b-559e-4365-9b94-7dd0b318a31d.jpg",
    },
    {
      id: 51,
      label: "Site Image 6",
      url: "/uploads/site_image/KA0287/792352a0-1d4a-4698-afd9-a031da47f7e3.jpg",
    },
    {
      id: 52,
      label: "Site Image 7",
      url: "/uploads/site_image/KA0287/8dabc49f-afeb-45d7-ae13-1080eb191473.jpg",
    },
    {
      id: 53,
      label: "Site Image 8",
      url: "/uploads/site_image/KA0287/958c5dcd-b495-43e7-b399-7a25bfc0bf22.jpg",
    },
    {
      id: 54,
      label: "Site Image 9",
      url: "/uploads/site_image/KA0287/b7d7bc74-563e-417f-8bdb-e8ae6976af3f.png",
    },
    {
      id: 55,
      label: "Site Image 10",
      url: "/uploads/site_image/KA0287/dd99e767-824c-4b05-ac3a-3928b5211112.jpg",
    },
    {
      id: 56,
      label: "Site Image 11",
      url: "/uploads/site_image/KA0287/e63b75f5-da1c-4ad0-b8ad-acf24896b1f0.png",
    },
    {
      id: 57,
      label: "Site Image 12",
      url: "/uploads/site_image/KA0287/ee747557-1da0-4be8-aa4a-2a42f4f9d0a8.jpg",
    },
    {
      id: 58,
      label: "Site Image 13",
      url: "/uploads/site_image/KA0287/f611d996-22aa-417b-8376-8b1a08c1465b.png",
    },
    {
      id: 59,
      label: "Site Image 14",
      url: "/uploads/site_image/KA0287/fb202757-bb24-489b-931f-d6e05d632cae.png",
    },
  ],
  wxvlpwykcp: [
    {
      id: 60,
      label: "Site Image 1",
      url: "/uploads/site_image/wxvlpwykcp/04d89719-ca55-4f2b-bb87-bf6d38d94348.jpg",
      default: true,
    },
    {
      id: 61,
      label: "Site Image 2",
      url: "/uploads/site_image/wxvlpwykcp/2046aa70-2e78-4f8f-9224-ca9e7c668b76.jpg",
    },
    {
      id: 62,
      label: "Site Image 3",
      url: "/uploads/site_image/wxvlpwykcp/651196c0-b45c-4b43-b600-62a81cc4dd73.jpg",
    },
    {
      id: 63,
      label: "Site Image 4",
      url: "/uploads/site_image/wxvlpwykcp/c9d49156-69f6-424e-afab-a928b3fe1add.jpg",
    },
    {
      id: 64,
      label: "Site Image 5",
      url: "/uploads/site_image/wxvlpwykcp/d7793dd2-9ce8-4be7-af4b-5cfa4828d6a3.jpg",
    },
  ],
};
