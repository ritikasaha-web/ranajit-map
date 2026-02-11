"use client";
import { useState } from "react";
import TwinOverview from "../twinOverview";
import dynamic from "next/dynamic";

const TowerMap = dynamic(() => import("./towerMap"), {
  ssr: false,
});
const TowerView = () => {
  return (
    <div className="flex">
      <TowerMap />
      <TwinOverview />
    </div>
  );
};

export default TowerView;
