import React, { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { LuEye } from "react-icons/lu";
import {
  fourPoledComponentSet,
  guyedMastComponentSet,
  tripoleComponentSet,
  monopoleComponentSet,
  formatLabel,
} from "@/app/constants/component_names";

const componentSetMap: Record<string, Set<string>> = {
  monopole: monopoleComponentSet,
  tripole: tripoleComponentSet,
  four_pole: fourPoledComponentSet,
  guyed_mast: guyedMastComponentSet,
};

const ExpandTowerPreview = ({
  onClose,
  currTower,
}: {
  onClose: () => void;
  currTower: any;
}) => {
  const towerItems = currTower?.features?.components?.properties || {};

  const orderedTowerItems = Object.fromEntries(
    [
      ...(componentSetMap[currTower?.attributes?.structure_type] ??
        monopoleComponentSet),
    ].map((key) => [key, towerItems[key]]),
  );

  const [activeComponents, setActiveComponents] = useState<Set<string>>(
    new Set(),
  );

  const toggleComponent = (component: string) => {
    setActiveComponents((prev) => {
      const next = new Set(prev);
      next.has(component) ? next.delete(component) : next.add(component);
      return next;
    });
  };

  const shouldRenderComponent = (component: string) => {
    const value = towerItems[component];

    if (value === undefined || value === null) return false;
    if (typeof value === "number" && value <= 0) return false;
    if (typeof value === "string" && value.trim() === "") return false;

    if (activeComponents.size === 0) return true;
    return activeComponents.has(component);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative flex h-[85vh] w-[85vw] rounded-3xl bg-white shadow-2xl p-6 gap-6">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition"
        >
          <RxCross2 size={22} />
        </button>

        {/* LEFT : Tower Visual */}
        <div className="w-1/2 rounded-2xl bg-white border border-slate-200 p-4 flex items-center justify-center">
          <div className="relative w-full h-[520px] bg-white rounded-xl overflow-hidden">
            <img
              src={`/${currTower?.attributes?.installation_type}.png`}
              alt="Installation"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />

            <img
              src={`/${currTower?.attributes?.structure_type}/${currTower?.attributes?.structure_type}.png`}
              alt="Structure"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />

            {Object.keys(orderedTowerItems)
              .filter((item) => shouldRenderComponent(item))
              .map((item) => (
                <img
                  key={item}
                  src={`/${currTower?.attributes?.structure_type}/${
                    item === "cable" ? `${item}_${towerItems[item]}` : item
                  }.png`}
                  alt={item}
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />
              ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-px bg-slate-200 rounded-full" />

        {/* RIGHT : Details */}
        <div className="w-1/2 flex flex-col">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              {currTower?.thingId}
            </h1>

            <div className="mt-2 flex items-center gap-3 text-slate-600">
              <span className="text-sm font-medium">
                {currTower?.attributes?.structure_type === "monopole" &&
                currTower?.attributes?.installation_type === "GBT"
                  ? "GBM"
                  : currTower?.attributes?.installation_type}
              </span>

              <span className="h-4 w-px bg-slate-300" />

              <span className="text-sm font-medium capitalize">
                {currTower?.attributes?.structure_type
                  ?.replace(/_/g, " ")
                  .toLowerCase()
                  .replace(/\b\w/g, (c: string) => c.toUpperCase())}
              </span>
            </div>
          </div>

          {/* Components list */}
          <div className="mt-6 flex-1 overflow-y-auto pr-2 space-y-2">
            {Object.entries(towerItems).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50 transition"
              >
                <span className="text-sm font-medium text-slate-700 capitalize">
                  {key.replace(/_/g, " ")}
                </span>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-600">
                    {formatLabel(String(value))}
                  </span>

                  <button
                    onClick={() => toggleComponent(key)}
                    className={`transition-colors ${
                      activeComponents.has(key)
                        ? "text-sky-600"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <LuEye size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpandTowerPreview;
