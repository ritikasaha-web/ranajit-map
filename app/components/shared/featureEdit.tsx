"use client";
import React, { useEffect, useState } from "react";

interface FeatureEditProps {
  data?: any; // features from Ditto
  thingId: string; // <-- add this so we know which thing to update
}

const FeatureEdit: React.FC<FeatureEditProps> = ({ data, thingId }) => {
  const [json, setJson] = useState("");
  const [editMode, setEditMode] = useState(false);

  // Load incoming data as formatted JSON
  useEffect(() => {
    if (data) {
      setJson(JSON.stringify(data, null, 2));
    }
  }, [data]);

  const handleEdit = () => setEditMode(true);

  const handleCancel = () => {
    setJson(JSON.stringify(data, null, 2));
    setEditMode(false);
  };

  const handleSave = async () => {
    try {
      const parsed = JSON.parse(json);

      const response = await fetch(
        `http://localhost:8080/api/2/things/${thingId}/features`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/merge-patch+json",
            Authorization: "Basic " + btoa("ditto:ditto"), // change if needed
          },
          body: JSON.stringify(parsed),
        }
      );

      if (!response.ok) {
        const err = await response.text();
        alert("Ditto PATCH Failed:\n" + err);
        return;
      }

      setEditMode(false);
      alert("Successfully updated features!");
    } catch (e) {
      alert("Invalid JSON format!");
    }
  };

  return (
    <div className="relative w-1/2 mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md border-2 border-primary">
      <div className="absolute top-3 right-3 flex space-x-2">
        {!editMode ? (
          <button
            onClick={handleEdit}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Edit
          </button>
        ) : (
          <>
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-gray-400 text-white rounded-md hover:bg-gray-500"
            >
              Cancel
            </button>
          </>
        )}
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Feature Editor
      </h2>

      <pre className="bg-gray-50 text-gray-800 p-4 rounded-lg text-sm font-mono overflow-x-auto min-h-[200px]">
        {!editMode ? (
          <>{json}</>
        ) : (
          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            className="w-full h-64 bg-gray-50 outline-none resize-none font-mono"
          />
        )}
      </pre>
    </div>
  );
};

export default FeatureEdit;
