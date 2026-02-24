"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface FeatureEditProps {
  data?: any;
  thingId: string;
}

const FeatureEdit: React.FC<FeatureEditProps> = ({ data = {}, thingId }) => {
  const [localData, setLocalData] = useState<any>(data);
  const [draftData, setDraftData] = useState<any>(data);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    setLocalData(data);
    setDraftData(data);
  }, [data]);

  /* -----------------------------
     Recursive Editable Renderer
  ----------------------------- */
  const renderEditable = (value: any, path: string[]) => {
    // primitive
    if (value === null || value === undefined || typeof value !== "object") {
      return isEditing ? (
        <input
          type="text"
          value={String(value ?? "")}
          onChange={(e) => {
            setDraftData((prev: any) => {
              const copy = structuredClone(prev);
              let ref = copy;
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
          {String(value).replaceAll("_", " ")}
        </span>
      );
    }

    // object
    return (
      <div className="ml-3 mt-2 space-y-2 border-l border-sky-200 pl-3">
        {Object.entries(value).map(([k, v]) => (
          <div key={k}>
            <div className="font-medium capitalize text-slate-700">
              {k.replaceAll("_", " ")}
            </div>
            <div className="ml-2">{renderEditable(v, [...path, k])}</div>
          </div>
        ))}
      </div>
    );
  };

  /* -----------------------------
     Actions
  ----------------------------- */
  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setDraftData(localData);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        // `http://localhost:8080/api/2/things/${thingId}/features`,
        `/api/2/things/${thingId}/features`,

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
        toast.warning("Something went wrong, can't change features.");
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
          success: (data) => "Features updated successfully",
          error: "Error",
        },
      );
    } catch {
      toast.warning("Something went wrong, can't change features.");
    }
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
        Feature Editor
      </h2>

      <div className="space-y-4 text-sm">
        {Object.keys(draftData).length === 0 ? (
          <p className="opacity-60">No features</p>
        ) : (
          Object.entries(draftData).map(([featureName, featureObj]: any) => (
            <div
              key={featureName}
              className="p-3 rounded-lg bg-sky-50 border border-sky-100"
            >
              <div className="font-semibold text-sky-700 capitalize mb-1">
                {featureName.replaceAll("_", " ")}
              </div>

              {featureObj?.properties ? (
                renderEditable(featureObj.properties, [
                  featureName,
                  "properties",
                ])
              ) : (
                <p className="opacity-60">No properties</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeatureEdit;
