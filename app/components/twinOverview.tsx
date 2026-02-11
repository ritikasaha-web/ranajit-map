import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  formatLabel,
  upperCaseSet,
  lowerCaseSet,
  applyFormatting,
} from "@/app/constants/component_names";
import { useTower } from "../hooks/getTowers";
import { useTowerStore } from "../store/useTowerStore";

const twinOverview = () =>
  // { currTower }: { currTower: any }
  {
    const router = useRouter();
    const selectedTowerId = useTowerStore((s) => s.selectedTowerId);

    const { data: selectedTower } = useTower(selectedTowerId ?? undefined);

    if (!selectedTower) {
      return (
        <div className="w-[30%] h-screen border-2 border-sky-400 bg-sky-50 flex items-center justify-center">
          <h1 className="text-sm text-slate-500">Select a tower</h1>
        </div>
      );
    }

    const { thingId, attributes = {}, features = {} } = selectedTower;

    const renderRecursive = (data: any) => {
      if (data === null || data === undefined) {
        return <span className="text-slate-400">—</span>;
      }

      // Primitive
      if (typeof data !== "object") {
        return (
          <span className="text-slate-700">
            {typeof data === "string" ? applyFormatting(data) : String(data)}
          </span>
        );
      }

      // Array
      if (Array.isArray(data)) {
        return (
          <div className="ml-4 space-y-1">
            {data.map((item, i) => (
              <div key={i} className="text-slate-700">
                • {renderRecursive(item)}
              </div>
            ))}
          </div>
        );
      }

      // Object (THIS is the important part)
      return (
        <div className="ml-2 space-y-2">
          {Object.entries(data).map(([key, value]) => {
            const isPrimitive =
              value === null ||
              value === undefined ||
              typeof value !== "object";

            return (
              <div key={key}>
                {/* Label + primitive inline */}
                {isPrimitive ? (
                  <div className="flex gap-2">
                    <span className="font-medium text-slate-800">
                      {applyFormatting(key)}:
                    </span>
                    <span className="text-slate-700">
                      {upperCaseSet.has(key.toLowerCase())
                        ? String(value)
                        : typeof value === "string"
                          ? applyFormatting(value)
                          : String(value)}
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Label */}
                    <div className="font-medium text-slate-800">
                      {applyFormatting(key)}:
                    </div>

                    {/* Nested content */}
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

    const renderFeatures = (featuresObj: any) => {
      return (
        <div className="mt-3 space-y-4">
          {Object.entries(featuresObj).map(
            ([featureName, featureData]: any) => (
              <div
                key={featureName}
                className="rounded-lg border border-sky-300 bg-sky-100/50 p-3"
              >
                <h3 className="font-semibold text-sky-700 mb-2">
                  {applyFormatting(featureName)}
                </h3>

                {featureData?.properties ? (
                  renderRecursive(featureData.properties)
                ) : (
                  <p className="text-xs text-slate-500 italic">No properties</p>
                )}
              </div>
            ),
          )}
        </div>
      );
    };

    return (
      <div className="w-[30%] h-screen border-2 border-sky-400 bg-sky-50 text-slate-800 flex flex-col">
        {/* Header */}
        <div className="h-[10%] flex items-center justify-center border-b-2 border-sky-400 bg-white/90">
          <h1 className="text-lg font-semibold tracking-wide">
            {thingId ? thingId : "Tower Name"}
          </h1>
        </div>

        {/* Attributes */}
        <div className="h-[40%] p-4 overflow-y-auto border-b-2 border-sky-400 bg-white/70">
          <h2 className="text-sm font-semibold text-slate-800 mb-2">
            Attributes
          </h2>
          {renderRecursive(attributes)}
        </div>

        {/* Features */}
        <div className="h-[40%] p-4 overflow-y-auto border-b-2 border-sky-400 bg-white/70">
          <h2 className="text-sm font-semibold text-slate-800 mb-2">
            Features
          </h2>
          {renderFeatures(features)}
        </div>

        {/* Footer */}
        <div className="h-[10%] flex items-center justify-center gap-3 bg-white/90">
          <Button
            className="rounded-full bg-sky-600 text-white hover:bg-sky-700"
            onClick={() => router.push(`/tower/${thingId}`)}
          >
            View Details
          </Button>

          <Button
            className="rounded-full border border-sky-300 text-slate-700 bg-white hover:bg-sky-50"
            onClick={() =>
              window.open(
                `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${attributes.location?.lat},${attributes.location?.lng}`,
                "_blank",
              )
            }
          >
            Open in Maps
          </Button>
        </div>
      </div>
    );
  };

export default twinOverview;
