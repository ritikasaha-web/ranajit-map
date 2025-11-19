"use client";

const Attributes = ({ twin }) => {
  if (!twin) {
    return (
      <div className="w-full h-full border-4 border-blue-500 flex items-center justify-center text-gray-500">
        Select a twin to view its attributes
      </div>
    );
  }

  const attrs = twin.attributes || {};

  return (
    <div className="w-full h-full border-4 border-blue-500 p-4 flex flex-col">
      <div className="text-2xl font-bold mb-4 text-blue-600">Attributes</div>

      {Object.keys(attrs).length === 0 ? (
        <div className="text-gray-500">No attributes found.</div>
      ) : (
        <div className="flex-1 overflow-y-auto max-h-[70vh] pr-2">
          <ul className="space-y-2 w-full">
            {Object.entries(attrs).map(([key, value]) => (
              <li
                key={key}
                className="p-2 bg-blue-50 border rounded w-full flex items-start gap-2 break-all"
              >
                <span className="font-semibold whitespace-nowrap">{key}:</span>
                <span className="flex-1 whitespace-pre-wrap break-all">
                  {String(value)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Attributes;
