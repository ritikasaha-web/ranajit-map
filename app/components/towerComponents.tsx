import React from "react";
import { div } from "three/tsl";

const TowerComponents = ({ features }: { features: any }) => {
  if (!features) return null;

  // Convert "power_supply" → "Power Supply"
  const formatTypeName = (str: string) => {
    return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className=" p-8 w-full">
      <div className="text-2xl font-semibold mb-6">Tower Components</div>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(features).map(([featureName, featureData]: any) => {
          const type = featureData?.properties?.type
            ? featureData?.properties?.type
            : featureName.toLowerCase();
          console.log("Type:", type);
          if (!type) return null;

          // Example: `/components/${type}.png`
          const imgSrc = `/tower_components/${type}.jpg`;

          return (
            <div
              key={featureName}
              className="flex items-center gap-3 p-2 border border-primary rounded-lg shadow-sm"
            >
              <img
                src={imgSrc}
                alt={type}
                className=" w-54 h-54 object-contain"
              />

              <div className="text-lg font-medium">{formatTypeName(type)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TowerComponents;
