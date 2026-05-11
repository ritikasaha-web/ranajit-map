import { api } from "./client";

type Photo = {
  id: number;
  label: string;
  url: string;
};
const toFolder = (thingId: string) =>
  thingId.includes(":") ? thingId.split(":").pop()! : thingId;

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

export const getMappedSiteImages = async (thingId: string) => {
  const siteId = thingId.includes(":") ? thingId.split(":")[1] : thingId;

  const res = await fetch(`/api/get_images_names?siteId=${siteId}`);
  if (!res.ok) return [];

  const data = await res.json();

  // Map over the new 'images' array that contains the objects
  if (data.images && data.images.length > 0) {
    return data.images.map((img: any, idx: number) => ({
      id: idx,
      label: `Photo ${idx + 1}`,
      url: img.url,
      default: img.default, // ✅ This is the magic link!
    }));
  }

  // Fallback just in case
  return [];
};

// Ensure your fetch helper looks like this:
export const uploadSiteImages = async (siteId: string, files: File[]) => {
  const formData = new FormData();

  // 1. Append the ID exactly as "siteId"
  formData.append("siteId", siteId);

  // 2. Append ALL files under the SAME key "images"
  files.forEach((file) => {
    formData.append("images", file);
  });

  const res = await fetch("/api/upload_image", {
    method: "POST",
    body: formData, // No Content-Type header needed for FormData!
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Upload failed");
  }

  return res.json();
};

// Add this to your endpoints.ts file
export const setDefaultSiteImage = async (
  thingId: string,
  imageUrl: string,
) => {
  // Strip the namespace just in case the full "in.codez.telecom:123" is passed
  const siteId = thingId.includes(":") ? thingId.split(":")[1] : thingId;

  const res = await fetch("/api/set_default_image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ siteId, imageUrl }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to set default image");
  }

  return res.json();
};

export const deleteSiteImage = async (thingId: string, imageUrl: string) => {
  // Strip the namespace just in case the full "in.codez.telecom:123" is passed
  const siteId = thingId.includes(":") ? thingId.split(":")[1] : thingId;

  const res = await fetch("/api/delete_site_image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ siteId, imageUrl }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to delete image");
  }

  return res.json();
};
