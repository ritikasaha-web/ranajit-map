"use client";
import { useState } from "react";
import TowerMap from "./towerMap";
import TwinOverview from "./twinOverview";
const TowerGlobe = ({
  currTower,
  setcurrTower,
}: {
  currTower: any;
  setcurrTower: React.Dispatch<React.SetStateAction<any>>;
}) => {
  return (
    <div className="flex">
      <TowerMap currTower={currTower} setcurrTower={setcurrTower} />
      <TwinOverview currTower={currTower} />
    </div>
  );
};

export default TowerGlobe;
