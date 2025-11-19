"use client";

const Features = ({ twin }) => {
  if (!twin) {
    return (
      <div className="w-full h-full border-4 border-blue-500 flex items-center justify-center text-gray-500">
        Select a twin to view its features
      </div>
    );
  }

  const features = twin.features || {};

  return (
    <div className="w-full h-full border-4 border-blue-500 p-4 flex flex-col">
      <div className="text-2xl font-bold mb-4 text-blue-600">
        Features
      </div>

      {Object.keys(features).length === 0 ? (
        <div className="text-gray-500">No features found.</div>
      ) : (
        <div className="flex-1 overflow-y-auto max-h-[70vh] pr-2">
          <ul className="space-y-2 w-full">
            {Object.entries(features).map(([key, value]) => (
              <li
                key={key}
                className="p-2 bg-blue-50 border rounded w-full flex items-start gap-2 break-all"
              >
                <span className="font-semibold whitespace-nowrap">{key}:</span>
                <span className="flex-1 whitespace-pre-wrap break-all">
                  {typeof value === "object"
                    ? JSON.stringify(value, null, 2)
                    : String(value)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Features;
