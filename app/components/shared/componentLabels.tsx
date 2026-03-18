"use client";
import { formatLabel } from "@/app/constants/component_names";
import { useEffect, useRef, useState } from "react";

//controls where the line from component to label anchor points are (as % of container)
export const anchorMap: Record<
  string,
  Record<string, { x: number; y: number }>
> = {
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
    antenna: { x: 78, y: 14 },
    rrh: { x: 78, y: 26 },
    tma: { x: 78, y: 36 },
    cable: { x: 22, y: 50 },
    beacon: { x: 78, y: 8 },
    equipment_shelter: { x: 78, y: 78 },
    fuel_tank: { x: 22, y: 82 },
    ladder: { x: 22, y: 55 },
    microwave: { x: 78, y: 44 },
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

// Override where the label CHIP appears (% of container).
// If omitted, spreadY auto-positions it.
// controls where the label CHIP appears (% of container). If omitted, spreadY auto-positions it.
export const labelOverrides: Record<
  string,
  Record<string, { x?: number; y?: number }>
> = {
  monopole: {
    antenna: { x: 25, y: 17 },
    beacon: { x: 75, y: 8 },
    lightning_rod: { x: 34, y: 5 },
    down_conductor: { x: 75, y: 20 },
    antenna_mounting_frames: { x: 42, y: 30 },
    rrh: { x: 65, y: 24 },
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
    antenna: { x: 78, y: 14 },
    rrh: { x: 78, y: 26 },
    tma: { x: 78, y: 36 },
    cable: { x: 22, y: 50 },
    beacon: { x: 78, y: 8 },
    equipment_shelter: { x: 78, y: 78 },
    fuel_tank: { x: 22, y: 82 },
    ladder: { x: 22, y: 55 },
    microwave: { x: 78, y: 44 },
  },
  guyed_mast: {
    lightning_rod: { x: 28, y: 8 }, // top left — Lightning Rod / Beacon area
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
function spreadY(rawPx: number[], minGap: number, maxPx: number): number[] {
  if (!rawPx.length) return [];
  const indexed = rawPx.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  const pos = indexed.map((p) => Math.max(p.y, 14));
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

export const ComponentLabels = ({
  entries,
  overrides = {},
}: {
  entries: LabelEntry[];
  overrides?: Record<string, { x?: number; y?: number }>;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setDims({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const baseDiv = (
    <div ref={ref} className="absolute inset-0 pointer-events-none" />
  );
  if (!dims || dims.w === 0) return baseDiv;

  const { w, h } = dims;
  const R_ELBOW_X = w * 0.78;
  const L_ELBOW_X = w * 0.22;

  const toPx = (a: { x: number; y: number }) => ({
    x: (a.x / 100) * w,
    y: (a.y / 100) * h,
  });

  const left = entries.filter((e) => e.side === "left");
  const right = entries.filter((e) => e.side === "right");

  // Auto-spread only for labels that have NO y override
  const autoSpreadRight = spreadY(
    right.map((e) =>
      overrides[e.id]?.y != null
        ? (overrides[e.id].y! / 100) * h
        : toPx(e.anchor).y,
    ),
    22,
    h,
  );
  const autoSpreadLeft = spreadY(
    left.map((e) =>
      overrides[e.id]?.y != null
        ? (overrides[e.id].y! / 100) * h
        : toPx(e.anchor).y,
    ),
    22,
    h,
  );

  // Final chip positions — override wins, else use spread result
  const resolveChip = (e: LabelEntry, autoY: number, defaultChipX: number) => {
    const ov = overrides[e.id] ?? {};
    const chipX = ov.x != null ? (ov.x / 100) * w : defaultChipX;
    const chipY = ov.y != null ? (ov.y / 100) * h : autoY;
    return { chipX, chipY };
  };

  const renderSide = (
    sideEntries: LabelEntry[],
    spreadYs: number[],
    elbowX: number,
    defaultChipX: number,
    align: "left" | "right",
  ) =>
    sideEntries.map((e, i) => {
      const { x: ax, y: ay } = toPx(e.anchor);
      const { chipX, chipY } = resolveChip(e, spreadYs[i], defaultChipX);

      // Elbow x: if chip x was overridden, use that as the final horizontal target
      const finalElbowX = overrides[e.id]?.x != null ? chipX : elbowX;

      return (
        <g key={`l-${e.id}`}>
          <circle cx={ax} cy={ay} r={3} fill="rgba(0,0,0)" />
          <circle cx={ax} cy={ay} r={1.5} fill="rgb(0,0,0)" />
          <polyline
            points={`${ax},${ay} ${finalElbowX},${ay} ${finalElbowX},${chipY} ${chipX},${chipY}`}
            fill="none"
            stroke="rgb(0, 0, 0)"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </g>
      );
    });

  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none z-20">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${w} ${h}`}
        style={{ overflow: "visible" }}
      >
        {renderSide(right, autoSpreadRight, R_ELBOW_X, w * 0.81, "left")}
        {renderSide(left, autoSpreadLeft, L_ELBOW_X, w * 0.19, "right")}
      </svg>

      {right.map((e, i) => {
        const { chipX, chipY } = resolveChip(e, autoSpreadRight[i], w * 0.81);
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
            <div className="bg-transparent backdrop-blur-sm border border-none  rounded-md px-1.5 py-0.5 flex flex-col items-start">
              <span className="text-[10px] font-semibold uppercase tracking-wide leading-none mb-0.5">
                {formatLabel(e.id)}
              </span>
              <span className="text-[9px] font-semibold text-slate-800 leading-none">
                {formatLabel(String(e.value))}
              </span>
            </div>
          </div>
        );
      })}
      {left.map((e, i) => {
        const { chipX, chipY } = resolveChip(e, autoSpreadLeft[i], w * 0.19);
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
            <div className="bg-transparent backdrop-blur-sm border border-none  rounded-md px-1.5 py-0.5 flex flex-col items-start">
              <span className="text-[10px] font-semibold uppercase tracking-wide leading-none mb-0.5">
                {formatLabel(e.id)}
              </span>
              <span className="text-[9px] font-semibold text-slate-800 leading-none">
                {formatLabel(String(e.value))}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
