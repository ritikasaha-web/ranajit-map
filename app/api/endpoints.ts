import { api } from "./client";

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
      const response = await api.get(endpoint);

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
export const getTwinsWithFilter = async (
  filter: string, // e.g. "gt(attributes/uptime,0)"
  onChunkReceived: (newTowers: TwinItem[]) => void,
): Promise<TwinItem[]> => {
  const allItems: TwinItem[] = [];
  let cursor: string | null = null;
  let hasMore = true;

  const batchSize = 200;

  const fieldsFilter =
    "fields=thingId,attributes/height_m,attributes/down_time,attributes/uptime,attributes/location/lat,attributes/location/lng";

  while (hasMore) {
    const cursorParam = cursor ? `,cursor(${cursor})` : "";
    const filterParam = filter ? `&filter=${encodeURIComponent(filter)}` : "";

    const endpoint = `search/things?${fieldsFilter}${filterParam}&option=size(${batchSize})${cursorParam}`;

    try {
      const response = await api.get(endpoint);
      const responseData = response.data as PaginatedResponse;

      const items = responseData.items;
      const nextCursor = responseData.cursor;

      if (items?.length) {
        allItems.push(...items);
        onChunkReceived(items);
      }

      cursor = nextCursor ?? null;
      hasMore = !!nextCursor;
    } catch (err) {
      console.error("Error fetching twins with filter:", err);
      break;
    }
  }

  return allItems;
};

const EXCLUDED_KEYS = ["images"];

export const getTwinById = async (id: string) => {
  const response = await api.get(`/things/${id}`);
  const data = response.data;

  if (data.attributes) {
    data.attributes = Object.fromEntries(
      Object.entries(data.attributes).filter(
        ([key]) => !EXCLUDED_KEYS.includes(key),
      ),
    );
  }

  return data;
};
export const getMappedSiteImages = async (thingId: string) => {
  const siteId = thingId.includes(":") ? thingId.split(":")[1] : thingId;

  const res = await fetch(`/api/get_images_names?siteId=${siteId}`);
  if (!res.ok) return [];

  const data = await res.json();

  // Map over the new 'images' array that contains the objects
  if (data.images && data.images.length > 0) {
    return data.images.map((img: any, idx: number) => ({
      id: idx,
      label: `Photo ${idx + 1}`,
      url: img.url,
      default: img.default, // ✅ This is the magic link!
    }));
  }

  // Fallback just in case
  return [];
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

// Add this to your endpoints.ts file
export const setDefaultSiteImage = async (
  thingId: string,
  imageUrl: string,
) => {
  // Strip the namespace just in case the full "in.codez.telecom:123" is passed
  const siteId = thingId.includes(":") ? thingId.split(":")[1] : thingId;

  const res = await fetch("/api/set_default_image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ siteId, imageUrl }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to set default image");
  }

  return res.json();
};

export const deleteSiteImage = async (thingId: string, imageUrl: string) => {
  // Strip the namespace just in case the full "in.codez.telecom:123" is passed
  const siteId = thingId.includes(":") ? thingId.split(":")[1] : thingId;

  const res = await fetch("/api/delete_site_image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ siteId, imageUrl }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to delete image");
  }

  return res.json();
};
export const updateThingAttributes = async (
  thingId: string,
  attributes: Record<string, any>,
) => {
  const response = await api.patch(
    `/things/${thingId}/attributes`,
    attributes,
    {
      headers: {
        "Content-Type": "application/merge-patch+json",
      },
    },
  );
  return response.data;
};
export const updateThingFeatures = async (
  thingId: string,
  features: Record<string, any>,
) => {
  const response = await api.patch(`/things/${thingId}/features`, features, {
    headers: {
      "Content-Type": "application/merge-patch+json",
    },
  });
  return response.data;
};
