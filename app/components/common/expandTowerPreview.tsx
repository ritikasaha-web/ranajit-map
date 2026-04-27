"use client";
import React, {
  useRef,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { RxCross2 } from "react-icons/rx";
import { LuEye, LuEyeOff } from "react-icons/lu";
import {
  fourPoledComponentSet,
  guyedMastComponentSet,
  tripoleComponentSet,
  monopoleComponentSet,
  baseTypes,
  applyFormatting,
  ComponentLayer,
  generateTowerImage,
  prefetchLayers,
  formatDuration,
} from "@/app/constants/component_names";
import { useTower } from "@/app/hooks/getTowers";
import { useTowerStore, useExpandTowerStore } from "@/app/store/useTowerStore";
import {
  anchorMap,
  labelOverrides,
  ComponentLabels,
} from "../shared/componentLabels";

/* ── Module-level constants ─────────────────────────────────── */
const componentSetMap: Record<string, Set<string>> = {
  monopole: monopoleComponentSet,
  tripole: tripoleComponentSet,
  four_pole: fourPoledComponentSet,
  guyed_mast: guyedMastComponentSet,
};

/* ── Main Component ─────────────────────────────────────────── */
const ExpandTowerPreview = () => {
  const { data: currTower } = useTower(useTowerStore((s) => s.selectedTowerId));
  const setExpandState = useExpandTowerStore((s) => s.setOpenExpandTower);

  const towerItems = currTower?.features?.components?.properties || {};
  const downtime = currTower?.attributes?.down_time ?? 0;
  const uptime = currTower?.attributes?.uptime ?? 0;
  const rawStructureType = currTower?.attributes?.structure_type;
  const rawInstallationType = currTower?.attributes?.installation_type;

  const isOnline = downtime === 0;
  const isSevere = downtime > 20;

  const statusLabel = isOnline
    ? "Online"
    : isSevere
      ? "Down"
      : "Running at Risk";
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

  const installationType =
    rawStructureType === "monopole" && rawInstallationType === "GBT"
      ? "GBM"
      : rawInstallationType;

  const structureType = rawStructureType
    ?.replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c: string) => c.toUpperCase());

  /* ── Stable anchor map for this structure type ── */
  const anchors = useMemo(
    () => anchorMap[rawStructureType] ?? anchorMap.monopole,
    [rawStructureType],
  );

  /* ── All possible layers (base + components), regardless of filter ── */
  const allLayers = useMemo<ComponentLayer[]>(() => {
    const towerComponents =
      componentSetMap[rawStructureType] ?? monopoleComponentSet;

    const base: ComponentLayer[] = [
      {
        src: `/${baseTypes[rawInstallationType]}.webp`,
        id: "__base__",
        anchor: { x: 50, y: 50 },
      },
      {
        src: `/${rawStructureType}/${rawStructureType}.webp`,
        id: "__structure__",
        anchor: { x: 50, y: 50 },
      },
    ];

    const componentLayers: ComponentLayer[] = [];
    for (const key of towerComponents) {
      const value = towerItems[key];
      if (value === undefined || value === null) continue;
      if (typeof value === "number" && value <= 0) continue;
      if (typeof value === "string" && value.trim() === "") continue;

      componentLayers.push({
        src: `/${rawStructureType}/${key === "cable" ? `cable_${value}` : key}.webp`,
        id: key,
        anchor: anchors[key] ?? { x: 80, y: 50 },
      });
    }

    return [...base, ...componentLayers];
  }, [towerItems, rawStructureType, rawInstallationType, anchors]);

  /* ── Prefetch all layer bitmaps as soon as tower data is ready,
        so they're in cache before generateTowerImage is called ── */
  useEffect(() => {
    if (allLayers.length) prefetchLayers(allLayers);
  }, [allLayers]);

  const [activeComponents, setActiveComponents] = useState<Set<string>>(
    new Set(),
  );
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  /* ── Composited image state — one <img> instead of N layers ── */
  const [compositeImage, setCompositeImage] = useState<string | null>(null);

  const structureImgRef = useRef<HTMLImageElement>(null);

  /* ── Visible layers — filtered by activeComponents ── */
  const visibleLayers = useMemo(
    () =>
      allLayers.filter(
        (l) =>
          l.id.startsWith("__") || // always show base layers
          activeComponents.size === 0 ||
          activeComponents.has(l.id),
      ),
    [allLayers, activeComponents],
  );

  /* ── Re-composite whenever visible layers change ── */
  useEffect(() => {
    let cancelled = false;
    generateTowerImage(visibleLayers).then((img) => {
      if (!cancelled) setCompositeImage(img);
    });
    return () => {
      cancelled = true;
    };
  }, [visibleLayers]);

  /* ── Stable callbacks ── */
  const toggleComponent = useCallback((component: string) => {
    setActiveComponents((prev) => {
      const next = new Set(prev);
      next.has(component) ? next.delete(component) : next.add(component);
      return next;
    });
  }, []);

  const resetFilter = useCallback(() => setActiveComponents(new Set()), []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOrigin({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  /* ── Label entries for visible component layers only ── */
  const labelEntries = useMemo(
    () =>
      visibleLayers
        .filter((l) => !l.id.startsWith("__"))
        .map((l) => ({
          id: l.id,
          value: towerItems[l.id],
          anchor: l.anchor,
          side: ((anchors[l.id]?.x ?? 80) >= 50 ? "right" : "left") as
            | "right"
            | "left",
        })),
    [visibleLayers, towerItems, anchors],
  );

  /* ── Ordered items for the right-panel list ── */
  const orderedTowerItems = useMemo(() => {
    const componentSet =
      componentSetMap[rawStructureType] ?? monopoleComponentSet;

    return Object.fromEntries(
      [...componentSet]
        .filter((key) => {
          const value = towerItems[key];
          // Filter out null, undefined, and empty strings
          if (value === undefined || value === null) return false;
          if (typeof value === "string" && value.trim() === "") return false;
          // Filter out invalid numbers if needed (matching your layer logic)
          if (typeof value === "number" && value < 0) return false;

          return true;
        })
        .map((key) => [key, towerItems[key]]),
    );
  }, [towerItems, rawStructureType]);

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
          <div
            className="relative flex-1 rounded-2xl overflow-hidden border border-slate-200 bg-white cursor-crosshair"
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={handleMouseMove}
          >
            {/* Zoom hint */}
            <div className="absolute top-3 left-3 z-10 bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-500 text-[10px] font-medium px-2.5 py-1 rounded-full shadow-sm">
              Hover to zoom
            </div>

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
              {/* Single composited image instead of N stacked <img> tags */}
              {compositeImage && (
                <img
                  ref={structureImgRef}
                  src={compositeImage}
                  alt="Tower"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />
              )}

              <ComponentLabels
                entries={labelEntries}
                overrides={labelOverrides[rawStructureType] ?? {}}
                imgRef={structureImgRef}
              />
            </div>
          </div>

          {/* Status bar */}
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

          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">
              Components
            </p>
            {activeCount > 0 && (
              <button
                onClick={resetFilter}
                className="text-[10px] text-sky-500 hover:text-sky-700 font-medium transition"
              >
                Reset filter
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {Object.entries(orderedTowerItems).map(([key, value]) => {
              const isActive = activeComponents.has(key);
              const isFiltering = activeCount > 0;

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
                      className={`transition-colors p-0.5 rounded ${isActive ? "text-sky-500" : "text-slate-300 hover:text-slate-500"}`}
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
