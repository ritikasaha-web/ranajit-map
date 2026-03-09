import React from "react";
import {
  fourPoledComponentSet,
  monopoleComponentSet,
  tripoleComponentSet,
  guyedMastComponentSet,
  baseTypes,
  formatLabel,
} from "@/app/constants/component_names";
import { BsFullscreen } from "react-icons/bs";
import { useExpandTowerStore } from "@/app/store/useTowerStore";

interface TowerPreviewProps {
  structureType: string;
  installationType: string;
  components: Record<string, any>;
  down_time: number;
}

const TowerPreview = ({
  components,
  structureType,
  installationType,
  down_time,
}: TowerPreviewProps) => {
  const installation_type = `/${baseTypes[installationType]}.webp`;
  const structure: string = `/${structureType}/${structureType}.webp`;

  const componentSetMap: Record<string, Set<string>> = {
    monopole: monopoleComponentSet,
    tripole: tripoleComponentSet,
    four_pole: fourPoledComponentSet,
    guyed_mast: guyedMastComponentSet,
  };

  const towerComponents =
    componentSetMap[structureType] ?? monopoleComponentSet;

  /* img layering (0-safe) */
  const layeredimgs: string[] = [installation_type, structure];

  [...towerComponents].forEach((key) => {
    const value = components[key];

    if (value === null || value === undefined) return;
    if (typeof value === "string" && value.trim() === "") return;
    if (typeof value === "number" && value < 0) return;

    if (key === "cable" && typeof value !== "number") {
      layeredimgs.push(`/${structureType}/cable_${value}.webp`);
    } else {
      layeredimgs.push(`/${structureType}/${key}.webp`);
    }
  });

  const setExpandState = useExpandTowerStore(
    (state) => state.setOpenExpandTower,
  );
  /* Dummy down_time value (minutes) */

  let downtimeLabel = "OK";
  let downtimeColor = "text-green-600 bg-green-50 border-green-200";

  if (down_time > 20) {
    downtimeLabel = "Severe";
    downtimeColor = "text-red-600 bg-red-50 border-red-200";
  } else if (down_time > 0) {
    downtimeLabel = "Down (Increasing)";
    downtimeColor = "text-orange-600 bg-orange-50 border-orange-200";
  }

  return (
    <div className="w-full h-full bg-white rounded-lg p-2 flex flex-col gap-3">
      {/* img Section */}
      <div className="relative w-full h-[320px] bg-white rounded-md border border-slate-300 overflow-hidden flex items-center justify-center">
        <button
          onClick={() => setExpandState(true)}
          className="absolute top-2 right-2 z-10 rounded-full p-1.5 bg-transparent duration-200 border border-slate-300 text-slate-600 hover:bg-slate-100"
        >
          <BsFullscreen size={16} />
        </button>

        {layeredimgs.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Layer ${index}`}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />
        ))}
      </div>

      {/* Details Section */}
      <div className="flex-1 overflow-y-auto text-xs">
        {/* Tower Status */}
        <div
          className={`mb-3 px-3 py-2 rounded-md border flex items-center justify-between text-xs ${downtimeColor}`}
        >
          <span className="font-semibold text-slate-700">Tower Status</span>
          <span className="font-semibold">
            {downtimeLabel} ({down_time} min)
          </span>
        </div>
        <h2 className="text-sm font-semibold text-slate-800 mb-2">
          Tower Details
        </h2>

        <div className="space-y-1">
          {[...towerComponents]
            .filter((key) => {
              const v = components[key];
              if (v === null || v === undefined) return false;
              if (typeof v === "string") return v.trim() !== "";
              if (typeof v === "number") return true;
              if (typeof v === "boolean") return true;
              return false;
            })
            .map((key) => (
              <div
                key={key}
                className="grid grid-cols-[1fr_auto] gap-2 items-center border-b border-slate-200 py-0.5"
              >
                <span className="text-slate-700 font-medium">
                  {formatLabel(key)}
                </span>

                <span className="text-slate-800 font-semibold tabular-nums">
                  {formatLabel(String(components[key]))}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TowerPreview;
