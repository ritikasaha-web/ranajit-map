"use client";

import { getTwinsWithFilter, TwinItem } from "@/app/ditto/twins";
import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTowerStore } from "@/app/store/useTowerStore";

type SiteFilter = "all" | "up" | "down" | "critical_fault" | "high_temp";

const SITE_OPTIONS: {
  id: SiteFilter;
  label: string;
  icon: React.ReactNode;
  filter: string;
}[] = [
  {
    id: "all",
    label: "All Sites",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M7 1C7 1 4.5 4 4.5 7s2.5 6 2.5 6"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M7 1c0 0 2.5 3 2.5 6S7 13 7 13"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M1 7h12"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
    filter: "",
  },
  {
    id: "up",
    label: "Up Sites",
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M6 10V2M2 6l4-4 4 4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    filter: "le(attributes/down_time,0)",
  },
  {
    id: "down",
    label: "Down Sites",
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M6 2v8M2 6l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    filter: "gt(attributes/down_time,0)",
  },
  {
    id: "critical_fault",
    label: "Critical Faults",
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M6 1.5L1 10.5h10L6 1.5z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M6 5v2.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="6" cy="9" r="0.6" fill="currentColor" />
      </svg>
    ),
    filter: "eq(attributes/critical_fault,true)",
  },
  {
    id: "high_temp",
    label: "High Temperature",
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <rect
          x="4.5"
          y="1"
          width="3"
          height="6.5"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <circle cx="6" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
    filter: "gt(attributes/temperature,40)",
  },
];

async function fetchFilteredTwins(
  filterStr: string,
  onChunk: (towers: TwinItem[]) => void,
): Promise<void> {
  let accumulated: TwinItem[] = [];
  const existingIds = new Set<string>();

  await getTwinsWithFilter(filterStr, (chunk) => {
    const uniqueChunk = chunk.filter((t: TwinItem) => {
      if (existingIds.has(t.thingId)) return false;
      existingIds.add(t.thingId);
      return true;
    });
    if (uniqueChunk.length > 0) {
      accumulated = [...accumulated, ...uniqueChunk];
      onChunk(accumulated);
    }
  });
}

export default function FilterBar() {
  const queryClient = useQueryClient();
  const setActiveSiteFilter = useTowerStore((s) => s.setActiveSiteFilter);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<SiteFilter>("all");
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Imperative fetch — bypasses React Query cache entirely so every click always re-fetches
  const runFilter = useCallback(
    async (id: SiteFilter) => {
      const option = SITE_OPTIONS.find((o) => o.id === id)!;
      setFetchError(null);
      setLoading(true);

      try {
        if (id === "all") {
          // Clear filtered data then restore the normal towers query
          queryClient.setQueryData(["towers"], []);
          await queryClient.invalidateQueries({
            queryKey: ["towers"],
            refetchType: "all",
          });
        } else {
          // Wipe stale data immediately so the map empties while fetching
          queryClient.setQueryData(["towers"], []);

          await fetchFilteredTwins(option.filter, (accumulated) => {
            queryClient.setQueryData(["towers"], accumulated);
          });
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load towers.";
        setFetchError(message);
      } finally {
        setLoading(false);
      }
    },
    [queryClient],
  );

  const handleSelect = useCallback(
    async (id: SiteFilter) => {
      setActive(id);
      setActiveSiteFilter(id);
      setOpen(false);
      await runFilter(id);
    },
    [runFilter, setActiveSiteFilter],
  );

  return (
    <>
      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .filter-panel {
          animation: dropIn 0.15s cubic-bezier(0.34,1.56,0.64,1) both;
        }
      `}</style>

      <div className="absolute font-rubik top-0 left-3 z-[1000] w-52 rounded-[20px] bg-white/15 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-visible font-sans">
        {/* Header / Toggle */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-[20px] hover:bg-black/[0.02] transition-colors duration-150"
        >
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 2.5h12M3.5 7h7M6 11.5h2"
                stroke="#1c1c1e"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-[13px] font-semibold text-gray-900 tracking-tight">
              Sites
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {loading && (
              <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            )}
            <div
              className={`
                w-5 h-5 rounded-full flex items-center justify-center text-[9px]
                transition-all duration-200
                ${open ? "bg-blue-100 text-blue-500 rotate-180" : "bg-black/[0.06] text-gray-500"}
              `}
            >
              ▾
            </div>
          </div>
        </button>

        {/* Collapsible panel */}
        {open && (
          <>
            <div className="h-px bg-black/[0.06] mx-3.5" />

            <div className="filter-panel p-2 flex flex-col gap-0.5">
              {SITE_OPTIONS.map((opt) => {
                const isActive = active === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={loading}
                    onClick={() => handleSelect(opt.id)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm
                      transition-all duration-150 active:scale-[0.97]
                      ${isActive ? "bg-gray-900 text-white shadow-sm" : "text-gray-700 hover:bg-black/[0.05]"}
                      ${loading ? "cursor-not-allowed opacity-60" : ""}
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex-shrink-0 ${isActive ? "opacity-100" : "opacity-40"}`}
                      >
                        {opt.icon}
                      </span>
                      <span
                        className={`text-[13px] ${isActive ? "font-semibold" : "font-medium"}`}
                      >
                        {opt.label}
                      </span>
                    </div>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-white flex-shrink-0" />
                    )}
                  </button>
                );
              })}

              {fetchError && (
                <div className="flex items-center gap-1.5 px-2.5 py-2 bg-red-50 border border-red-100 rounded-xl mt-1">
                  <svg
                    className="w-3.5 h-3.5 text-red-400 flex-shrink-0"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M8 5v3.5M8 11v.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-[11px] text-red-600">{fetchError}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
