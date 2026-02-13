"use client";

import { useTower } from "@/app/hooks/getTowers";
import { applyFormatting } from "@/app/constants/component_names";
import { useTowerStore } from "@/app/store/useTowerStore";

const Attributes = () => {
  const towerId = useTowerStore((s) => s.selectedTowerId);

  const { data: selectedTower, isLoading } = useTower(towerId ?? undefined);

  const attributes = selectedTower?.attributes ?? null;

  return (
    <div className="w-1/2 h-80 overflow-auto border-r-4 border-primary p-6 pt-8 bg-white shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Attributes</h2>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : !attributes ? (
        <p className="text-gray-500">No attributes available</p>
      ) : (
        <div className="divide-y divide-gray-200">
          {Object.entries(attributes).map(([key, value]) => (
            <div
              key={key}
              className="flex justify-between items-center py-3 text-gray-700"
            >
              <span className="font-medium capitalize">
                {applyFormatting(key)}
              </span>

              <span className="text-gray-900 text-right max-w-[60%] break-words">
                {typeof value === "object"
                  ? applyFormatting(JSON.stringify(value))
                  : applyFormatting(value?.toString() ?? "")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Attributes;
