import React from "react";

interface TowerPreviewProps {
  components: Record<string, any>;
}

const TowerPreview = ({ components }: TowerPreviewProps) => {
  const formatValue = (value: string) => {
    return value
      .replace(/([A-Z])/g, " $1") // split camelCase
      .replace(/^./, (str) => str.toUpperCase()); // capitalize first
  };
  return (
    <div className="w-full max-w-3xl flex items-start gap-6 p-4 bg-white rounded-xl">
      {/* Tower Image */}
      <div className="flex-shrink-0">
        <img
          src="/tower.png"
          alt="Tower"
          className="rounded-xl w-80 h-80 object-cover"
        />
      </div>

      {/* Scrollable Key–Value Data */}
      <div className="flex-1 flex flex-col gap-4 max-h-80 overflow-y-auto pr-2">
        <h2 className="text-xl font-bold mb-2 sticky top-0 bg-white py-2">
          Tower Details
        </h2>

        <div className="flex flex-col gap-3">
          {Object.entries(components).map(([key, value]) => (
            <div
              key={key}
              className="flex justify-between border-b pb-2 text-sm"
            >
              <span className="font-medium">{formatValue(String(key))} </span>
              <span className="text-gray-700 text-right ">
                {String(value)}{" "}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TowerPreview;
