"use client";
import { applyFormatting, formatLabel } from "@/app/constants/component_names";
import { useCallback, useEffect, useRef, useState } from "react";

export const anchorMap: Record<string, Record<string, { x: number; y: number }>> = {
  monopole: {
    antenna: { x: 42, y: 17 },
    beacon: { x: 51, y: 8 },
    lightning_rod: { x: 48, y: 5 },
    rrh: { x: 58, y: 24 },
    rf_jumpers: { x: 51, y: 30 },
    down_conductor: { x: 52, y: 12 },
    antenna_mounting_frames: { x: 48, y: 30 },
    microwave: { x: 42, y: 42 },
    cable: { x: 53, y: 50 },
    fuel_tank: { x: 72, y: 70 },
    equipment_shelter: { x: 35, y: 80 },
    power_cabinate: { x: 55, y: 78 },
    diesel_generator: { x: 68, y: 75 },
    fcu: { x: 45, y: 85 },
  },
  four_pole: {
    lightning_rod: { x: 47, y: 8 },
    beacon: { x: 51, y: 8 },
    antenna: { x: 38, y: 20 },
    rrh: { x: 59, y: 20 },
    tma: { x: 55, y: 28 },
    microwave: { x: 37, y: 33 },
    ladder: { x: 44, y: 50 },
    cable: { x: 48, y: 60 },
    waveguides: { x: 52, y: 55 },
    equipment_shelter: { x: 35, y: 80 },
    fcu: { x: 45, y: 87 },
    fuel_tank: { x: 72, y: 70 },
    diesel_generator: { x: 70, y: 75 },
    power_cabinate: { x: 56, y: 79 },
  },
  tripole: {
    lightning_rod: { x: 48, y: 5 },
    beacon: { x: 51, y: 8 },
    antenna: { x: 38, y: 14 },
    antenna_mounting_frames: { x: 45, y: 25 },
    rrh: { x: 58, y: 20 },
    rf_jumpers: { x: 55, y: 22 },
    microwave: { x: 38, y: 32 },
    waveguides: { x: 52, y: 55 },
    cable: { x: 48, y: 55 },
    ladder: { x: 45, y: 45 },
    equipment_shelter: { x: 30, y: 77 },
    fcu: { x: 45, y: 85 },
    power_cabinate: { x: 58, y: 78 },
    diesel_generator: { x: 68, y: 75 },
    fuel_tank: { x: 72, y: 70 },
  },
  guyed_mast: {
    lightning_rod: { x: 47, y: 8 },
    antenna: { x: 38, y: 20 },
    beacon: { x: 51, y: 8 },
    rrh: { x: 59, y: 22 },
    tma: { x: 55, y: 28 },
    microwave: { x: 38, y: 38 },
    cable: { x: 46, y: 50 },
    ladder: { x: 45, y: 60 },
    equipment_shelter: { x: 35, y: 80 },
    fcu: { x: 46, y: 87 },
    down_conductor: { x: 52, y: 50 },
    power_cabinate: { x: 60, y: 79 },
    diesel_generator: { x: 70, y: 75 },
    fuel_tank: { x: 72, y: 70 },
  },
};

