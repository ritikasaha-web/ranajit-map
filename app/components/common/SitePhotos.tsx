"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RxCross2 } from "react-icons/rx";
import {
  useSitePhotosStore,
  useTowerStore,
  useUploadStore,
} from "@/app/store/useTowerStore";
import { useTower } from "@/app/hooks/getTowers";
import {
  getMappedSiteImages,
  setDefaultSiteImage,
  deleteSiteImage,
} from "@/app/api/endpoints";

// ✅ Added 'default' boolean to the Photo type
type Photo = { id: number; label: string; url: string; default?: boolean };

const bustUrl = (url: string, cb: number) =>
  url.includes("?") ? `${url}&cb=${cb}` : `${url}?cb=${cb}`;

const SitePhotos = () => {
  const setSitePhotosOpen = useSitePhotosStore((s) => s.setSitePhotosOpen);
  const setUploadOpen = useUploadStore((s) => s.setUploadOpen);
  const { data: currTower } = useTower(useTowerStore((s) => s.selectedTowerId));
  const queryClient = useQueryClient();

  const [selectedIndex, setSelectedIndex] = useState(0);

  const thingId = currTower?.thingId ?? "";

  const {
    data: photos = [],
    isLoading: loading,
    dataUpdatedAt,
  } = useQuery<Photo[]>({
    queryKey: ["siteImages", thingId],
    queryFn: () => getMappedSiteImages(thingId),
    enabled: !!thingId,
  });

  // Mutation to handle saving the default image to the backend
  const { mutate: setAsDefault, isPending: isSettingDefault } = useMutation({
    mutationFn: (imageUrl: string) => setDefaultSiteImage(thingId, imageUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siteImages", thingId] });
    },
  });

  // ✅ Mutation to handle deleting an image
  const { mutate: deleteImage, isPending: isDeleting } = useMutation({
    mutationFn: (imageUrl: string) => deleteSiteImage(thingId, imageUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siteImages", thingId] });
      // Reset index to 0 so we don't point to an index that no longer exists
      setSelectedIndex(0);
    },
  });

  // Reset selected index when thingId changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [thingId]);

  const selected = photos[selectedIndex]
    ? {
        ...photos[selectedIndex],
        url: bustUrl(photos[selectedIndex].url, dataUpdatedAt),
      }
    : undefined;

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
            <button
              className="bg-[#0084cc] hover:bg-[#0073b3] text-white font-bold py-1 px-3 rounded-full transition-colors duration-200 ease-in-out focus:outline-none text-xs text-center cursor-pointer"
              onClick={() => setUploadOpen(true)}
            >
              Upload
            </button>
            <span className="w-px h-4 bg-slate-200" />
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
              className="rounded-full cursor-pointer p-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition"
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
                  src={selected?.url ?? ""}
                  alt={selected?.label ?? ""}
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

                {/* ✅ LABEL & DELETE ICON (bottom-left) */}
                <div className="group absolute bottom-3 left-3 flex items-center gap-2">
                  <div className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                    {selected?.label ?? ""}
                  </div>

                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this photo permanently?",
                        )
                      ) {
                        deleteImage(photos[selectedIndex].url);
                      }
                    }}
                    disabled={isDeleting}
                    className="p-1.5 cursor-pointer bg-white/90 backdrop-blur-sm text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 rounded-full border border-slate-200 shadow-sm transition"
                  >
                    {isDeleting ? (
                      <svg
                        className="animate-spin w-3.5 h-3.5 text-red-500"
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
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    )}
                  </button>
                  <span className="pointer-events-none absolute left-28 mr-2  whitespace-nowrap rounded-md bg-slate-800 text-white text-[10px] font-medium px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    Delete Site Image
                  </span>
                </div>

                {/* SET DEFAULT / SAVE CONTROLS (bottom-center) */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-sm p-1 rounded-full border border-slate-200 shadow-sm">
                  {selected?.default ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      Default Photo
                    </div>
                  ) : (
                    <button
                      onClick={() => setAsDefault(photos[selectedIndex].url)}
                      disabled={isSettingDefault}
                      className="flex cursor-pointer items-center gap-1.5 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-full text-xs font-medium transition"
                    >
                      {isSettingDefault ? (
                        "Saving..."
                      ) : (
                        <>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                          </svg>
                          Set & Save Default
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* ── Download (bottom-right) ── */}
                <div className="group absolute bottom-3 right-3 rounded-full p-2 bg-white/90 backdrop-blur-sm border border-slate-200 shadow-sm text-slate-600 hover:bg-white hover:text-slate-900 transition">
                  <a
                    href={selected?.url ?? "#"}
                    download={selected?.label ?? ""}
                    target="_blank"
                    rel="noopener noreferrer"
                    // title="Download photo"
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
                  <span className="pointer-events-none absolute right-7 mr-2 bottom-1 whitespace-nowrap rounded-md bg-slate-800 text-white text-[10px] font-medium px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    Download Image
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
                    src={bustUrl(photo.url, dataUpdatedAt)}
                    alt={photo.label}
                    className="w-full h-full object-cover"
                  />
                  {selectedIndex === idx && (
                    <div className="absolute inset-0 bg-sky-500/10" />
                  )}
                  {/* Star indicator on thumbnail if it's default */}
                  {photo.default && (
                    <div className="absolute top-1 left-1 bg-green-500 text-white p-0.5 rounded-full shadow-sm">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
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

//for static site iamges..... ->>

// "use client";

// import React, { useState, useEffect } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { RxCross2 } from "react-icons/rx";
// import {
//   useSitePhotosStore,
//   useTowerStore,
//   useUploadStore,
// } from "@/app/store/useTowerStore";
// import { useTower } from "@/app/hooks/getTowers";
// import {
//   getMappedSiteImages,
//   setDefaultSiteImage,
//   deleteSiteImage,
// } from "@/app/api/endpoints";
// import { STATIC_PHOTOS } from "@/app/constants/component_names";

// // ✅ Added 'default' boolean to the Photo type
// type Photo = { id: number; label: string; url: string; default?: boolean };

// const bustUrl = (url: string, cb: number) =>
//   url.includes("?") ? `${url}&cb=${cb}` : `${url}?cb=${cb}`;

// const SitePhotos = () => {
//   const setSitePhotosOpen = useSitePhotosStore((s) => s.setSitePhotosOpen);
//   const setUploadOpen = useUploadStore((s) => s.setUploadOpen);
//   const { data: currTower } = useTower(useTowerStore((s) => s.selectedTowerId));
//   const queryClient = useQueryClient();

//   const [selectedIndex, setSelectedIndex] = useState(0);

//   const thingId = currTower?.thingId ?? "";

//   // const {
//   //   data: photos = [],
//   //   isLoading: loading,
//   //   dataUpdatedAt,
//   // } = useQuery<Photo[]>({
//   //   queryKey: ["siteImages", thingId],
//   //   queryFn: () => getMappedSiteImages(thingId),
//   //   enabled: !!thingId,
//   // });
//   // 1. Add this constant near the top of the file (outside the component)

//   // 2. Replace the existing useQuery block with this

//   const siteId = thingId.includes(":") ? thingId.split(":").pop()! : thingId;

//   const isStatic = !!siteId && siteId in STATIC_PHOTOS;
//   const photos: Photo[] = isStatic ? STATIC_PHOTOS[siteId] : [];

//   const {
//     data: fetchedPhotos = [],
//     isLoading: loading,
//     dataUpdatedAt,
//   } = useQuery<Photo[]>({
//     queryKey: ["siteImages", thingId],
//     queryFn: () => getMappedSiteImages(thingId),
//     enabled: !!thingId && !isStatic,
//   });
//   const showLoading = !isStatic && loading;

//   const finalPhotos = isStatic ? photos : fetchedPhotos;

//   // Mutation to handle saving the default image to the backend
//   const { mutate: setAsDefault, isPending: isSettingDefault } = useMutation({
//     mutationFn: (imageUrl: string) => setDefaultSiteImage(thingId, imageUrl),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["siteImages", thingId] });
//     },
//   });
//   // console.log("thingId:", JSON.stringify(thingId));
//   // console.log("isStatic:", isStatic);
//   // console.log("finalPhotos:", finalPhotos);

//   // ✅ Mutation to handle deleting an image
//   const { mutate: deleteImage, isPending: isDeleting } = useMutation({
//     mutationFn: (imageUrl: string) => deleteSiteImage(thingId, imageUrl),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["siteImages", thingId] });
//       // Reset index to 0 so we don't point to an index that no longer exists
//       setSelectedIndex(0);
//     },
//   });

//   // Reset selected index when thingId changes
//   useEffect(() => {
//     setSelectedIndex(0);
//   }, [thingId]);

//   const selected = finalPhotos[selectedIndex]
//     ? {
//         ...finalPhotos[selectedIndex],
//         url: isStatic
//           ? finalPhotos[selectedIndex].url
//           : bustUrl(finalPhotos[selectedIndex].url, dataUpdatedAt),
//       }
//     : undefined;

//   const prev = () =>
//     setSelectedIndex((i) => (i - 1 + finalPhotos.length) % finalPhotos.length);
//   const next = () => setSelectedIndex((i) => (i + 1) % finalPhotos.length);

//   return (
//     <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
//       <div className="relative flex flex-col w-[82vw] max-w-5xl max-h-[88vh] rounded-3xl bg-white shadow-2xl overflow-hidden">
//         {/* ── Header ── */}
//         <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
//           <div>
//             <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">
//               Site Photos1
//             </p>
//             <h2 className="text-base font-bold text-slate-800 leading-none">
//               {currTower?.thingId ?? "—"}
//             </h2>
//           </div>

//           <div className="flex items-center gap-3">
//             <button
//               className="bg-[#0084cc] hover:bg-[#0073b3] text-white font-bold py-1 px-3 rounded-full transition-colors duration-200 ease-in-out focus:outline-none text-xs text-center cursor-pointer"
//               onClick={() => setUploadOpen(true)}
//             >
//               Upload
//             </button>
//             <span className="w-px h-4 bg-slate-200" />
//             <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
//               {currTower?.attributes?.installation_type ?? "—"}
//             </span>
//             <span className="w-px h-4 bg-slate-200" />
//             <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full capitalize">
//               {currTower?.attributes?.structure_type?.replace(/_/g, " ") ?? "—"}
//             </span>
//             <span className="w-px h-4 bg-slate-200" />

//             <button
//               onClick={() => setSitePhotosOpen(false)}
//               className="rounded-full cursor-pointer p-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition"
//             >
//               <RxCross2 size={18} />
//             </button>
//           </div>
//         </div>

//         {/* ── Body ── */}
//         <div className="flex flex-1 overflow-hidden">
//           <div className="flex-1 flex flex-col p-5 gap-3 overflow-hidden">
//             {/* Loading */}
//             {showLoading ? (
//               <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
//                 <svg
//                   className="animate-spin w-5 h-5"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   />
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8v8z"
//                   />
//                 </svg>
//                 <p className="text-sm">Loading photos…</p>
//               </div>
//             ) : finalPhotos.length === 0 ? (
//               /* ── Empty state ── */
//               <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
//                 <svg
//                   width="48"
//                   height="48"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth={1.2}
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 >
//                   <rect x="3" y="3" width="18" height="18" rx="2" />
//                   <circle cx="8.5" cy="8.5" r="1.5" />
//                   <polyline points="21 15 16 10 5 21" />
//                   <line x1="2" y1="2" x2="22" y2="22" />
//                 </svg>
//                 <p className="text-sm font-medium text-slate-500">
//                   No site photos1 available
//                 </p>
//               </div>
//             ) : (
//               /* ── Main photo ── */
//               <div className="relative flex-1 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center">
//                 <img
//                   src={selected?.url ?? ""}
//                   alt={selected?.label ?? ""}
//                   className="max-w-full max-h-full object-contain"
//                 />

//                 <button
//                   onClick={prev}
//                   className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-2 bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm text-slate-600 hover:bg-white hover:text-slate-900 transition"
//                 >
//                   <svg
//                     width="16"
//                     height="16"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth={2.5}
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <path d="M15 18l-6-6 6-6" />
//                   </svg>
//                 </button>

//                 <button
//                   onClick={next}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm text-slate-600 hover:bg-white hover:text-slate-900 transition"
//                 >
//                   <svg
//                     width="16"
//                     height="16"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth={2.5}
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <path d="M9 18l6-6-6-6" />
//                   </svg>
//                 </button>

//                 {/* ✅ LABEL & DELETE ICON (bottom-left) */}
//                 <div className="group absolute bottom-3 left-3 flex items-center gap-2">
//                   <div className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
//                     {selected?.label ?? ""}
//                   </div>

//                   <button
//                     onClick={() => {
//                       if (
//                         window.confirm(
//                           "Are you sure you want to delete this photo permanently?",
//                         )
//                       ) {
//                         deleteImage(finalPhotos[selectedIndex].url);
//                       }
//                     }}
//                     disabled={isDeleting}
//                     className="p-1.5 cursor-pointer bg-white/90 backdrop-blur-sm text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 rounded-full border border-slate-200 shadow-sm transition"
//                   >
//                     {isDeleting ? (
//                       <svg
//                         className="animate-spin w-3.5 h-3.5 text-red-500"
//                         viewBox="0 0 24 24"
//                         fill="none"
//                       >
//                         <circle
//                           className="opacity-25"
//                           cx="12"
//                           cy="12"
//                           r="10"
//                           stroke="currentColor"
//                           strokeWidth="4"
//                         />
//                         <path
//                           className="opacity-75"
//                           fill="currentColor"
//                           d="M4 12a8 8 0 018-8v8z"
//                         />
//                       </svg>
//                     ) : (
//                       <svg
//                         width="14"
//                         height="14"
//                         viewBox="0 0 24 24"
//                         fill="none"
//                         stroke="currentColor"
//                         strokeWidth="2.5"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       >
//                         <polyline points="3 6 5 6 21 6" />
//                         <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
//                       </svg>
//                     )}
//                   </button>
//                   <span className="pointer-events-none absolute left-28 mr-2  whitespace-nowrap rounded-md bg-slate-800 text-white text-[10px] font-medium px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
//                     Delete Site Image
//                   </span>
//                 </div>

//                 {/* SET DEFAULT / SAVE CONTROLS (bottom-center) */}
//                 <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-sm p-1 rounded-full border border-slate-200 shadow-sm">
//                   {selected?.default ? (
//                     <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">
//                       <svg
//                         width="14"
//                         height="14"
//                         viewBox="0 0 24 24"
//                         fill="currentColor"
//                       >
//                         <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
//                       </svg>
//                       Default Photo
//                     </div>
//                   ) : (
//                     <button
//                       onClick={() =>
//                         setAsDefault(finalPhotos[selectedIndex].url)
//                       }
//                       disabled={isSettingDefault}
//                       className="flex cursor-pointer items-center gap-1.5 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-full text-xs font-medium transition"
//                     >
//                       {isSettingDefault ? (
//                         "Saving..."
//                       ) : (
//                         <>
//                           <svg
//                             width="14"
//                             height="14"
//                             viewBox="0 0 24 24"
//                             fill="none"
//                             stroke="currentColor"
//                             strokeWidth="2.5"
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                           >
//                             <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
//                             <polyline points="17 21 17 13 7 13 7 21"></polyline>
//                             <polyline points="7 3 7 8 15 8"></polyline>
//                           </svg>
//                           Set & Save Default
//                         </>
//                       )}
//                     </button>
//                   )}
//                 </div>

//                 {/* ── Download (bottom-right) ── */}
//                 <div className="group absolute bottom-3 right-3 rounded-full p-2 bg-white/90 backdrop-blur-sm border border-slate-200 shadow-sm text-slate-600 hover:bg-white hover:text-slate-900 transition">
//                   <a
//                     href={selected?.url ?? "#"}
//                     download={selected?.label ?? ""}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     // title="Download photo"
//                   >
//                     <svg
//                       width="14"
//                       height="14"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth={2.5}
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     >
//                       <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
//                       <polyline points="7 10 12 15 17 10" />
//                       <line x1="12" y1="15" x2="12" y2="3" />
//                     </svg>
//                   </a>
//                   <span className="pointer-events-none absolute right-7 mr-2 bottom-1 whitespace-nowrap rounded-md bg-slate-800 text-white text-[10px] font-medium px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
//                     Download Image
//                   </span>
//                 </div>
//               </div>
//             )}

//             {finalPhotos.length > 0 && (
//               <p className="text-xs text-slate-400 text-right">
//                 {selectedIndex + 1} / {finalPhotos.length} photos
//               </p>
//             )}
//           </div>

//           {/* ── Thumbnail strip ── */}
//           {finalPhotos.length > 0 && (
//             <div className="w-44 flex flex-col gap-2 py-5 pr-5 overflow-y-auto shrink-0">
//               {finalPhotos.map((photo, idx) => (
//                 <button
//                   key={photo.id}
//                   onClick={() => setSelectedIndex(idx)}
//                   className={`relative rounded-xl overflow-hidden border-2 transition-all shrink-0 aspect-video ${
//                     selectedIndex === idx
//                       ? "border-sky-500 shadow-md shadow-sky-100"
//                       : "border-transparent hover:border-slate-300"
//                   }`}
//                 >
//                   <img
//                     src={
//                       isStatic ? photo.url : bustUrl(photo.url, dataUpdatedAt)
//                     }
//                     alt={photo.label}
//                     className="w-full h-full object-cover"
//                   />
//                   {selectedIndex === idx && (
//                     <div className="absolute inset-0 bg-sky-500/10" />
//                   )}
//                   {/* Star indicator on thumbnail if it's default */}
//                   {photo.default && (
//                     <div className="absolute top-1 left-1 bg-green-500 text-white p-0.5 rounded-full shadow-sm">
//                       <svg
//                         width="10"
//                         height="10"
//                         viewBox="0 0 24 24"
//                         fill="currentColor"
//                       >
//                         <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
//                       </svg>
//                     </div>
//                   )}
//                   <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent px-1.5 py-1">
//                     <p className="text-white text-[9px] font-medium truncate">
//                       {photo.label}
//                     </p>
//                   </div>
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>

//         <div className="h-[3px] bg-gradient-to-r from-sky-500 to-blue-400 shrink-0" />
//       </div>
//     </div>
//   );
// };

// export default SitePhotos;
