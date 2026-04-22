"use client";
import {
  fourPoledComponentSet,
  monopoleComponentSet,
  tripoleComponentSet,
  guyedMastComponentSet,
  baseTypes,
  formatLabel,
  formatDuration,
  ComponentLayer,
  generateTowerImage,
  prefetchLayers,
} from "@/app/constants/component_names";
import { BsFullscreen } from "react-icons/bs";
import { FiUpload } from "react-icons/fi";
import {
  useExpandTowerStore,
  useSitePhotosStore,
  useUploadStore,
} from "@/app/store/useTowerStore";
import { GrGallery } from "react-icons/gr";
import { anchorMap, ComponentLabels, labelOverrides } from "./componentLabels";
import { useState, useEffect, useMemo } from "react";
import SiteUploadPhotos from "../common/SiteUploadPhotos";
import { GridLoader } from "react-spinners";

/* ── Types ──────────────────────────────────────────────────── */

interface TowerPreviewProps {
  structureType: string;
  installationType: string;
  components: Record<string, any>;
  uptime: number;
  down_time: number;
}

/* ── Component Set Map ──────────────────────────────────────── */
const componentSetMap: Record<string, Set<string>> = {
  monopole: monopoleComponentSet,
  tripole: tripoleComponentSet,
  four_pole: fourPoledComponentSet,
  guyed_mast: guyedMastComponentSet,
};

