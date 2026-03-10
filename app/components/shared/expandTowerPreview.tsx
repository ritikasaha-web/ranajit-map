import React, { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { LuEye } from "react-icons/lu";
import {
  fourPoledComponentSet,
  guyedMastComponentSet,
  tripoleComponentSet,
  monopoleComponentSet,
  baseTypes,
  applyFormatting,
} from "@/app/constants/component_names";
import { useTower } from "@/app/hooks/getTowers";
import { useTowerStore, useExpandTowerStore } from "@/app/store/useTowerStore";

const componentSetMap: Record<string, Set<string>> = {
  monopole: monopoleComponentSet,
  tripole: tripoleComponentSet,
  four_pole: fourPoledComponentSet,
  guyed_mast: guyedMastComponentSet,
};

const ExpandTowerPreview = () => {
  const { data: currTower } = useTower(useTowerStore((s) => s.selectedTowerId));
  const towerItems = currTower?.features?.components?.properties || {};
  const downtime = currTower?.attributes?.down_time ?? 0;
  const uptime = currTower?.attributes?.uptime ?? 0;

  let downtimeLabel = "OK";
  let downtimeColor = "text-green-600 bg-green-50 border-green-200";

  if (downtime > 20) {
    downtimeLabel = "Severe";
    downtimeColor = "text-red-600 bg-red-50 border-red-200";
  } else if (downtime > 0) {
    downtimeLabel = "Down";
    downtimeColor = "text-orange-600 bg-orange-50 border-orange-200";
  }

  const orderedTowerItems = Object.fromEntries(
    [
      ...(componentSetMap[currTower?.attributes?.structure_type] ??
        monopoleComponentSet),
    ].map((key) => [key, towerItems[key]]),
  );

  const [activeComponents, setActiveComponents] = useState<Set<string>>(
    new Set(),
  );
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

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
  const setExpandState = useExpandTowerStore(
    (state) => state.setOpenExpandTower,
  );
  const formatDuration = (minutes: number): string => {
    const totalSeconds = minutes * 60;
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <button
        onClick={() => setExpandState(false)}
        className="absolute top-5 right-5 rounded-full p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition"
      >
        <RxCross2 size={22} />
      </button>
      <div className="relative flex h-[85vh] w-[85vw] rounded-3xl bg-white shadow-2xl p-6 gap-6">
        {/* Close */}

        {/* LEFT : Tower Visual */}
        <div
          className="relative w-full h-[470px] bg-white rounded-xl overflow-hidden border border-slate-300"
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            setOrigin({ x, y });
          }}
        >
          <div
            className="absolute inset-0 transition-transform duration-200 ease-out"
            style={{
              transform: zoom ? "scale(1.8)" : "scale(1)",
              transformOrigin: `${origin.x}% ${origin.y}%`,
            }}
          >
            {/* Base */}
            <img
              src={`/${baseTypes[currTower?.attributes?.installation_type]}.webp`}
              alt="Installation"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />

            {/* Structure */}
            <img
              src={`/${currTower?.attributes?.structure_type}/${currTower?.attributes?.structure_type}.webp`}
              alt="Structure"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />

            {/* Components */}
            {Object.keys(orderedTowerItems)
              .filter((item) => shouldRenderComponent(item))
              .map((item) => (
                // console.log(item),
                <img
                  key={item}
                  src={`/${currTower?.attributes?.structure_type}/${
                    item === "cable" ? `${item}_${towerItems[item]}` : item
                  }.webp`}
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
            <h1 className="text-xl font-semibold text-slate-800">
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

            {/* Tower Status */}
            <div
              className={`mt-3 flex items-center justify-between rounded-md border px-3 py-1.5 text-xs ${downtimeColor}`}
            >
              <span className="font-medium text-slate-700">Tower Status</span>
              <div className="flex items-center gap-3">
                <span className="font-semibold">
                  ↑ {formatDuration(uptime)}
                </span>
                <span className="text-slate-400">|</span>
                <span className="font-semibold">
                  ↓ {downtime === 0 ? "No Downtime" : formatDuration(downtime)}
                </span>
                <span className="font-semibold">— {downtimeLabel}</span>
              </div>
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
                  {/* {key.replace(/_/g, " ")} */}
                  {applyFormatting(key)}
                </span>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-600">
                    {applyFormatting(String(value))}
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
