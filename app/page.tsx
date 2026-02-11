"use client";
import "./globals.css";
import ExpandTowerPreview from "./components/shared/expandTowerPreview";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useExpandTowerStore } from "./store/useTowerStore";

const TowerView = dynamic(() => import("./components/common/towerView"), {
  ssr: false,
});

const page = () => {
  const openExpandTower = useExpandTowerStore((state) => state.openExpandTower);

  return (
    <div>
      {openExpandTower && <ExpandTowerPreview />}
      <TowerView />

      {/* <Globe /> */}
    </div>
  );
};

export default page;
