"use client";

import { useState } from "react";
import { IoSettingsOutline } from "react-icons/io5";
import { BASEMAPS } from "@/app/constants/basemaps";

interface MapStyleSwitcherProps {
  value: string;
  onChange: (id: string) => void;
}

// Settings button (top-right) that opens a basemap picker. Styled to
// match the FilterBar's glass look; closes itself on selection, same as
// the site filter dropdown.
const MapStyleSwitcher = ({ value, onChange }: MapStyleSwitcherProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute font-rubik top-2 right-3 z-[1000] flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Map style"
        className={`
          w-10 h-10 rounded-full flex items-center justify-center
          bg-white/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)]
          text-gray-700 hover:bg-white/90 transition-all duration-150
          active:scale-95 cursor-pointer
          ${open ? "rotate-45" : ""}
        `}
      >
        <IoSettingsOutline size={18} />
      </button>

      {open && (
        <div className="filter-panel w-48 rounded-[20px] bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-2 flex flex-col gap-0.5">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold px-3 pt-1.5 pb-1">
            Map Style
          </p>
          {BASEMAPS.map((b) => {
            const isActive = b.id === value;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  onChange(b.id);
                  setOpen(false);
                }}
                className={`
                  w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl
                  transition-all duration-150 active:scale-[0.97] text-left
                  ${isActive ? "bg-gray-900 text-white shadow-sm" : "text-gray-700 hover:bg-black/[0.05]"}
                `}
              >
                <span
                  className="w-7 h-7 rounded-lg shrink-0 border border-black/10"
                  style={{ background: b.preview }}
                />
                <span
                  className={`text-[13px] ${isActive ? "font-semibold" : "font-medium"}`}
                >
                  {b.label}
                </span>
                {isActive && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-white shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MapStyleSwitcher;
