"use client";
import React from "react";

// -------------------------------
// IMPORT YOUR COMPONENTS
// -------------------------------
import BaseTowerSVG from "../ui_components/baseTowerSvg";
import { Antenna } from "../ui_components/towerAntena";
import { Microwave } from "../ui_components/towerMicrowave";

// Mini icons for legend
import { AntennaMini } from "../ui_components/antennaMini";
import { MicrowaveMini } from "../ui_components/microwaveMini";

// Number badge
import { CountBadge } from "../ui_components/countBadge";

const Page = () => {
  // SIMULATED VALUES — later replace with Ditto API
  const components = {
    antennas: 1,
    microwaves: 2,
  };

  // Tower center constant
  const TOWER_CENTER = 150;

  // Y anchor points
  const Y_ANTENNA = 70;
  const Y_MICROWAVE = 220;

  // -------------------------------
  // TOWER EDGE CALCULATIONS
  // -------------------------------
  function getTowerXLeft(y: number) {
    const topY = 70;
    const bottomY = 580;

    const leftTop = 140;
    const leftBottom = 110;

    const t = (y - topY) / (bottomY - topY);
    return leftTop + (leftBottom - leftTop) * t;
  }

  function getTowerXRight(y: number) {
    const topY = 70;
    const bottomY = 580;

    const rightTop = 160;
    const rightBottom = 190;

    const t = (y - topY) / (bottomY - topY);
    return rightTop + (rightBottom - rightTop) * t;
  }

  // -------------------------------
  // ANTENNA POSITIONS (2 max)
  // -------------------------------
  function getAntennaPositions(count: number) {
    const y = Y_ANTENNA;
    const max = Math.min(count, 2); // max = 2 always

    if (max === 0) return [];

    if (max === 1) return [{ x: getTowerXLeft(y) + 10, y, flip: false }];

    // ALWAYS return 2 if count >= 2
    return [
      { x: getTowerXLeft(y) - 40, y, flip: false },
      { x: getTowerXRight(y) + 16, y, flip: true },
    ];
  }

  // -------------------------------
  // MICROWAVE POSITIONS (2 max)
  // -------------------------------
  function getMicrowavePositions(count: number) {
    const y = Y_MICROWAVE;
    const max = Math.min(count, 2);

    if (max === 0) return [];

    if (max === 1) return [{ x: getTowerXLeft(y) - 60, y, flip: false }];

    return [
      { x: getTowerXLeft(y) - 60, y, flip: false },
      { x: getTowerXRight(y) + 2, y, flip: true },
    ];
  }

  const antennaPositions = getAntennaPositions(components.antennas);
  const microwavePositions = getMicrowavePositions(components.microwaves);

  return (
    <div>
      {/* ===================================== */}
      {/* TOWER                                 */}
      {/* ===================================== */}
      <svg width="300" height="600" viewBox="0 0 300 600">
        {/* Tower Lines */}
        <BaseTowerSVG />

        {/* ======================= */}
        {/* ALWAYS SHOW BADGES      */}
        {/* ======================= */}
        <CountBadge
          x={TOWER_CENTER}
          y={Y_ANTENNA}
          count={components.antennas}
        />
        <CountBadge
          x={TOWER_CENTER}
          y={Y_MICROWAVE}
          count={components.microwaves}
        />

        {/* ======================= */}
        {/* SHOW REAL SVG COMPONENTS */}
        {/* Only if 1 or 2          */}
        {/* ======================= */}

        {/* ANTENNAS */}
        {components.antennas > 0 &&
          components.antennas <= 2 &&
          antennaPositions.map((p, i) => (
            <Antenna key={i} x={p.x} y={p.y} flip={p.flip} />
          ))}

        {/* MICROWAVES */}
        {components.microwaves > 0 &&
          components.microwaves <= 2 &&
          microwavePositions.map((p, i) => (
            <Microwave key={i} x={p.x} y={p.y} flip={p.flip} />
          ))}
      </svg>

      {/* ===================================== */}
      {/* LEGEND                                 */}
      {/* ===================================== */}

      <svg width="300" height="80" style={{ marginTop: "15px" }}>
        {/* ANTENNA LEGEND */}
        <AntennaMini x={20} y={10} />
        <text x={70} y={35} fontSize="18">
          Antenna
        </text>

        {/* MICROWAVE LEGEND */}
        <MicrowaveMini x={20} y={50} />
        <text x={70} y={75} fontSize="18">
          Microwave
        </text>
      </svg>
    </div>
  );
};

export default Page;
