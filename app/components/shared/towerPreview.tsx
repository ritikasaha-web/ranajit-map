import React from "react";
import {
  fourPoledComponentSet,
  monopoleComponentSet,
  tripoleComponentSet,
  guyedMastComponentSet,
  formatLabel,
} from "@/app/constants/component_names";
import { BsFullscreen } from "react-icons/bs";

interface TowerPreviewProps {
  structureType: string;
  installationType: string;
  components: Record<string, any>;
  setOpenExpandTower: React.Dispatch<React.SetStateAction<boolean>>;
}

const TowerPreview = ({
  components,
  structureType,
  installationType,
  setOpenExpandTower,
}: TowerPreviewProps) => {
  const base = `/${installationType}.png`;
  const structure = `/${structureType}/${structureType}.png`;

  const componentSetMap: Record<string, Set<string>> = {
    monopole: monopoleComponentSet,
    tripole: tripoleComponentSet,
    four_pole: fourPoledComponentSet,
    guyed_mast: guyedMastComponentSet,
  };

  const towerComponents =
    componentSetMap[structureType] ?? monopoleComponentSet;

  /* Image layering (0-safe) */
  const layeredImages: string[] = [base, structure];

  [...towerComponents].forEach((key) => {
    const value = components[key];

    if (value === null || value === undefined) return;
    if (typeof value === "string" && value.trim() === "") return;
    if (typeof value === "number" && value < 0) return;

    if (key === "cable" && typeof value !== "number") {
      layeredImages.push(`/${structureType}/cable_${value}.png`);
    } else {
      layeredImages.push(`/${structureType}/${key}.png`);
    }
  });

  return (
    <div className="w-full h-full bg-white rounded-lg p-2 flex flex-col gap-3">
      {/* Image Section */}
      <div className="relative w-full h-[320px] bg-white rounded-md border border-slate-300 overflow-hidden flex items-center justify-center">
        <button
          onClick={() => setOpenExpandTower(true)}
          className="absolute top-2 right-2 z-10 rounded-full p-1.5 bg-transparent duration-200 border border-slate-300 text-slate-600 hover:bg-slate-100"
        >
          <BsFullscreen size={16} />
        </button>

        {layeredImages.map((src, index) => (
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
