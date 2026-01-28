export const fourPoledComponentSet: Set<string> = new Set([
  "antenna",
  "backup_supply",
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
]);

export const monopoleComponentSet: Set<string> = new Set([
  "antenna",
  "antenna_mounting_frames",
  "backup_supply",
  "beacon",
  "cable",
  "down_conductor",
  "equipment_shelter",
  "fuel_tank",
  "lightning_rod",
  "microwave",
  "monopole",
  "power_cabinate",
  "rf_jumpers",
  "rru",
]);
export const tripoleComponentSet: Set<string> = new Set([
  "antenna_mounting_frames",
  "cable",
  "antenna",
  "backup_supply",
  "beacon",
  "down_conductor",
  "equipment_shelter",
  "fuel_tank",
  "ladder",
  "lightning_rod",
  "microwave",
  "power_cabinate",
  "rf_jumpers",
  "rrh",
  "waveguides",
]);
export const guyedMastComponentSet: Set<string> = new Set([
  "cable",
  "antenna",
  "backup_supply",
  "beacon",
  "equipment_shelter",
  "fuel_tank",
  "ladder",
  "lightning_rod",
  "microwave",
  "power_cabinate",
  "rrh",
  "tma",
]);

export function formatLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export const upperCaseSet: Set<string> = new Set([
  "model",
  "installation_type",
]);
export const lowerCaseSet: Set<string> = new Set([]);
