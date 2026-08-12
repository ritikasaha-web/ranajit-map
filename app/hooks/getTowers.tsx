import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSiteAlarms,
  getTwinById,
  getTwins,
  TwinItem,
} from "../digitalTwin/endpoints";

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
      await getTwins((items) => {
        allItems.push(...items);

        queryClient.setQueryData<TwinItem[]>(["towers"], (old = []) => {
          const existingIds = new Set(old.map((t) => t.thingId));
          const filtered = items.filter((t) => !existingIds.has(t.thingId));
          return [...old, ...filtered];
        });
      });

      return allItems;
    },
  });
};

// app/hooks/getTowers.ts (or wherever useTower lives)

export const useTower = (id?: string | null) => {
  const queryClient = useQueryClient();

  return useQuery<any, Error>({
    queryKey: id ? TOWER_KEYS.detail(id) : [],
    queryFn: () => getTwinById(id as string),
    enabled: !!id,

    // USE THIS INSTEAD OF initialData
    placeholderData: () => {
      const towers = queryClient.getQueryData<any[]>(TOWER_KEYS.all);
      return towers?.find((t) => t.thingId === id);
    },
  });
};

export const useSiteAlarms = (id?: string | null) =>
  useQuery({
    queryKey: id ? ["site-alarms", id] : [],
    queryFn: () => getSiteAlarms(id as string),
    enabled: !!id,
  });
