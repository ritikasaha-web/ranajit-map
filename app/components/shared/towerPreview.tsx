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
import {
  useExpandTowerStore,
  useSitePhotosStore,
} from "@/app/store/useTowerStore";
import { GrGallery } from "react-icons/gr";

interface TowerPreviewProps {
  structureType: string;
  installationType: string;
  components: Record<string, any>;
  uptime: number;
  down_time: number;
}

const TowerPreview = ({
  components,
  structureType,
  installationType,
  down_time,
  uptime,
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
  const setSitePhotosOpen = useSitePhotosStore((s) => s.setSitePhotosOpen);

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
  const formatDuration = (minutes: number): string => {
    const totalSeconds = minutes * 60;
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="w-full h-full bg-white rounded-lg p-2 flex flex-col gap-3">
      {/* img Section */}
      <div className="relative w-full h-[320px] bg-white rounded-md border border-slate-300 overflow-hidden flex items-center justify-center">
        {/* Expand View */}
        <div className="group absolute top-2 right-2 z-10">
          <button
            onClick={() => setExpandState(true)}
            className="cursor-pointer rounded-full p-1.5 bg-transparent duration-200 border border-slate-300 text-slate-600 hover:bg-slate-100"
          >
            <BsFullscreen size={16} />
          </button>
          <span className="pointer-events-none absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-800 text-white text-[10px] font-medium px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            Expand View
          </span>
        </div>

        {/* Site Photos */}
        <div className="group absolute top-10 right-2 z-10">
          <button
            onClick={() => setSitePhotosOpen(true)}
            className="cursor-pointer rounded-full p-1.5 bg-transparent duration-200 border border-slate-300 text-slate-600 hover:bg-slate-100"
          >
            <GrGallery size={16} />
          </button>
          <span className="pointer-events-none absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-800 text-white text-[10px] font-medium px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            Site Photos
          </span>
        </div>

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
      {/* Tower Status - fixed, does not scroll */}
      <div
        className={`px-3 py-1.5 rounded-md border flex items-center justify-between text-xs ${downtimeColor}`}
      >
        <span className="font-semibold text-slate-700">Tower Status</span>
        <div className="flex items-center gap-3">
          <span className="font-semibold">↑ {formatDuration(uptime)}</span>
          <span className="text-slate-400">|</span>
          <span className="font-semibold">
            ↓ {down_time === 0 ? "No Downtime" : formatDuration(down_time)}
          </span>
          <span className="font-semibold">— {downtimeLabel}</span>
        </div>
      </div>

      {/* Details Section */}
      <div className="flex-1 overflow-y-auto text-xs">
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
