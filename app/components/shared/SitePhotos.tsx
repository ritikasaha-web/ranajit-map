import React, { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { useSitePhotosStore } from "@/app/store/useTowerStore";
import { useTowerStore } from "@/app/store/useTowerStore";
import { useTower } from "@/app/hooks/getTowers";

// Placeholder photos — replace with real URLs from your API
const PLACEHOLDER_PHOTOS = [
  {
    id: 1,
    label: "Site Image 1",
    url: "/site_images/site_1.png",
  },
  {
    id: 2,
    label: "Site Image 2",
    url: "/site_images/site_2.png",
  },
  {
    id: 3,
    label: "Site Image 3",
    url: "/site_images/site_3.png",
  },
  {
    id: 4,
    label: "Site Image 4",
    url: "/site_images/site_4.png",
  },
  {
    id: 5,
    label: "Site Image 5",
    url: "/site_images/site_5.png",
  },
];

const SitePhotos = () => {
  const setSitePhotosOpen = useSitePhotosStore((s) => s.setSitePhotosOpen);
  const { data: currTower } = useTower(useTowerStore((s) => s.selectedTowerId));

  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = PLACEHOLDER_PHOTOS[selectedIndex];

  const prev = () =>
    setSelectedIndex(
      (i) => (i - 1 + PLACEHOLDER_PHOTOS.length) % PLACEHOLDER_PHOTOS.length,
    );
  const next = () =>
    setSelectedIndex((i) => (i + 1) % PLACEHOLDER_PHOTOS.length);
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative flex flex-col w-[82vw] max-w-5xl max-h-[88vh] rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">
              Site Photos
            </p>
            <h2 className="text-base font-bold text-slate-800 leading-none">
              {currTower?.thingId ?? "—"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Meta pills */}
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {currTower?.attributes?.installation_type ?? "—"}
            </span>
            <span className="w-px h-4 bg-slate-200" />
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full capitalize">
              {currTower?.attributes?.structure_type?.replace(/_/g, " ") ?? "—"}
            </span>
            <span className="w-px h-4 bg-slate-200" />

            {/* Close */}
            <button
              onClick={() => setSitePhotosOpen(false)}
              className="rounded-full p-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition"
            >
              <RxCross2 size={18} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main photo */}
          <div className="flex-1 flex flex-col p-5 gap-3 overflow-hidden">
            <div className="relative flex-1 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center">
              <img
                src={selected.url}
                alt={selected.label}
                className="max-w-full max-h-full object-contain"
              />

              {/* Left arrow */}
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-2 bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm text-slate-600 hover:bg-white hover:text-slate-900 transition"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              {/* Right arrow */}
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm text-slate-600 hover:bg-white hover:text-slate-900 transition"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              {/* Label overlay */}
              <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                {selected.label}
              </div>
            </div>
            {/* Photo count */}
            <p className="text-xs text-slate-400 text-right">
              {PLACEHOLDER_PHOTOS.findIndex((p) => p.id === selected.id) + 1} /{" "}
              {PLACEHOLDER_PHOTOS.length} photos
            </p>
          </div>

          {/* ── Thumbnail strip ── */}
          <div className="w-44 flex flex-col gap-2 py-5 pr-5 overflow-y-auto shrink-0">
            {PLACEHOLDER_PHOTOS.map((photo, idx) => (
              <button
                key={photo.id}
                onClick={() => setSelectedIndex(idx)}
                className={`relative rounded-xl overflow-hidden border-2 transition-all shrink-0 aspect-video ${
                  selected.id === photo.id
                    ? "border-sky-500 shadow-md shadow-sky-100"
                    : "border-transparent hover:border-slate-300"
                }`}
              >
                <img
                  src={photo.url}
                  alt={photo.label}
                  className="w-full h-full object-cover"
                />
                {/* Active indicator */}
                {selected.id === photo.id && (
                  <div className="absolute inset-0 bg-sky-500/10" />
                )}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent px-1.5 py-1">
                  <p className="text-white text-[9px] font-medium truncate">
                    {photo.label}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Blue bottom accent bar */}
        <div className="h-[3px] bg-gradient-to-r from-sky-500 to-blue-400 shrink-0" />
      </div>
    </div>
  );
};

export default SitePhotos;