/* ── Main Component ─────────────────────────────────────────── */
const TowerPreview = ({
  components,
  structureType,
  installationType,
  down_time,
  uptime,
}: TowerPreviewProps) => {
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const isUploadOpen = useUploadStore((s) => s.isUploadOpen);
  const setUploadOpen = useUploadStore((s) => s.setUploadOpen);

  const setExpandState = useExpandTowerStore((s) => s.setOpenExpandTower);
  const setSitePhotosOpen = useSitePhotosStore((s) => s.setSitePhotosOpen);

  // ── Kept exactly as original ──
  let downtimeLabel = "OK";
  let downtimeColor = "text-green-600 bg-green-50 border-green-200";
  if (down_time > 0) {
    downtimeLabel = "Down";
    downtimeColor = "text-red-600 bg-red-50 border-red-200";
  } else if (down_time > 0) {
    downtimeLabel = "Running at Risk";
    downtimeColor = "text-orange-600 bg-orange-50 border-orange-200";
  }

  const { layers, prefetchReady } = useMemo<{
    layers: ComponentLayer[];
    prefetchReady: Promise<void>;
  }>(() => {
    const towerComponents =
      componentSetMap[structureType] ?? monopoleComponentSet;
    const anchors = anchorMap[structureType] ?? anchorMap.monopole;

    const base: ComponentLayer[] = [
      {
        src: `/${baseTypes[installationType]}.webp`,
        id: "__base__",
        anchor: { x: 50, y: 50 },
      },
      {
        src: `/${structureType}/${structureType}.webp`,
        id: "__structure__",
        anchor: { x: 50, y: 50 },
      },
    ];

    const componentLayers: ComponentLayer[] = [];
    for (const key of towerComponents) {
      const value = components[key];
      if (value === null || value === undefined) continue;
      if (typeof value === "string" && value.trim() === "") continue;
      if (typeof value === "number" && value < 0) continue;

      const src =
        key === "cable" && typeof value !== "number"
          ? `/${structureType}/cable_${value}.webp`
          : `/${structureType}/${key}.webp`;

      componentLayers.push({
        src,
        id: key,
        anchor: anchors[key] ?? { x: 80, y: 50 },
      });
    }

    const layers = [...base, ...componentLayers];

    // Start all image fetches immediately. prefetchLayers must return
    // Promise<void> — see note at the bottom of this file.
    const prefetchReady = prefetchLayers(layers);

    return { layers, prefetchReady };
  }, [components, structureType, installationType]);

  // ── Memoize label entries ──
  const labelEntries = useMemo(
    () =>
      layers
        .filter((l) => !l.id.startsWith("__") && components[l.id] != null)
        .map((l) => ({
          id: l.id,
          value: components[l.id],
          anchor: l.anchor,
          side: (l.anchor.x >= 50 ? "right" : "left") as "right" | "left",
        })),
    [layers, components],
  );

  // ── Memoize visible tower-detail rows ──
  const towerComponents = useMemo(
    () => componentSetMap[structureType] ?? monopoleComponentSet,
    [structureType],
  );

  const detailRows = useMemo(
    () =>
      [...towerComponents].filter((key) => {
        const v = components[key];
        if (v === null || v === undefined) return false;
        if (typeof v === "string") return v.trim() !== "";
        if (typeof v === "number") return true;
        if (typeof v === "boolean") return true;
        return false;
      }),
    [towerComponents, components],
  );

  // ── FIX 2: Await prefetchReady before compositing.
  //    generateTowerImage will find every bitmap already in the browser's
  //    decoded image cache, so canvas drawImage() calls are synchronous
  //    and compositing completes in a single microtask tick.
  useEffect(() => {
    let cancelled = false;
    prefetchReady.then(() => {
      if (cancelled) return;
      generateTowerImage(layers).then((img: any) => {
        if (!cancelled) setFinalImage(img);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [layers, prefetchReady]);

  return (
    <div className="w-full h-full bg-white rounded-lg p-2 flex flex-col gap-3">
      {/* ── Image Section ── */}
      {/* ── Image Section ── */}
      <div className="relative w-full h-[320px] bg-white rounded-md border border-slate-300 overflow-hidden flex items-center justify-center">
        {/* Skeleton shimmer while loading */}
        {!finalImage && (
          <div className="absolute grid place-items-center inset-0 bg-slate-100 animate-pulse rounded-md">
            <GridLoader color="#787878" size={12} />
          </div>
        )}

        {/* Action Buttons — also hide until image is ready */}
        {finalImage && (
          <div className="absolute top-2 right-2 z-30 flex flex-col gap-1.5">
            {/* Expand View */}
            <div className="group relative">
              <button
                onClick={() => setExpandState(true)}
                className="cursor-pointer rounded-full p-1.5 bg-white/80 backdrop-blur-sm border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors duration-200"
              >
                <BsFullscreen size={16} />
              </button>
              <span className="pointer-events-none absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-800 text-white text-[10px] font-medium px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                Expand View
              </span>
            </div>

            {/* Site Photos */}
            <div className="group relative">
              <button
                onClick={() => setSitePhotosOpen(true)}
                className="cursor-pointer rounded-full p-1.5 bg-white/80 backdrop-blur-sm border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors duration-200"
              >
                <GrGallery size={16} />
              </button>
              <span className="pointer-events-none absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-800 text-white text-[10px] font-medium px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                Site Photos
              </span>
            </div>

            {/* Upload Images */}
            <div className="group relative">
              <button
                onClick={() => setUploadOpen(true)}
                className="cursor-pointer rounded-full p-1.5 bg-white/80 backdrop-blur-sm border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors duration-200"
              >
                <FiUpload size={16} />
              </button>
              <span className="pointer-events-none absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-800 text-white text-[10px] font-medium px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                Upload Images
              </span>
            </div>
          </div>
        )}

        {finalImage && (
          <>
            <img
              src={finalImage}
              alt="Tower preview"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />
            {/* ── Labels only mount after image is ready ── */}
            <ComponentLabels
              entries={labelEntries}
              overrides={labelOverrides[structureType] ?? {}}
            />
          </>
        )}
      </div>

      {/* ── Tower Status ── */}
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

      {/* ── Tower Details ── */}
      <div className="flex-1 overflow-y-auto text-xs">
        <h2 className="text-sm font-semibold text-slate-800 mb-2">
          Tower Details
        </h2>
        <div className="space-y-1">
          {detailRows.map((key) => (
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

      {isUploadOpen && (
        <SiteUploadPhotos onClose={() => setUploadOpen(false)} />
      )}
    </div>
  );
};

export default TowerPreview;

/*
 * REQUIRED CHANGE in component_names.ts
 * ──────────────────────────────────────
 * prefetchLayers must return Promise<void> instead of void.
 * Replace your current implementation with this:
 *
 * export function prefetchLayers(layers: ComponentLayer[]): Promise<void> {
 *   return Promise.all(
 *     layers.map(
 *       (l) =>
 *         new Promise<void>((resolve) => {
 *           const img = new Image();
 *           img.onload = () => resolve();
 *           img.onerror = () => resolve(); // don't block compositing on 404s
 *           img.src = l.src;
 *         })
 *     )
 *   ).then(() => undefined);
 * }
 */
