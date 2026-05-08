"use client";

import React, { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RxCross2 } from "react-icons/rx";
import { useTowerStore } from "@/app/store/useTowerStore";
import { useTower } from "@/app/hooks/getTowers";
import { createPortal } from "react-dom";
import { uploadSiteImages } from "@/app/ditto/endpoints";
import { compressImage } from "@/app/constants/component_names";

type Preview = { file: File; objectUrl: string };

const toFolder = (thingId: string) =>
  thingId.includes(":") ? thingId.split(":").pop()! : thingId;
const MAX_FILES = 5;

// ─────────────────────────────────────────────────────────────────────────────

const SiteUploadPhotos = ({ onClose }: { onClose: () => void }) => {
  const [images, setImages] = useState<string[]>([]);
  const { data: currTower } = useTower(useTowerStore((s) => s.selectedTowerId));
  const queryClient = useQueryClient();

  const [previews, setPreviews] = useState<Preview[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const thingId = currTower?.thingId ?? "";
  const folder = toFolder(thingId);

  const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;

    const valid = Array.from(incoming).filter((f) => ALLOWED.includes(f.type));

    if (!valid.length) {
      setError("Only JPG, PNG, WEBP or GIF allowed.");
      return;
    }

    // ✅ enforce max limit
    const totalCount = images.length + previews.length + valid.length;

    if (totalCount > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} photos allowed per site.`);
      return;
    }

    setError(null);
    setDone(false);

    setPreviews((prev) => [
      ...prev,
      ...valid.map((file) => ({
        file,
        objectUrl: URL.createObjectURL(file),
      })),
    ]);
  };

  const remove = (idx: number) => {
    URL.revokeObjectURL(previews[idx].objectUrl);
    setPreviews((p) => p.filter((_, i) => i !== idx));
  };

  const clearAll = () => {
    previews.forEach((p) => URL.revokeObjectURL(p.objectUrl));
    setPreviews([]);
    setDone(false);
    setError(null);
  };

  const upload = async () => {
    if (!previews.length || !folder) return;

    setUploading(true);
    setError(null);

    try {
      // 1. Compress all images concurrently before sending
      const compressedFiles = await Promise.all(
        previews.map((p) => compressImage(p.file, 800, 0.5, 45 * 1024)),
      );

      // 2. Send the compressed files to your API
      const data = await uploadSiteImages(folder, compressedFiles);

      setImages((prev) => [...prev, ...data.urls]);

      previews.forEach((p) => URL.revokeObjectURL(p.objectUrl));
      setPreviews([]);
      setDone(true);

      await queryClient.invalidateQueries({
        queryKey: ["siteImages", thingId],
      });
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative flex flex-col w-[560px] max-h-[88vh] rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">
              Upload Photos
            </p>
            <h2 className="text-base font-bold text-slate-800 leading-none">
              {thingId || "—"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition"
          >
            <RxCross2 size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col flex-1 overflow-y-auto p-5 gap-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              addFiles(e.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
            className={`rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 py-10 cursor-pointer transition-colors shrink-0 ${
              dragOver
                ? "border-sky-400 bg-sky-50"
                : "border-slate-200 bg-slate-50 hover:border-sky-300 hover:bg-sky-50/50"
            }`}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke={dragOver ? "#0ea5e9" : "#94a3b8"}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="text-sm font-medium text-slate-500">
              {dragOver ? "Drop images here" : "Click or drag images here"}
            </p>
            <p className="text-xs text-slate-400">
              JPG · PNG · WEBP · Max 5 Images
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center justify-between bg-red-50 border border-red-100 text-red-600 text-xs px-4 py-2.5 rounded-xl">
              {error}
              <button onClick={() => setError(null)}>
                <RxCross2 size={13} />
              </button>
            </div>
          )}

          {/* Success */}
          {done && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 text-xs px-4 py-2.5 rounded-xl">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Images uploaded successfully for site{" "}
              <code className="bg-green-100 px-1.5 py-0.5 rounded">
                {thingId}
              </code>
            </div>
          )}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {images.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  className="w-full h-24 object-cover rounded"
                />
              ))}
            </div>
          )}

          {/* Preview grid */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {previews.map((p, idx) => (
                <div
                  key={idx}
                  className="relative rounded-xl overflow-hidden aspect-video bg-slate-100 group"
                >
                  <img
                    src={p.objectUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => remove(idx)}
                    className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <RxCross2 size={11} />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent px-2 py-1.5">
                    <p className="text-white text-[9px] truncate">
                      {p.file.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <p className="text-xs text-slate-400">
              {previews.length} file{previews.length !== 1 ? "s" : ""} selected
            </p>
            {previews.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-slate-400 hover:text-slate-600 transition underline underline-offset-2"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="text-xs cursor-pointer text-slate-500 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={upload}
              disabled={!previews.length || uploading}
              className="text-xs cursor-pointer font-semibold text-white px-5 py-2 rounded-full bg-sky-500 hover:bg-sky-600 disabled:opacity-40 transition flex items-center gap-1.5"
            >
              {uploading ? (
                <>
                  <svg
                    className="animate-spin w-3 h-3"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Uploading…
                </>
              ) : (
                "Upload"
              )}
            </button>
          </div>
        </div>

        <div className="h-[3px] bg-gradient-to-r from-sky-500 to-blue-400 shrink-0" />
      </div>
    </div>,
    document.body,
  );
};

export default SiteUploadPhotos;
