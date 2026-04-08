import { api_backend, api_for_images } from "./client";

type Photo = {
  id: number;
  label: string;
  url: string;
};
const toFolder = (thingId: string) =>
  thingId.includes(":") ? thingId.split(":").pop()! : thingId;

export const getTwins = async () => {
  const response = await api_backend.get(
    "search/things?option=size(75)",
    // "search/things?option=size(75),sort(%2Battributes/created_at)",
  );
  return response.data.items;
};

export const getTwinById = async (id: string) => {
  const response = await api_backend.get(`/things/${id}`);
  return response.data;
};

export const getMappedSiteImages = async (
  thingId: string,
): Promise<Photo[]> => {
  const response = await api_for_images.get(
    `/get_images_names?siteId=${toFolder(thingId)}`,
  );

  const data = response.data;

  return data.urls.map((url: string, i: number) => ({
    id: i + 1,
    label: `Site Image ${i + 1}`,
    url,
  }));
};

export const uploadSiteImages = async (folder: string, files: File[]) => {
  const form = new FormData();

  form.append("siteId", toFolder(folder));
  files.forEach((file) => form.append("images", file));

  const response = await api_for_images.post("/upload_image", form);

  return response.data; // { urls: [] }
};
