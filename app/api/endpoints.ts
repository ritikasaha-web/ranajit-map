import api from "./client";

export const getTwins = async () => {
  const response = await api.get(
    "search/things?option=size(191),sort(%2Battributes/created_at)",
  );

  const items = response.data.items;

  const first25 = items.slice(0, 25);
  const last25 = items.slice(-28, -3);

  return [...first25, ...last25];
  // return response.data.items;
};

export const getTwinById = async (id: string) => {
  const response = await api.get(`/things/${id}`);
  return response.data;
};
