"use client";
import { useState } from "react";
import TwinOverview from "../twinOverview";
import dynamic from "next/dynamic";

const TowerMap = dynamic(() => import("./towerMap"), {
  ssr: false,
});
const TowerView = ({
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

export default TowerView;
