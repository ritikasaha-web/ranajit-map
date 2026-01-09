"use client";
import React, { useState } from "react";

interface AttributeData {
  id: string;
  name: string;
  height: number;
  location: string;
  status: string;
  [key: string]: any;
}

interface AttributeEditProps {
  data: AttributeData;
}

const AttributeEdit: React.FC<AttributeEditProps> = ({ data }) => {
  const [localData, setLocalData] = useState<AttributeData>(data);
  const [isEditing, setIsEditing] = useState(false);
  const [tempData, setTempData] = useState(JSON.stringify(localData, null, 2));

  const handleEdit = () => setIsEditing(true);

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this data?")) {
      const empty = {
        id: "",
        name: "",
        height: 0,
        location: "",
        status: "",
      };
      setLocalData(empty);
      setTempData(JSON.stringify(empty, null, 2));
    }
  };

  const handleSave = () => {
    try {
      const parsed = JSON.parse(tempData) as AttributeData;
      setLocalData(parsed);
      setIsEditing(false);
    } catch (error) {
      alert("Invalid JSON format!");
    }
  };

  const handleCancel = () => {
    setTempData(JSON.stringify(localData, null, 2));
    setIsEditing(false);
  };

  return (
    <div className="relative w-1/2 mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md border-2 border-primary">
      {/* Header Buttons */}
      <div className="absolute top-3 right-3 flex space-x-2">
        {!isEditing ? (
          <>
            <button
              onClick={handleEdit}
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Delete
            </button>
          </>
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
        Attribute Editor
      </h2>

      <pre className="bg-gray-50 text-gray-800 p-4 rounded-lg text-sm font-mono overflow-x-auto min-h-[200px]">
        {isEditing ? (
          <textarea
            value={tempData}
            onChange={(e) => setTempData(e.target.value)}
            className="w-full h-64 bg-gray-50 outline-none resize-none font-mono"
          />
        ) : (
          JSON.stringify(localData, null, 2)
        )}
      </pre>
    </div>
  );
};

export default AttributeEdit;
