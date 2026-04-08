import React, { useState, useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import { useSitePhotosStore } from "@/app/store/useTowerStore";
import { useTowerStore } from "@/app/store/useTowerStore";
import { useTower } from "@/app/hooks/getTowers";
import { getMappedSiteImages } from "@/app/api/endpoints";

type Photo = { id: number; label: string; url: string };

const EXTS = ["png", "jpg", "jpeg", "webp"];
const MAX = 5;

const toFolder = (thingId: string) =>
  thingId.includes(":") ? thingId.split(":").pop()! : thingId;

const SitePhotos = () => {
  const setSitePhotosOpen = useSitePhotosStore((s) => s.setSitePhotosOpen);
  const { data: currTower } = useTower(useTowerStore((s) => s.selectedTowerId));

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const thingId = currTower?.thingId ?? "";
  const selected = photos[selectedIndex];

  useEffect(() => {
    if (!thingId) return;

    const loadImages = async () => {
      setLoading(true);
      setPhotos([]);
      setSelectedIndex(0);

      try {
        const photos = await getMappedSiteImages(thingId);
        setPhotos(photos);
      } catch {
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [thingId]);

  const prev = () =>
    setSelectedIndex((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setSelectedIndex((i) => (i + 1) % photos.length);

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
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {currTower?.attributes?.installation_type ?? "—"}
            </span>
            <span className="w-px h-4 bg-slate-200" />
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full capitalize">
              {currTower?.attributes?.structure_type?.replace(/_/g, " ") ?? "—"}
            </span>
            <span className="w-px h-4 bg-slate-200" />
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
          <div className="flex-1 flex flex-col p-5 gap-3 overflow-hidden">
            {/* Loading */}
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
                <svg
                  className="animate-spin w-5 h-5"
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
                <p className="text-sm">Loading photos…</p>
              </div>
            ) : photos.length === 0 ? (
              /* ── Empty state ── */
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
                <p className="text-sm font-medium text-slate-500">
                  No site photos available
                </p>
              </div>
            ) : (
              /* ── Main photo ── */
              <div className="relative flex-1 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center">
                <img
                  src={selected.url}
                  alt={selected.label}
                  className="max-w-full max-h-full object-contain"
                />

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

                {/* ── Label (bottom-left) ── */}
                <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                  {selected.label}
                </div>

                {/* ── Download (bottom-right) ── */}
                <div className="group absolute bottom-3 right-3 rounded-full p-2 bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm text-slate-600 hover:bg-white hover:text-slate-900 transition">
                  <a
                    href={selected.url}
                    download={selected.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className=""
                    title="Download photo"
                  >
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
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </a>
                  <span className="pointer-events-none absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-800 text-white text-[10px] font-medium px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    Download Images
                  </span>
                </div>
              </div>
            )}

            {photos.length > 0 && (
              <p className="text-xs text-slate-400 text-right">
                {selectedIndex + 1} / {photos.length} photos
              </p>
            )}
          </div>

          {/* ── Thumbnail strip ── */}
          {photos.length > 0 && (
            <div className="w-44 flex flex-col gap-2 py-5 pr-5 overflow-y-auto shrink-0">
              {photos.map((photo, idx) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all shrink-0 aspect-video ${
                    selectedIndex === idx
                      ? "border-sky-500 shadow-md shadow-sky-100"
                      : "border-transparent hover:border-slate-300"
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={photo.label}
                    className="w-full h-full object-cover"
                  />
                  {selectedIndex === idx && (
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
          )}
        </div>

        <div className="h-[3px] bg-gradient-to-r from-sky-500 to-blue-400 shrink-0" />
      </div>
    </div>
  );
};

export default SitePhotos;
