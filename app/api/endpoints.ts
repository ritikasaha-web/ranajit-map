import api from "./client";

export const getTwins = async () => {
  const response = await api.get("/search/things?option=size(50)");

  return response.data.items;
};

export const getTwinById = async (id: string) => {
  const response = await api.get(`/things/${id}`);
  return response.data;
};
