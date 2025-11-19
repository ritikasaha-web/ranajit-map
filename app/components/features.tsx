"use client";
import React from "react";

interface FeaturesProps {
  data?: Record<string, any>; // features from Ditto
}

const Features: React.FC<FeaturesProps> = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="w-1/2 h-80 overflow-auto p-6 pt-8 bg-white shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Features</h2>
        <p className="text-gray-500">No features available.</p>
      </div>
    );
  }

  return (
    <div className="w-1/2 h-80 overflow-auto p-6 pt-8 bg-white shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Features</h2>

      <div className="divide-y divide-gray-200">
        {Object.entries(data).map(([featureName, featureObj]) => (
          <div key={featureName} className="py-3">
            <h3 className="text-lg font-semibold text-primary mb-2">
              {featureName}
            </h3>

            {featureObj?.properties ? (
              <div className="pl-4 space-y-1">
                {Object.entries(featureObj.properties).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between items-center text-gray-700"
                  >
                    <span className="font-medium capitalize">{key}</span>
                    <span className="text-gray-900">
                      {value !== null && value !== undefined
                        ? value.toString()
                        : "—"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 pl-4">No properties available</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
