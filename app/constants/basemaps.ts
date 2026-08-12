// Basemap catalogue for the map-style switcher. All of these are free
// tile services that need no API key.

export interface Basemap {
  id: string;
  label: string;
  url: string;
  attribution: string;
  subdomains?: string;
  // CSS background for the little preview swatch in the switcher.
  preview: string;
}

export const BASEMAPS: Basemap[] = [
  {
    id: "voyager",
    label: "Default",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    subdomains: "abcd",
    attribution: "&copy; OSM &copy; CARTO",
    preview: "linear-gradient(135deg, #d5e8c5 0%, #f7f3e3 55%, #abd3df 100%)",
  },
  {
    id: "light",
    label: "Light",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    subdomains: "abcd",
    attribution: "&copy; OSM &copy; CARTO",
    preview: "linear-gradient(135deg, #f5f5f3 0%, #e8e8e6 60%, #d4dadc 100%)",
  },
  {
    id: "dark",
    label: "Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    subdomains: "abcd",
    attribution: "&copy; OSM &copy; CARTO",
    preview: "linear-gradient(135deg, #1f2933 0%, #2c3540 60%, #38424d 100%)",
  },
  {
    id: "satellite",
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics",
    preview: "linear-gradient(135deg, #3d5a3a 0%, #6b7d4f 50%, #2e4a63 100%)",
  },
  {
    id: "osm",
    label: "Streets",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    subdomains: "abc",
    attribution: "&copy; OpenStreetMap contributors",
    preview: "linear-gradient(135deg, #aad3df 0%, #f2efe9 50%, #fbe8a8 100%)",
  },
];

export const DEFAULT_BASEMAP_ID = "voyager";
export const BASEMAP_STORAGE_KEY = "map_basemap";

export const getBasemap = (id: string | null | undefined): Basemap =>
  BASEMAPS.find((b) => b.id === id) ?? BASEMAPS[0];
