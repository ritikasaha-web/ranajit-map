import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getTwinById,
  getTwins,
  PaginatedResponse,
  TwinItem,
} from "../api/endpoints";

const TOWER_KEYS = {
  all: ["towers"] as const,
  detail: (id: string) => ["towers", id] as const,
};

export const useTowers = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: TOWER_KEYS.all,
    queryFn: async () => {
      const allItems: TwinItem[] = [];
      let cursor: string | null = null;
      let hasMore = true;

      const batchSize = 200;
      const fieldsFilter =
        "fields=thingId,attributes/height_m,attributes/down_time,attributes/uptime,attributes/location/lat,attributes/location/lng";

      const BASE_URL = "http://localhost:8080/api/2/";

      while (hasMore) {
        const cursorParam = cursor ? `,cursor(${cursor})` : "";
        const endpoint = `search/things?${fieldsFilter}&option=size(${batchSize})${cursorParam}`;

        const response = await fetch(BASE_URL + endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Basic ZGl0dG86ZGl0dG8=",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch twins");
        }

        const responseData: PaginatedResponse = await response.json();

        const items = responseData.items;
        const nextCursor = responseData.cursor;

        if (items && items.length > 0) {
          allItems.push(...items);

          queryClient.setQueryData<TwinItem[]>(["towers"], (old = []) => {
            const existingIds = new Set(old.map((t) => t.thingId));
            const filtered = items.filter((t) => !existingIds.has(t.thingId));
            return [...old, ...filtered];
          });
        }

        if (nextCursor) {
          cursor = nextCursor;
        } else {
          hasMore = false;
        }
      }

      return allItems;
    },
  });
};

export const useTower = (id?: string | null) => {
  const queryClient = useQueryClient();

  return useQuery<any, Error>({
    queryKey: id ? TOWER_KEYS.detail(id) : [],
    queryFn: () => getTwinById(id as string),
    enabled: !!id,

    // reuse data from tower list if already cached
    initialData: () => {
      const towers = queryClient.getQueryData<any[]>(TOWER_KEYS.all);
      return towers?.find((t) => t.id === id);
    },
  });
};
