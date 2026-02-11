export const fourPoledComponentSet: Set<string> = new Set([
  "antenna",
  "beacon",
  "cable",
  "equipment_shelter",
  "fuel_tank",
  "ladder",
  "lightning_rod",
  "microwave",
  "power_cabinate",
  "rrh",
  "tma",
  "waveguides",
  "diesel_generator",
  "fcu",
]);

export const monopoleComponentSet: Set<string> = new Set([
  "antenna",
  "antenna_mounting_frames",
  "beacon",
  "cable",
  "down_conductor",
  "fuel_tank",
  "lightning_rod",
  "microwave",
  "monopole",
  "power_cabinate",
  "rf_jumpers",
  "rru",
  "equipment_shelter",
  "fcu",
  "diesel_generator",
]);
export const tripoleComponentSet: Set<string> = new Set([
  "antenna_mounting_frames",
  "cable",
  "antenna",
  "beacon",
  "equipment_shelter",
  "fuel_tank",
  "ladder",
  "lightning_rod",
  "microwave",
  "power_cabinate",
  "rf_jumpers",
  "rrh",
  "waveguides",
  "diesel_generator",
  "fcu",
]);
export const guyedMastComponentSet: Set<string> = new Set([
  "cable",
  "antenna",
  "beacon",
  "down_conductor",
  "ladder",
  "equipment_shelter",
  "lightning_rod",
  "microwave",
  "power_cabinate",
  "fuel_tank",
  "rrh",
  "tma",
  "diesel_generator",
  "fcu",
]);

export const baseTypes: Record<string, string> = {
  RTT: "RTT",
  GBT: "GBT",
  GBM: "GBT",
  PYLON: "PYLON",
};

export function formatLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export const applyFormatting = (text: string) => {
  const normalized = text.toLowerCase();

  if (upperCaseSet.has(normalized)) {
    return text.toUpperCase();
  }

  return formatLabel(text);
};

export const upperCaseSet: Set<string> = new Set([
  "model",
  "installation_type",
  "spr",
  "slr",
  "fcu",
  "rrh",
  "rru",
  "smps",
  "4g-rmu",
  "amf",
  "dcem",
  "odc",
  "imps",
  "mtib",
  "shl",
  "stb",
  "tma",
  "tmib",
  "wcdma-rmu",
  "misc",
  "bk cab",
  "abb",
  "sim",
  "dcdb",
  "dgb",
  "rm",
  "ac",
  "rtu",
]);
export const lowerCaseSet: Set<string> = new Set([]);
