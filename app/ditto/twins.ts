import { dittoApi } from "./client";

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

export type ThingDocument = Record<string, unknown> & {
  thingId?: string;
};

const EXCLUDED_KEYS = ["images"];

const TOWER_FIELDS =
  "fields=thingId,attributes/height_m,attributes/down_time,attributes/uptime,attributes/location/lat,attributes/location/lng";

export const getTwins = async (
  onChunkReceived: (newTowers: TwinItem[]) => void,
): Promise<TwinItem[]> => {
  const allItems: TwinItem[] = [];
  let cursor: string | null = null;
  let hasMore = true;

  const batchSize = 200;
  const limit: number = 500; // Infinity = fetch all

  while (hasMore) {
    const remaining = Math.min(batchSize, limit - allItems.length);
    if (remaining <= 0) break;

    const fetchSize = Math.min(batchSize, remaining);
    const cursorParam = cursor ? `,cursor(${cursor})` : "";
    const endpoint = `search/things?${TOWER_FIELDS}&option=size(${fetchSize})${cursorParam}`;

    try {
      const response = await dittoApi.get(endpoint);
      const responseData = response.data as PaginatedResponse;

      const items = responseData.items;
      const nextCursor = responseData.cursor;

      if (items?.length) {
        allItems.push(...items);
        onChunkReceived(items);
      }

      cursor = nextCursor ?? null;
      hasMore = !!nextCursor;
    } catch (error) {
      console.error("Error fetching twins:", error);
      break;
    }
  }

  return allItems;
};

export const getTwinsWithFilter = async (
  filter: string,
  onChunkReceived: (newTowers: TwinItem[]) => void,
): Promise<TwinItem[]> => {
  const allItems: TwinItem[] = [];
  let cursor: string | null = null;
  let hasMore = true;

  const batchSize = 200;

  while (hasMore) {
    const cursorParam = cursor ? `,cursor(${cursor})` : "";
    const filterParam = filter ? `&filter=${encodeURIComponent(filter)}` : "";
    const endpoint = `search/things?${TOWER_FIELDS}${filterParam}&option=size(${batchSize})${cursorParam}`;

    try {
      const response = await dittoApi.get(endpoint);
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

export const getTwinById = async (id: string) => {
  const response = await dittoApi.get(`things/${id}`);
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

export const listThings = async (): Promise<ThingDocument[]> => {
  const response = await dittoApi.get<ThingDocument | ThingDocument[]>(
    "things",
  );
  const data = response.data;

  return Array.isArray(data) ? data : [data];
};

export const updateThingAttributes = async (
  thingId: string,
  attributes: Record<string, unknown>,
) => {
  const response = await dittoApi.patch(
    `things/${thingId}/attributes`,
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
  features: Record<string, unknown>,
) => {
  const response = await dittoApi.patch(
    `things/${thingId}/features`,
    features,
    {
      headers: {
        "Content-Type": "application/merge-patch+json",
      },
    },
  );
  return response.data;
};
