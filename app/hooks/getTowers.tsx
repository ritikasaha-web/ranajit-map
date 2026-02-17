import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTwinById, getTwins } from "../api/endpoints";

const TOWER_KEYS = {
  all: ["towers"] as const,
  detail: (id: string) => ["towers", id] as const,
};

export const useTowers = () =>
  useQuery({
    queryKey: TOWER_KEYS.all,
    queryFn: getTwins,
  });

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
