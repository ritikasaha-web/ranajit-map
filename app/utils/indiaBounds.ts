// Geographic sanity filter for site coordinates.
//
// The citadel data contains some junk locations — "null island" (0,0),
// swapped/random lat-lngs that land in other continents or the ocean.
// This project only covers India, so anything outside a generous India
// bounding box is treated as bad data and dropped before rendering.
//
// Note this is a rectangle, not the actual country outline — it includes
// slivers of neighbouring countries and nearby sea (and deliberately
// covers the Andaman & Nicobar and Lakshadweep islands). That's fine for
// its purpose: catching obviously-wrong coordinates, not adjudicating
// borders.

export const INDIA_BOUNDS = {
  minLat: 6.0, // south of Kanyakumari / Great Nicobar
  maxLat: 37.5, // northern Ladakh
  minLng: 67.5, // west of Gujarat / Lakshadweep
  maxLng: 97.5, // eastern Arunachal Pradesh
} as const;

export const isWithinIndia = (lat: number, lng: number): boolean =>
  lat >= INDIA_BOUNDS.minLat &&
  lat <= INDIA_BOUNDS.maxLat &&
  lng >= INDIA_BOUNDS.minLng &&
  lng <= INDIA_BOUNDS.maxLng;

// Full validity check for a site location: numeric, finite, not
// null-island, and inside the India box.
export const isValidIndianSiteLocation = (
  lat: unknown,
  lng: unknown,
): boolean =>
  typeof lat === "number" &&
  typeof lng === "number" &&
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  !(Math.abs(lat) < 0.01 && Math.abs(lng) < 0.01) &&
  isWithinIndia(lat, lng);
