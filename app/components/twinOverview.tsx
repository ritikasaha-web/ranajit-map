"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  upperCaseSet,
  applyFormatting,
} from "@/app/constants/component_names";
import { useTower } from "../hooks/getTowers";
import { useTowerStore } from "../store/useTowerStore";
import { IoChevronDown } from "react-icons/io5";
import SiteUploadPhotos from "@/app/components/common/SiteUploadPhotos";

/* ── Accordion ── */
const Accordion = ({
  label,
  children,
  defaultOpen = false,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-sky-200 rounded-md mb-2 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-sky-50 hover:bg-sky-100 transition-colors text-left"
      >
        <span className="font-medium text-sky-700 text-sm">
          {applyFormatting(label)}
        </span>
        <IoChevronDown
          size={14}
          className={`text-sky-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-3 py-2 bg-white">{children}</div>}
    </div>
  );
};

const TwinOverview = () => {
  const selectedTowerId = useTowerStore((s) => s.selectedTowerId);
  const isSidebarOpen = useTowerStore((s) => s.isSidebarOpen);
  const { data: selectedTower } = useTower(selectedTowerId ?? undefined);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [entered, setEntered] = useState(false);

  // Trigger enter animation
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const router = {
    push: (path: string) => {
      window.location.hash = path.startsWith("/") ? `#${path}` : path;
    },
  };

  const renderRecursive = (data: any): React.ReactNode => {
    if (data === null || data === undefined)
      return <span className="text-slate-400">—</span>;

    if (typeof data !== "object")
      return (
        <span className="text-slate-700">
          {typeof data === "string" ? applyFormatting(data) : String(data)}
        </span>
      );

    if (Array.isArray(data))
      return (
        <div className="ml-4 space-y-1">
          {data.map((item, i) => (
            <div key={i} className="text-slate-700">
              • {renderRecursive(item)}
            </div>
          ))}
        </div>
      );

    return (
      <div className="ml-2 space-y-2">
        {Object.entries(data).map(([key, value]) => {
          const isPrimitive =
            value === null || value === undefined || typeof value !== "object";
          return (
            <div key={key}>
              {isPrimitive ? (
                <div className="flex gap-2">
                  <span className="font-medium text-slate-800">
                    {applyFormatting(key)}:
                  </span>
                  <span className="text-slate-700">
                    {key.toLowerCase() === "model"
                      ? String(value).toUpperCase()
                      : upperCaseSet.has(key.toLowerCase())
                        ? String(value)
                        : typeof value === "string"
                          ? applyFormatting(value)
                          : String(value)}
                  </span>
                </div>
              ) : (
                <>
                  <div className="font-medium text-slate-800">
                    {applyFormatting(key)}:
                  </div>
                  <div className="ml-4 mt-1 border-l border-sky-300 pl-3">
                    {renderRecursive(value)}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderFeatures = (featuresObj: any) => (
    <div className="mt-3 space-y-1">
      {Object.entries(featuresObj).map(([featureName, featureData]: any) => {
        const properties = featureData?.properties ?? featureData;
        return (
          <Accordion key={featureName} label={featureName} defaultOpen={true}>
            {properties && typeof properties === "object" ? (
              Object.entries(properties).map(([propKey, propValue]) => {
                const isNestedObject =
                  propValue !== null &&
                  propValue !== undefined &&
                  typeof propValue === "object" &&
                  !Array.isArray(propValue);
                return isNestedObject ? (
                  <Accordion key={propKey} label={propKey}>
                    {renderRecursive(propValue)}
                  </Accordion>
                ) : (
                  <div key={propKey} className="flex gap-2 py-0.5">
                    <span className="font-medium text-slate-800 text-sm">
                      {applyFormatting(propKey)}:
                    </span>
                    <span className="text-slate-700 text-sm">
                      {renderRecursive(propValue)}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 italic">No properties</p>
            )}
          </Accordion>
        );
      })}
    </div>
  );

  return (
    <div
      className={`absolute right-0 top-0 z-[500] w-[30%] h-screen
        border-l-2 border-sky-400 bg-sky-50 text-slate-800 flex flex-col
        transition-transform duration-300 ease-in-out
        ${entered && isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      {!selectedTower ? (
        <div className="flex items-center justify-center h-full">
          <span className="text-slate-400 text-sm">Loading…</span>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="h-[10%] flex items-center justify-center border-b-2 border-sky-400 bg-white/90 flex-shrink-0">
            <h1 className="text-lg font-semibold tracking-wide truncate px-4">
              {selectedTower.thingId}
            </h1>
          </div>

          {uploadOpen && (
            <SiteUploadPhotos onClose={() => setUploadOpen(false)} />
          )}

          {/* Attributes */}
          <div className="h-[40%] p-4 overflow-y-auto border-b-2 border-sky-400 bg-white/70">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              Attributes
            </h2>
            {renderRecursive(selectedTower.attributes ?? {})}
          </div>

          {/* Features */}
          <div className="h-[40%] p-4 overflow-y-auto border-b-2 border-sky-400 bg-white/70">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              Features
            </h2>
            {renderFeatures(selectedTower.features ?? {})}
          </div>

          {/* Footer */}
          <div className="h-[10%] flex items-center justify-center gap-3 bg-white/90 flex-shrink-0">
            <Button
              className="rounded-full bg-sky-600 text-white hover:bg-sky-700 cursor-pointer"
              onClick={() => router.push(`/tower/${selectedTower.thingId}`)}
            >
              View Details
            </Button>
            <Button
              className="rounded-full border cursor-pointer border-sky-300 text-slate-700 bg-white hover:bg-sky-50"
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${selectedTower.attributes?.location?.lat},${selectedTower.attributes?.location?.lng}`,
                  "_blank",
                )
              }
            >
              Open in Maps
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default TwinOverview;
