import React, { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { LuEye, LuEyeOff } from "react-icons/lu";
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

const formatDuration = (minutes: number): string => {
  const totalSeconds = minutes * 60;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const ExpandTowerPreview = () => {
  const { data: currTower } = useTower(useTowerStore((s) => s.selectedTowerId));
  const towerItems = currTower?.features?.components?.properties || {};
  const downtime = currTower?.attributes?.down_time ?? 0;
  const uptime = currTower?.attributes?.uptime ?? 0;

  const isOnline = downtime === 0;
  const isSevere = downtime > 20;

  const statusLabel = isOnline ? "OK" : isSevere ? "Severe" : "Down";
  const statusDot = isOnline
    ? "bg-green-400"
    : isSevere
      ? "bg-red-400"
      : "bg-orange-400";
  const statusText = isOnline
    ? "text-green-600"
    : isSevere
      ? "text-red-600"
      : "text-orange-600";
  const statusBg = isOnline
    ? "bg-green-50 border-green-200"
    : isSevere
      ? "bg-red-50 border-red-200"
      : "bg-orange-50 border-orange-200";

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

  const installationType =
    currTower?.attributes?.structure_type === "monopole" &&
    currTower?.attributes?.installation_type === "GBT"
      ? "GBM"
      : currTower?.attributes?.installation_type;

  const structureType = currTower?.attributes?.structure_type
    ?.replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c: string) => c.toUpperCase());

  const activeCount = activeComponents.size;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative flex h-[88vh] w-[88vw] max-w-6xl rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* Blue top accent bar */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-sky-500 to-blue-400 z-10" />

        {/* Close button */}
        <button
          onClick={() => setExpandState(false)}
          className="absolute top-4 right-4 z-20 rounded-full p-2 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition"
        >
          <RxCross2 size={18} />
        </button>

        {/* ── LEFT: Tower Visual ── */}
        <div className="flex flex-col w-[55%] p-6 pt-8 border-r border-slate-100">
          {/* Visual container */}
          <div
            className="relative flex-1 rounded-2xl overflow-hidden border border-slate-200 bg-white cursor-crosshair"
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setOrigin({
                x: ((e.clientX - rect.left) / rect.width) * 100,
                y: ((e.clientY - rect.top) / rect.height) * 100,
              });
            }}
          >
            {/* Zoom hint */}
            <div className="absolute top-3 left-3 z-10 bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-500 text-[10px] font-medium px-2.5 py-1 rounded-full shadow-sm">
              Hover to zoom
            </div>

            {/* Active filter badge */}
            {activeCount > 0 && (
              <div className="absolute top-3 right-3 z-10 bg-sky-500 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                {activeCount} filtered
              </div>
            )}

            <div
              className="absolute inset-0 transition-transform duration-200 ease-out"
              style={{
                transform: zoom ? "scale(1.8)" : "scale(1)",
                transformOrigin: `${origin.x}% ${origin.y}%`,
              }}
            >
              <img
                src={`/${baseTypes[currTower?.attributes?.installation_type]}.webp`}
                alt="Installation"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />
              <img
                src={`/${currTower?.attributes?.structure_type}/${currTower?.attributes?.structure_type}.webp`}
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
                    }.webp`}
                    alt={item}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  />
                ))}
            </div>
          </div>

          {/* Status bar below image */}
          <div
            className={`mt-3 flex items-center justify-between rounded-xl border px-4 py-2 text-xs ${statusBg}`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${statusDot}`} />
              <span className={`font-bold ${statusText}`}>{statusLabel}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <span>
                ↑{" "}
                <span className="font-semibold text-green-600">
                  {formatDuration(uptime)}
                </span>
              </span>
              <span className="text-slate-300">|</span>
              <span>
                ↓{" "}
                <span
                  className={`font-semibold ${isOnline ? "text-slate-400" : statusText}`}
                >
                  {isOnline ? "No Downtime" : formatDuration(downtime)}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Details ── */}
        <div className="flex flex-col w-[45%] pt-8 pb-6 px-6">
          {/* Header */}
          <div className="mb-5 pr-8">
            <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-1">
              Tower ID
            </p>
            <h1 className="text-lg font-bold text-slate-800 leading-snug break-all">
              {currTower?.thingId}
            </h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {installationType && (
                <span className="text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 rounded-full">
                  {installationType}
                </span>
              )}
              {structureType && (
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full">
                  {structureType}
                </span>
              )}
              {currTower?.attributes?.height_m && (
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full">
                  {currTower.attributes.height_m}m
                </span>
              )}
            </div>
          </div>

          {/* Section label */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">
              Components
            </p>
            {activeCount > 0 && (
              <button
                onClick={() => setActiveComponents(new Set())}
                className="text-[10px] text-sky-500 hover:text-sky-700 font-medium transition"
              >
                Reset filter
              </button>
            )}
          </div>

          {/* Components list */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {Object.entries(towerItems).map(([key, value]) => {
              const isActive = activeComponents.has(key);
              const isFiltering = activeComponents.size > 0;

              return (
                <div
                  key={key}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 transition-all ${
                    isActive
                      ? "border-sky-300 bg-sky-50"
                      : isFiltering
                        ? "border-slate-100 bg-slate-50/50 opacity-50"
                        : "border-slate-200 hover:border-sky-200 hover:bg-sky-50/40"
                  }`}
                >
                  <span className="text-sm font-medium text-slate-700">
                    {applyFormatting(key)}
                  </span>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-semibold ${isActive ? "text-sky-700" : "text-slate-600"}`}
                    >
                      {applyFormatting(String(value))}
                    </span>
                    <button
                      onClick={() => toggleComponent(key)}
                      className={`transition-colors p-0.5 rounded ${
                        isActive
                          ? "text-sky-500"
                          : "text-slate-300 hover:text-slate-500"
                      }`}
                    >
                      {isActive ? <LuEye size={15} /> : <LuEyeOff size={15} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpandTowerPreview;
