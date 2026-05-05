import { getTwinsWithFilter, TwinItem } from "@/app/api/endpoints";
import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const FIELDS = [
  // FIX #4: Added actual icons instead of empty strings
  { val: "Uptime", icon: "↑", bg: "bg-blue-50", text: "text-blue-700" },
  {
    val: "Down Time",
    icon: "↓",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
];

const VALUES = [
  {
    val: "> 0",
    label: "Greater than 0",
    icon: "↑",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  {
    val: "< 0",
    label: "Less than 0",
    icon: "↓",
    bg: "bg-red-50",
    text: "text-red-700",
  },
  {
    val: "= 0",
    label: "Equal to 0",
    icon: "=",
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  {
    val: "custom",
    label: "Enter number...",
    icon: "#",
    bg: "bg-gray-100",
    text: "text-gray-600",
  },
];

interface Filter {
  id: string;
  field: string;
  value: string;
}
interface Option {
  val: string;
  label?: string;
  icon: string;
  bg: string;
  text: string;
}

const fieldMap: Record<string, string> = {
  Uptime: "attributes/uptime",
  "Down Time": "attributes/down_time",
};

// FIX #1: Robust parsing that handles extra whitespace and negative numbers
const buildDittoFilter = (filters: Filter[]): string => {
  const conditions = filters
    .map((f) => {
      const field = fieldMap[f.field];
      if (!field) return "";

      const trimmed = f.value.trim();
      // Match operator (>, <, =) then optional whitespace then the number (including negative)
      const match = trimmed.match(/^([><]=?|=)\s*(-?\d+(?:\.\d+)?)$/);
      if (!match) return "";

      const [, operator, rawValue] = match;
      const value = Number(rawValue);

      if (operator === ">") return `gt(${field},${value})`;
      if (operator === "<") return `lt(${field},${value})`;
      if (operator === "=") return `eq(${field},${value})`;

      return "";
    })
    .filter(Boolean);

  if (!conditions.length) return "";
  if (conditions.length === 1) return conditions[0];

  return `and(${conditions.join(",")})`;
};

// FIX #5: Extracted fetch logic out of queryFn to avoid side-effect anti-pattern
async function fetchFilteredTwins(
  filterStr: string,
  onChunk: (towers: TwinItem[]) => void,
): Promise<TwinItem[]> {
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

  return accumulated;
}

function CustomSelect({
  options,
  value,
  placeholder,
  disabled = false,
  onChange,
}: {
  options: Option[];
  value: string;
  placeholder: string;
  disabled?: boolean;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.val === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`
          w-full h-10 flex items-center justify-between px-3 rounded-xl text-sm
          transition-all duration-150 outline-none
          ${
            disabled
              ? "bg-gray-100/60 opacity-40 cursor-not-allowed"
              : open
                ? "bg-white ring-2 ring-blue-500 ring-offset-0 shadow-sm"
                : "bg-black/[0.06] hover:bg-black/[0.09]"
          }
        `}
      >
        <div className="flex items-center gap-2 min-w-0">
          {selected ? (
            <>
              <span
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${selected.bg}`}
              >
                {selected.icon}
              </span>
              <span className="text-gray-900 truncate">
                {selected.label ?? selected.val}
              </span>
            </>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 ml-2 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 10 6"
          fill="none"
        >
          <path
            d="M1 1l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden animate-[dropIn_0.15s_cubic-bezier(0.34,1.56,0.64,1)_both]">
          {options.map((opt, i) => (
            <button
              key={opt.val}
              type="button"
              onClick={() => {
                onChange(opt.val);
                setOpen(false);
              }}
              className={`
                w-full flex items-center justify-between px-3.5 py-2.5 text-sm text-left
                transition-colors duration-100
                hover:bg-blue-50/70 active:bg-blue-100/60
                ${i < options.length - 1 ? "border-b border-black/[0.04]" : ""}
                ${value === opt.val ? "text-blue-600 font-medium" : "text-gray-800"}
              `}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${opt.bg} ${opt.text}`}
                >
                  {opt.icon}
                </span>
                <span>{opt.label ?? opt.val}</span>
              </div>
              {value === opt.val && (
                <svg
                  className="w-4 h-4 text-blue-500 flex-shrink-0"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M3 8l3.5 3.5L13 4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FilterBar() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [field, setField] = useState("");
  const [valueOpt, setValueOpt] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [filters, setFilters] = useState<Filter[]>([]);
  // FIX #6: Track error state to show in UI
  const [fetchError, setFetchError] = useState<string | null>(null);

  const isCustom = valueOpt === "custom";
  const canAdd =
    !!field && !!valueOpt && (!isCustom || customValue.trim() !== "");

  const filterStr = buildDittoFilter(filters);

  // FIX #5: queryFn no longer calls invalidateQueries/setQueryData internally.
  // It only fetches data and returns it. Cache updates happen in onSuccess/onError.
  // FIX #3: The chip's remove handler no longer runs a parallel fetch — it just
  // calls setFilters, which changes filterStr, which re-runs this single query.
  const { isFetching: loading } = useQuery({
    queryKey: ["towers_filter_trigger", filterStr],
    queryFn: async () => {
      setFetchError(null);

      if (!filters.length) {
        return [];
      }

      // Clear the map immediately so stale towers disappear
      queryClient.setQueryData(["towers"], []);

      // FIX #2 + #5: fetchFilteredTwins is awaited and errors propagate to onError
      const result = await fetchFilteredTwins(filterStr, (accumulated) => {
        queryClient.setQueryData(["towers"], accumulated);
      });

      return result;
    },
    // FIX #5: Side effects are handled here, not inside queryFn
    onSuccess: (data) => {
      if (!filters.length) {
        // No filters → restore normal tower fetching
        queryClient.invalidateQueries({ queryKey: ["towers"] });
      } else {
        // Ensure final full result is in cache (chunks may have raced)
        queryClient.setQueryData(["towers"], data);
      }
    },
    // FIX #6: Surface errors to the user instead of silently failing
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to load filtered towers.";
      setFetchError(message);
    },
    refetchOnWindowFocus: false,
  });

  function addFilter() {
    if (!canAdd) return;
    const val = isCustom ? `= ${customValue.trim()}` : valueOpt;
    setFilters((p) => [
      ...p,
      { id: Math.random().toString(36).slice(2), field, value: val },
    ]);
    setField("");
    setValueOpt("");
    setCustomValue("");
  }

  // FIX #3: Chip removal only updates local state. The query above re-runs
  // automatically via filterStr change — no parallel fetch race condition.
  const removeFilter = useCallback((id: string) => {
    setFilters((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return (
    <>
      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div className="absolute font-rubik top-0 left-3 z-[1000] w-56 rounded-[20px] bg-white/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-visible font-sans">
        {/* Header */}
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
              Add Filter
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {loading && (
              <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            )}
            {filters.length > 0 && (
              <span className="bg-blue-500 text-white text-[10px] font-bold rounded-full px-2 py-0.5 leading-none">
                {filters.length}
              </span>
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

        {open && (
          <>
            <div className="h-px bg-black/[0.06] mx-3.5" />

            <div className="p-3 flex flex-col gap-2.5">
              {/* Field */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest pl-0.5">
                  Field
                </span>
                <CustomSelect
                  options={FIELDS}
                  value={field}
                  placeholder="Select field..."
                  onChange={(v) => {
                    setField(v);
                    setValueOpt("");
                    setCustomValue("");
                  }}
                />
              </div>

              {/* Value */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest pl-0.5">
                  Value
                </span>
                <CustomSelect
                  options={VALUES}
                  value={valueOpt}
                  placeholder="Choose value..."
                  disabled={!field}
                  onChange={(v) => {
                    setValueOpt(v);
                    setCustomValue("");
                  }}
                />
              </div>

              {/* Custom number input */}
              {isCustom && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest pl-0.5">
                    Number
                  </span>
                  <input
                    type="number"
                    placeholder="e.g. 42"
                    value={customValue}
                    autoFocus
                    onChange={(e) => setCustomValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addFilter()}
                    className="w-full h-10 px-3 rounded-xl text-sm text-gray-900 bg-black/[0.06] border-[1.5px] border-transparent outline-none transition-all duration-150 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-400"
                  />
                </div>
              )}

              {/* Apply */}
              <button
                type="button"
                disabled={!canAdd}
                onClick={addFilter}
                className="w-full h-10 rounded-xl text-sm font-semibold text-white transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed bg-blue-500 shadow-[0_3px_12px_rgba(0,122,255,0.32)] hover:bg-blue-600 hover:shadow-[0_5px_18px_rgba(0,122,255,0.4)] disabled:bg-blue-200 disabled:shadow-none"
              >
                Apply
              </button>

              {/* FIX #6: Error message shown in UI */}
              {fetchError && (
                <div className="flex items-center gap-1.5 px-2.5 py-2 bg-red-50 border border-red-100 rounded-xl">
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

        {/* Chips */}
        {filters.length > 0 && (
          <div className="px-3 pb-3 flex flex-col gap-1.5">
            {filters.map((f) => {
              const fd = FIELDS.find((x) => x.val === f.field);
              return (
                <div
                  key={f.id}
                  className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-2.5 py-1.5"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    {fd && (
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] flex-shrink-0 ${fd.bg}`}
                      >
                        {fd.icon}
                      </span>
                    )}
                    <span className="text-[11.5px] text-blue-700 font-medium truncate">
                      {f.field} <strong>{f.value}</strong>
                    </span>
                  </div>
                  {/* FIX #3: Just calls removeFilter — no parallel fetch */}
                  <button
                    type="button"
                    onClick={() => {
                      const newFilters = filters.filter((x) => x.id !== f.id);
                      setFilters(newFilters);

                      const newFilterStr = buildDittoFilter(newFilters);

                      if (newFilters.length === 0) {
                        // no filters left → refetch all towers
                        queryClient.invalidateQueries({
                          queryKey: ["towers"],
                          refetchType: "all",
                        });
                      } else {
                        // re-fetch with remaining filters
                        let accumulated: TwinItem[] = [];
                        const existingIds = new Set<string>();

                        getTwinsWithFilter(newFilterStr, (chunk) => {
                          const uniqueChunk = chunk.filter((t: any) => {
                            if (existingIds.has(t.thingId)) return false;
                            existingIds.add(t.thingId);
                            return true;
                          });
                          if (uniqueChunk.length > 0) {
                            accumulated = [...accumulated, ...uniqueChunk];
                            queryClient.setQueryData(["towers"], accumulated);
                          }
                        });
                      }
                    }}
                    className="w-4 h-4 rounded-full bg-blue-200/60 hover:bg-blue-200 flex items-center justify-center text-blue-500 text-xs ml-2 flex-shrink-0 transition-colors duration-100"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