export const labelOverrides: Record<string, Record<string, { x?: number; y?: number }>> = {
  monopole: {
    antenna: { x: 25, y: 17 },
    beacon: { x: 75, y: 8 },
    lightning_rod: { x: 34, y: 5 },
    down_conductor: { x: 75, y: 20 },
    antenna_mounting_frames: { x: 42, y: 30 },
    rrh: { x: 62, y: 24 },
    rf_jumpers: { x: 75, y: 32 },
    microwave: { x: 30, y: 42 },
    cable: { x: 75, y: 50 },
    fuel_tank: { x: 80, y: 70 },
    equipment_shelter: { x: 32, y: 80 },
    power_cabinate: { x: 55, y: 90 },
    diesel_generator: { x: 78, y: 80 },
    fcu: { x: 40, y: 93 },
  },
  four_pole: {
    lightning_rod: { x: 30, y: 8 },
    beacon: { x: 70, y: 8 },
    antenna: { x: 22, y: 20 },
    rrh: { x: 75, y: 20 },
    tma: { x: 75, y: 28 },
    microwave: { x: 26, y: 33 },
    ladder: { x: 21, y: 50 },
    cable: { x: 19, y: 60 },
    waveguides: { x: 63, y: 55 },
    equipment_shelter: { x: 32, y: 80 },
    fcu: { x: 42, y: 87 },
    fuel_tank: { x: 75, y: 65 },
    diesel_generator: { x: 78, y: 80 },
    power_cabinate: { x: 59, y: 90 },
  },
  tripole: {
    lightning_rod: { x: 35, y: 5 },
    beacon: { x: 67, y: 8 },
    antenna: { x: 28, y: 14 },
    antenna_mounting_frames: { x: 36, y: 25 },
    rrh: { x: 70, y: 18 },
    rf_jumpers: { x: 62, y: 26 },
    microwave: { x: 30, y: 32 },
    waveguides: { x: 75, y: 52 },
    cable: { x: 28, y: 55 },
    ladder: { x: 25, y: 45 },
    equipment_shelter: { x: 30, y: 82 },
    fcu: { x: 40, y: 90 },
    power_cabinate: { x: 60, y: 90 },
    diesel_generator: { x: 75, y: 80 },
    fuel_tank: { x: 80, y: 70 },
  },
  guyed_mast: {
    lightning_rod: { x: 28, y: 8 },
    antenna: { x: 20, y: 20 },
    beacon: { x: 78, y: 8 },
    rrh: { x: 83, y: 22 },
    tma: { x: 83, y: 32 },
    microwave: { x: 24, y: 38 },
    cable: { x: 17, y: 50 },
    ladder: { x: 19, y: 60 },
    equipment_shelter: { x: 35, y: 87 },
    fcu: { x: 45, y: 92 },
    down_conductor: { x: 63, y: 50 },
    power_cabinate: { x: 60, y: 92 },
    diesel_generator: { x: 78, y: 80 },
    fuel_tank: { x: 78, y: 60 },
  },
};

function spreadY(rawPx: number[], minGap: number, minPx: number, maxPx: number): number[] {
  if (!rawPx.length) return [];
  const indexed = rawPx.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  const pos = indexed.map((p) => Math.max(p.y, minPx + 14));
  for (let k = 1; k < pos.length; k++) {
    if (pos[k] - pos[k - 1] < minGap) pos[k] = pos[k - 1] + minGap;
  }
  const bottom = maxPx - 14;
  if (pos[pos.length - 1] > bottom) {
    pos[pos.length - 1] = bottom;
    for (let k = pos.length - 2; k >= 0; k--) {
      if (pos[k + 1] - pos[k] < minGap) pos[k] = pos[k + 1] - minGap;
    }
  }
  const result = new Array(rawPx.length);
  indexed.forEach(({ i }, k) => {
    result[i] = pos[k];
  });
  return result;
}

interface LabelEntry {
  id: string;
  value: any;
  anchor: { x: number; y: number };
  side: "left" | "right";
}

