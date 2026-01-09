import api from "./client";

export const getTwins = async () => {
  const response = await api.get("/search/things?offset=0&limit=500", {
    params: { limit: 500 },
  });

  return response.data.items;
};

export const getTwinById = async (id: string) => {
  const response = await api.get(`/things/${id}`);
  return response.data;
};
