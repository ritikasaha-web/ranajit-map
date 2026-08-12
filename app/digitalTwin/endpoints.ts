import { digitalTwinApi } from "./client";
import type { TwinItem } from "../ditto/twins";

export type { TwinItem };

interface SitesResponse {
  items: TwinItem[];
  cursor: string | null;
}

export const getTwins = async (
  onChunkReceived: (newTowers: TwinItem[]) => void,
): Promise<TwinItem[]> => {
  const response = await digitalTwinApi.get<SitesResponse>("/sites");
  const items = response.data.items ?? [];
  if (items.length) onChunkReceived(items);
  return items;
};

export const getTwinById = async (id: string) => {
  const siteId = id.includes(":") ? id.split(":").pop()! : id;
  const response = await digitalTwinApi.get(`/sites/${siteId}`);
  return response.data;
};

export interface SiteAlarm {
  site_id: string;
  alarm_id: number;
  alarm_name: string;
  severity: string;
  generated_at: string | null;
  last_synced_at: string | null;
}

export const getSiteAlarms = async (id: string): Promise<SiteAlarm[]> => {
  const siteId = id.includes(":") ? id.split(":").pop()! : id;
  const response = await digitalTwinApi.get<{ items: SiteAlarm[] }>(
    `/sites/${siteId}/alarms`,
  );
  return response.data.items ?? [];
};
