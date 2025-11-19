import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const twinOverview = ({ currTower }: { currTower: any }) => {
  const router = useRouter();

  if (!currTower) {
    return (
      <div className="w-[30%] h-screen border-2 border-primary bg-primary-foreground flex items-center justify-center">
        <h1 className="text-lg opacity-70">Select a tower</h1>
      </div>
    );
  }

  const { thingId, attributes = {}, features = {} } = currTower;

  const renderObject = (obj: any) => {
    if (!obj || typeof obj !== "object") return null;

    return (
      <div className="mt-2 space-y-2">
        {Object.entries(obj).map(([key, value]) => {
          const isObject = value && typeof value === "object";

          return (
            <div key={key} className="border-b pb-1">
              <span className="font-semibold capitalize">{key}:</span>{" "}
              {!isObject ? (
                <span className="text-sm opacity-90 capitalize">
                  {value !== undefined && value !== null
                    ? String(value).replaceAll("_", " ")
                    : "—"}
                </span>
              ) : (
                <pre className="text-xs mt-1 p-2 bg-muted rounded">
                  {JSON.stringify(value, null, 2)}
                </pre>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Recursive renderer for ANY JSON shape
  const renderRecursive = (data: any) => {
    if (data === null || data === undefined)
      return <span className="opacity-50">—</span>;

    // Primitive values
    if (typeof data !== "object") {
      return <span>{String(data)}</span>;
    }

    // Arrays
    if (Array.isArray(data)) {
      return (
        <ul className="ml-4 list-disc">
          {data.map((item, i) => (
            <li key={i}>{renderRecursive(item)}</li>
          ))}
        </ul>
      );
    }

    // Objects
    return (
      <div className="ml-2 border-l pl-3 mt-2 space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key}>
            <span className="font-semibold capitalize">{key}: </span>
            <div className="mt-1">{renderRecursive(value)}</div>
          </div>
        ))}
      </div>
    );
  };

  // Features are nested differently → each feature has "properties"
  const renderFeatures = (featuresObj: any) => {
    return (
      <div className="mt-2 space-y-3">
        {Object.entries(featuresObj).map(([featureName, featureData]: any) => (
          <div
            key={featureName}
            className="border p-2 rounded bg-muted/40 shadow-sm"
          >
            <h3 className="font-semibold mb-1 capitalize">{featureName}</h3>

            {featureData?.properties ? (
              renderObject(featureData.properties)
            ) : (
              <p className="text-sm opacity-70 italic">No properties</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-[30%] h-screen border-2 border-primary bg-primary-foreground">
      {/* Header */}
      <div className="w-full h-[10%] border-b-2 border-primary flex items-center justify-center">
        <h1 className="text-xl tracking-wide font-semibold">
          {thingId ?? "Tower Name"}
        </h1>
      </div>

      {/* Attributes */}
      <div className="w-full h-[40%] border-b-2 border-primary p-4 overflow-y-auto">
        <h1 className="text-lg font-semibold mb-2">Attributes</h1>
        <hr className="opacity-50" />
        {renderRecursive(attributes)}
      </div>

      {/* Features */}
      <div className="w-full h-[40%] border-b-2 border-primary p-4 overflow-y-auto">
        <h1 className="text-lg font-semibold mb-2">Features</h1>
        <hr className="opacity-50" />
        {renderFeatures(features)}
      </div>

      {/* Footer Actions */}
      <div className="w-full h-[10%] flex items-center justify-center gap-2">
        <Button
          className="shadow-md rounded-full cursor-pointer hover:scale-105 transition"
          onClick={() => {
            // setShowDetails(true);
            router.push(`/tower/${thingId}`);
          }}
        >
          View Detailed Report
        </Button>

        <Button
          className="shadow-md rounded-full cursor-pointer hover:scale-105 transition"
          onClick={() =>
            window.open(
              `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${attributes.location?.lat},${attributes.location?.lng}`,
              "_blank"
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
