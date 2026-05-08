import { dittoApi, isDittoNotFound } from "./client";

export type SiteImageEntry = {
  url: string;
  ts: number;
  default: boolean;
};

export type MappedSiteImage = {
  id: number;
  label: string;
  url: string;
  default: boolean;
};

type StoredSiteImageEntry = SiteImageEntry & {
  id: string;
  source: "legacy" | "siteImages";
};

const MAX_SITE_IMAGES = 5;

export const toSiteId = (thingId: string) =>
  thingId.includes(":") ? thingId.split(":")[1] : thingId;

const thingPath = (siteId: string) => `things/in.codez.telecom:${siteId}`;
const legacyImagesPath = (siteId: string) =>
  `${thingPath(siteId)}/attributes/images`;
const siteImagesPath = (siteId: string) =>
  `${thingPath(siteId)}/attributes/siteImages`;
const siteImageEntryPath = (siteId: string, id: string) =>
  `${siteImagesPath(siteId)}/${id}`;

const createImageId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const getLegacyImageEntries = async (
  siteId: string,
): Promise<StoredSiteImageEntry[]> => {
  try {
    const response = await dittoApi.get<SiteImageEntry[]>(legacyImagesPath(siteId));
    const images = Array.isArray(response.data) ? response.data : [];

    return images.map((img, idx) => ({
      ...img,
      default: img.default === true,
      id: `legacy-${idx}`,
      source: "legacy",
    }));
  } catch (error) {
    if (isDittoNotFound(error)) return [];
    throw error;
  }
};

const getNewImageEntries = async (
  siteId: string,
): Promise<StoredSiteImageEntry[]> => {
  try {
    const response =
      await dittoApi.get<Record<string, SiteImageEntry>>(siteImagesPath(siteId));
    const imageMap = response.data || {};

    return Object.entries(imageMap).map(([id, img]) => ({
      ...img,
      default: img.default === true,
      id,
      source: "siteImages",
    }));
  } catch (error) {
    if (isDittoNotFound(error)) return [];
    throw error;
  }
};

const getStoredSiteImageEntries = async (
  thingOrSiteId: string,
  options: { suppressErrors?: boolean } = {},
): Promise<StoredSiteImageEntry[]> => {
  const siteId = toSiteId(thingOrSiteId);

  try {
    const [legacyImages, newImages] = await Promise.all([
      getLegacyImageEntries(siteId),
      getNewImageEntries(siteId),
    ]);

    return [...legacyImages, ...newImages].sort((a, b) => a.ts - b.ts);
  } catch (error) {
    if (options.suppressErrors !== false) {
      console.error("Ditto Fetch Error in GET:", error);
      return [];
    }

    throw error;
  }
};

export const getSiteImageEntries = async (
  thingOrSiteId: string,
  options: { suppressErrors?: boolean } = {},
): Promise<SiteImageEntry[]> =>
  getStoredSiteImageEntries(thingOrSiteId, options);

const saveNewSiteImageEntry = async (
  siteId: string,
  entry: StoredSiteImageEntry,
) => {
  const response = await dittoApi.put(siteImageEntryPath(siteId, entry.id), {
    url: entry.url,
    ts: entry.ts,
    default: entry.default,
  });
  return response.data;
};

const saveLegacyImageEntries = async (
  siteId: string,
  images: StoredSiteImageEntry[],
) => {
  const response = await dittoApi.put(
    legacyImagesPath(siteId),
    images.map(({ url, ts, default: isDefault }) => ({
      url,
      ts,
      default: isDefault,
    })),
  );
  return response.data;
};

const deleteStoredSiteImageEntry = async (
  siteId: string,
  entry: StoredSiteImageEntry,
) => {
  if (entry.source === "siteImages") {
    await dittoApi.delete(siteImageEntryPath(siteId, entry.id));
  }
};

export const saveSiteImageEntries = async (
  thingOrSiteId: string,
  images: SiteImageEntry[],
) => {
  const siteId = toSiteId(thingOrSiteId);
  const existingImages = await getStoredSiteImageEntries(siteId, {
    suppressErrors: false,
  });

  await Promise.all(
    existingImages
      .filter((entry) => entry.source === "siteImages")
      .map((entry) => deleteStoredSiteImageEntry(siteId, entry)),
  );

  const newEntries = images.map((img) => ({
    ...img,
    id: createImageId(),
    source: "siteImages" as const,
  }));

  await Promise.all(newEntries.map((entry) => saveNewSiteImageEntry(siteId, entry)));
};

export const getMappedSiteImages = async (
  thingId: string,
): Promise<MappedSiteImage[]> => {
  const images = await getStoredSiteImageEntries(thingId);

  return images.map((img, idx) => ({
    id: idx,
    label: `Photo ${idx + 1}`,
    url: img.url,
    default: img.default === true,
  }));
};

export const uploadSiteImages = async (siteId: string, files: File[]) => {
  const existingImages = await getStoredSiteImageEntries(siteId, {
    suppressErrors: false,
  });
  const newEntries = await Promise.all(
    files.map(async (file, idx) => ({
      id: createImageId(),
      source: "siteImages" as const,
      url: await fileToDataUrl(file),
      ts: Date.now() + idx,
      default: false,
    })),
  );

  const nextImages = [...existingImages, ...newEntries].sort(
    (a, b) => a.ts - b.ts,
  );
  const removedImages =
    nextImages.length > MAX_SITE_IMAGES
      ? nextImages.splice(0, nextImages.length - MAX_SITE_IMAGES)
      : [];

  await Promise.all(
    newEntries.map((entry) => saveNewSiteImageEntry(siteId, entry)),
  );
  await Promise.all(
    removedImages.map((entry) => deleteStoredSiteImageEntry(siteId, entry)),
  );

  return {
    success: true,
    urls: newEntries.map((entry) => entry.url),
  };
};

export const setDefaultSiteImage = async (
  thingId: string,
  imageUrl: string,
) => {
  const siteId = toSiteId(thingId);
  const images = await getStoredSiteImageEntries(siteId, {
    suppressErrors: false,
  });

  if (images.length === 0) {
    throw new Error("No images found to update");
  }

  const imageToDefault = images.find((img) => img.url === imageUrl);

  if (!imageToDefault) {
    throw new Error("Image reference not found in database");
  }

  await Promise.all(
    images.map((img) => {
      const nextImage = {
        ...img,
        default: img.url === imageUrl,
      };

      if (img.source === "siteImages") {
        return saveNewSiteImageEntry(siteId, nextImage);
      }

      return Promise.resolve();
    }),
  );

  const legacyImages = images
    .map((img) => ({
      ...img,
      default: img.url === imageUrl,
    }))
    .filter((img) => img.source === "legacy");

  if (legacyImages.length) {
    await saveLegacyImageEntries(siteId, legacyImages);
  }

  return { success: true };
};

export const deleteSiteImage = async (thingId: string, imageUrl: string) => {
  const siteId = toSiteId(thingId);
  const images = await getStoredSiteImageEntries(siteId, {
    suppressErrors: false,
  });

  if (images.length === 0) {
    throw new Error("No images found for this site");
  }

  const imageToDelete = images.find((img) => img.url === imageUrl);

  if (!imageToDelete) {
    throw new Error("Image reference not found in database");
  }

  if (imageToDelete.source === "siteImages") {
    await deleteStoredSiteImageEntry(siteId, imageToDelete);
  } else {
    await saveLegacyImageEntries(
      siteId,
      images.filter((img) => img.source === "legacy" && img.url !== imageUrl),
    );
  }

  return { success: true };
};
