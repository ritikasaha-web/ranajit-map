"use client";
import { useEffect, useState } from "react";

const Attributes = ({ data }: any) => {
  const [attributes, setAttributes] = useState<Record<string, any> | null>(
    null
  );

  useEffect(() => {
    if (data) {
      setAttributes(data);
    }
  }, [data]);

  return (
    <div className="w-1/2 h-80 overflow-auto border-r-4 border-primary p-6 pt-8 bg-white shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Attributes</h2>

      {!attributes ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="divide-y divide-gray-200">
          {Object.entries(attributes).map(([key, value]) => (
            <div
              key={key}
              className="flex justify-between items-center py-3 text-gray-700"
            >
              <span className="font-medium capitalize">{key}</span>
              <span className="text-gray-900">
                {typeof value === "object"
                  ? JSON.stringify(value)
                  : value?.toString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Attributes;