interface ImgBounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const ComponentLabels = ({
  entries,
  overrides = {},
  imgRef,
}: {
  entries: LabelEntry[];
  overrides?: Record<string, { x?: number; y?: number }>;
  imgRef?: React.RefObject<HTMLImageElement | null>;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [imgBounds, setImgBounds] = useState<ImgBounds | null>(null);

  const computeImgBounds = useCallback(() => {
    const el = ref.current;
    const imgEl = imgRef?.current;
    if (!el || !imgEl || !imgEl.naturalWidth || !imgEl.naturalHeight) return;

    const cW = el.clientWidth;
    const cH = el.clientHeight;
    const cAspect = cW / cH;
    const iAspect = imgEl.naturalWidth / imgEl.naturalHeight;

    let w: number, h: number, x: number, y: number;
    if (cAspect > iAspect) {
      // container is wider than image → pillarbox (horizontal padding)
      h = cH;
      w = cH * iAspect;
      x = (cW - w) / 2;
      y = 0;
    } else {
      // container is taller than image → letterbox (vertical padding)
      w = cW;
      h = cW / iAspect;
      x = 0;
      y = (cH - h) / 2;
    }

    setImgBounds({ x, y, w, h });
  }, [imgRef]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      setDims({ w: el.clientWidth, h: el.clientHeight });
      computeImgBounds();
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [computeImgBounds]);

  // Recompute when the image finishes loading
  useEffect(() => {
    const imgEl = imgRef?.current;
    if (!imgEl) return;
    if (imgEl.complete && imgEl.naturalWidth) {
      computeImgBounds();
      return;
    }
    imgEl.addEventListener("load", computeImgBounds);
    return () => imgEl.removeEventListener("load", computeImgBounds);
  }, [imgRef, computeImgBounds]);

  const baseDiv = <div ref={ref} className="absolute inset-0 pointer-events-none" />;
  if (!dims || dims.w === 0) return baseDiv;

  const { w, h } = dims;

  // Fall back to full container if imgBounds not yet computed
  const ib: ImgBounds = imgBounds ?? { x: 0, y: 0, w, h };

  const R_ELBOW_X = ib.x + ib.w * 0.78;
  const L_ELBOW_X = ib.x + ib.w * 0.22;

  // Convert % anchor coords to absolute px, offset by image origin
  const toPx = (a: { x: number; y: number }) => ({
    x: ib.x + (a.x / 100) * ib.w,
    y: ib.y + (a.y / 100) * ib.h,
  });

  const left = entries.filter((e) => e.side === "left");
  const right = entries.filter((e) => e.side === "right");

  const autoSpreadRight = spreadY(
    right.map((e) => (overrides[e.id]?.y != null ? ib.y + (overrides[e.id].y! / 100) * ib.h : toPx(e.anchor).y)),
    22,
    ib.y,
    ib.y + ib.h,
  );

  const autoSpreadLeft = spreadY(
    left.map((e) => (overrides[e.id]?.y != null ? ib.y + (overrides[e.id].y! / 100) * ib.h : toPx(e.anchor).y)),
    22,
    ib.y,
    ib.y + ib.h,
  );

  const resolveChip = (e: LabelEntry, autoY: number, defaultChipX: number) => {
    const ov = overrides[e.id] ?? {};
    const chipX = ov.x != null ? ib.x + (ov.x / 100) * ib.w : defaultChipX;
    const chipY = ov.y != null ? ib.y + (ov.y / 100) * ib.h : autoY;
    return { chipX, chipY };
  };

  const renderSide = (sideEntries: LabelEntry[], spreadYs: number[], elbowX: number, defaultChipX: number, align: "left" | "right") =>
    sideEntries.map((e, i) => {
      const { x: ax, y: ay } = toPx(e.anchor);
      const { chipX, chipY } = resolveChip(e, spreadYs[i], defaultChipX);

      const finalElbowX = overrides[e.id]?.x != null ? chipX : elbowX;

      return (
        <g key={`l-${e.id}`}>
          <circle cx={ax} cy={ay} r={3} fill="rgba(0,0,0)" />
          <circle cx={ax} cy={ay} r={1.5} fill="rgb(0,0,0)" />
          <polyline points={`${ax},${ay} ${finalElbowX},${ay} ${finalElbowX},${chipY} ${chipX},${chipY}`} fill="none" stroke="rgb(0, 0, 0)" strokeWidth="1" strokeLinejoin="round" />
        </g>
      );
    });

  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none z-20">
      <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
        {renderSide(right, autoSpreadRight, R_ELBOW_X, ib.x + ib.w * 0.81, "left")}
        {renderSide(left, autoSpreadLeft, L_ELBOW_X, ib.x + ib.w * 0.19, "right")}
      </svg>

      {right.map((e, i) => {
        const { chipX, chipY } = resolveChip(e, autoSpreadRight[i], ib.x + ib.w * 0.81);
        return (
          <div
            key={`c-${e.id}`}
            style={{
              position: "absolute",
              left: chipX,
              top: chipY,
              transform: "translateY(-50%)",
            }}
          >
            <div className="bg-transparent max-w-3xs backdrop-blur-sm border border-none gap-1 rounded-md px-1.5 py-0.5 flex flex-wrap items-start">
              <span className="text-[10px] font-semibold tracking-wide leading-none mb-0.5">{applyFormatting(e.id)}</span>
              <span className="text-[9px] font-semibold text-slate-800 leading-none">({formatLabel(String(e.value))})</span>
            </div>
          </div>
        );
      })}

      {left.map((e, i) => {
        const { chipX, chipY } = resolveChip(e, autoSpreadLeft[i], ib.x + ib.w * 0.19);
        return (
          <div
            key={`c-${e.id}`}
            style={{
              position: "absolute",
              right: w - chipX,
              top: chipY,
              transform: "translateY(-50%)",
            }}
          >
            <div className="bg-transparent backdrop-blur-sm border border-none gap-1 rounded-md px-1.5 py-0.5 flex justify-end flex-wrap items-start">
              <span className="text-[10px] font-semibold tracking-wide leading-none mb-0.5">{applyFormatting(e.id)} </span>
              <span className="text-[9px] font-semibold text-slate-800 leading-none">({formatLabel(String(e.value))})</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
