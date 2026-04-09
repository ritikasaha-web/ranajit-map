import { api_backend, api_for_images } from "./client";

type Photo = {
  id: number;
  label: string;
  url: string;
};
const toFolder = (thingId: string) =>
  thingId.includes(":") ? thingId.split(":").pop()! : thingId;

export interface TwinItem {
  thingId: string;
  attributes: {
    height_m?: number;
    down_time?: number;
    uptime?: number;
    location?: {
      lat: number;
      lng: number;
    };
  };
}

export interface PaginatedResponse {
  items: TwinItem[];
  cursor?: string | null;
}

export const getTwins = async (
  onChunkReceived: (newTowers: TwinItem[]) => void,
): Promise<TwinItem[]> => {
  const allItems: TwinItem[] = [];
  let cursor: string | null = null;
  let hasMore: boolean = true;

  const batchSize: number = 200;
  const fieldsFilter: string =
    "fields=thingId,attributes/height_m,attributes/down_time,attributes/uptime,attributes/location/lat,attributes/location/lng";

  while (hasMore) {
    const cursorParam: string = cursor ? `,cursor(${cursor})` : "";
    const endpoint: string = `search/things?${fieldsFilter}&option=size(${batchSize})${cursorParam}`;

    try {
      // ✅ CHANGED: Removed the generic from here so it stops throwing an error
      const response = await api_backend.get(endpoint);

      // ✅ CHANGED: Added the type to the data directly
      const responseData = response.data as PaginatedResponse;

      const items: TwinItem[] = responseData.items;
      const nextCursor: string | null | undefined = responseData.cursor;

      if (items && items.length > 0) {
        allItems.push(...items);
        onChunkReceived(items);
      }

      if (nextCursor) {
        cursor = nextCursor;
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error("Error fetching twins:", error);
      break;
    }
  }

  return allItems;
};
export const getTwinById = async (id: string) => {
  const response = await api_backend.get(`/things/${id}`);
  return response.data;
};

export const getMappedSiteImages = async (
  thingId: string,
): Promise<Photo[]> => {
  const response = await api_for_images.get(
    `/get_images_names?siteId=${toFolder(thingId)}`,
  );

  const data = response.data;

  return data.urls.map((url: string, i: number) => ({
    id: i + 1,
    label: `Site Image ${i + 1}`,
    url,
  }));
};

// Ensure your fetch helper looks like this:
export const uploadSiteImages = async (siteId: string, files: File[]) => {
  const formData = new FormData();

  // 1. Append the ID exactly as "siteId"
  formData.append("siteId", siteId);

  // 2. Append ALL files under the SAME key "images"
  files.forEach((file) => {
    formData.append("images", file);
  });

  const res = await fetch("/api/upload_image", {
    method: "POST",
    body: formData, // No Content-Type header needed for FormData!
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Upload failed");
  }

  return res.json();
};
