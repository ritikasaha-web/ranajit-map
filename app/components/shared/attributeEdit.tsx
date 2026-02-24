"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface AttributeEditProps {
  data: Record<string, any>;
  thingId: string;
}

const AttributeEdit: React.FC<AttributeEditProps> = ({ data, thingId }) => {
  const [localData, setLocalData] = useState<Record<string, any>>(data);
  const [isEditing, setIsEditing] = useState(false);
  const [draftData, setDraftData] = useState<Record<string, any>>(data);
  const queryClient = useQueryClient();

  const handleEdit = () => {
    setDraftData(localData);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        // `http://localhost:8080/api/2/things/${thingId}/attributes`,
        `/api/2/things/${thingId}/attributes`,

        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/merge-patch+json",
            Authorization: "Basic " + btoa("ditto:ditto"),
          },
          body: JSON.stringify(draftData),
        },
      );

      if (!response.ok) {
        const err = await response.text();
        toast.warning("Something went wrong, can't change attributes.");
        return;
      }

      setLocalData(draftData);
      setIsEditing(false);
      queryClient.invalidateQueries({
        queryKey: ["towers", thingId],
      });
      toast.promise<{ name: string }>(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ name: "Event" }), 2000),
          ),
        {
          loading: "Loading...",
          success: (data) => `Attributes updated successfully`,
          error: "Error",
        },
      );
    } catch (e) {
      toast.warning("Something went wrong, can't change attributes.");
    }
  };

  const handleCancel = () => {
    setDraftData(localData);
    setIsEditing(false);
  };

  const handleChange = (key: string, value: string) => {
    setDraftData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  const renderEditable = (value: any, path: string[], isEditing: boolean) => {
    // Primitive
    if (value === null || value === undefined || typeof value !== "object") {
      return isEditing ? (
        <input
          type="text"
          value={String(value ?? "")}
          onChange={(e) => {
            setDraftData((prev) => {
              const copy = structuredClone(prev);
              let ref: any = copy;
              for (let i = 0; i < path.length - 1; i++) {
                ref = ref[path[i]];
              }
              ref[path[path.length - 1]] = e.target.value;
              return copy;
            });
          }}
          className="w-full px-3 py-1.5 rounded-md border border-sky-200 focus:ring-2 focus:ring-sky-300"
        />
      ) : (
        <span className="text-slate-600">
          {value !== null && value !== undefined
            ? String(value).replaceAll("_", " ")
            : "—"}
        </span>
      );
    }

    // Object → recurse
    return (
      <div className="ml-3 mt-2 space-y-2 border-l border-sky-200 pl-3">
        {Object.entries(value).map(([k, v]) => (
          <div key={k}>
            <div className="font-medium text-slate-700 capitalize">
              {k.replaceAll("_", " ")}
            </div>
            <div className="ml-2">
              {renderEditable(v, [...path, k], isEditing)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative w-1/2 p-6 bg-white/80 rounded-xl border border-sky-200 shadow-sm">
      {/* Header Actions */}
      <div className="absolute top-4 right-4 flex gap-2">
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="px-3 py-1.5 text-sm rounded-md bg-sky-600 text-white hover:bg-sky-700"
          >
            Edit
          </button>
        ) : (
          <>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-sm rounded-md bg-green-600 text-white hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm rounded-md bg-gray-400 text-white hover:bg-gray-500"
            >
              Cancel
            </button>
          </>
        )}
      </div>

      <h2 className="text-xl font-semibold mb-4 text-slate-800">
        Attribute Editor
      </h2>

      <div className="space-y-3 text-sm">
        <div className="space-y-4 text-sm">
          {Object.entries(draftData).map(([key, value]) => (
            <div key={key}>
              <div className="font-semibold text-slate-800 capitalize">
                {key.replaceAll("_", " ")}
              </div>
              <div className="ml-2 mt-1">
                {renderEditable(value, [key], isEditing)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttributeEdit;
