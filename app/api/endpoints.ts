import api from "./client";

export const getTwins = async () => {
  const response = await api.get("/");
  return response.data;
};

export const getTwinById = async (id: string) => {
  const response = await api.get(`/${id}`);
  return response.data;
};
