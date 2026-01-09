import React, { useEffect, useState } from "react";
import {
  fourPoledComponentSet,
  monopoleComponentSet,
  tripoleComponentSet,
} from "@/app/constants/component_names";

interface TowerPreviewProps {
  structureType: string;
  installationType: string;
  components: Record<string, any>;
}

const TowerPreview = ({
  components,
  structureType,
  installationType,
}: TowerPreviewProps) => {
  const formatValue = (value: string) => {
    return value
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const base = `/${installationType}.png`;
  const structure = `/${structureType}/${structureType}.png`;
  const componentSetMap: Record<string, Set<string>> = {
    monopole: monopoleComponentSet,
    tripole: tripoleComponentSet,
    four_poled: fourPoledComponentSet,
  };

  const towerComponents =
    componentSetMap[structureType] ?? monopoleComponentSet;

  const layeredImages = [base, structure];
  for (let val in components) {
    if (towerComponents.has(val) && components[val] > 0) {
      layeredImages.push(`/${structureType}/${val}.png`);
    }
  }

  return (
    <div className="w-full max-w-3xl items-center bg-white rounded-xl">
      {/* Layered Tower Image */}
      <div className="relative w-[400px] h-[450px] flex-shrink-0 ">
        {layeredImages.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Layer ${index}`}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />
        ))}
      </div>

      {/* Scrollable Key–Value Data */}
      <div className="flex-1 flex flex-col gap-3 max-h-64 overflow-y-auto pr-2 text-xs">
        <h2 className="text-lg font-semibold mb-2 sticky top-0 bg-white py-2 z-10">
          Tower Details
        </h2>

        <div className="flex flex-col gap-2">
          {Object.entries(components).map(([key, value]) => (
            <div
              key={key}
              className="flex justify-between border-b pb-1 text-[11px]"
            >
              <span className="font-medium">{formatValue(String(key))}</span>
              <span className="text-gray-700">{String(value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TowerPreview;
