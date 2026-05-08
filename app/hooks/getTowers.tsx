import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getTwinById,
  getTwins,
  TwinItem,
} from "../ditto/endpoints";

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

export const useTower = (id?: string | null) => {
  const queryClient = useQueryClient();

  // Existing tower detail consumers expect a loose Ditto document shape.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useQuery<any, Error>({
    queryKey: id ? TOWER_KEYS.detail(id) : [],
    queryFn: () => getTwinById(id as string),
    enabled: !!id,

    // reuse data from tower list if already cached
    initialData: () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const towers = queryClient.getQueryData<any[]>(TOWER_KEYS.all);
      return towers?.find((t) => t.id === id);
    },
  });
};
