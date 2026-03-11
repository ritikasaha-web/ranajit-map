"use client";
import "./globals.css";
import ExpandTowerPreview from "./components/shared/expandTowerPreview";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useExpandTowerStore, useSitePhotosStore } from "./store/useTowerStore";
import SitePhotos from "./components/shared/SitePhotos";

const TowerView = dynamic(() => import("./components/common/towerView"), {
  ssr: false,
});

const page = () => {
  const openExpandTower = useExpandTowerStore((state) => state.openExpandTower);
  const isSitePhotosOpen = useSitePhotosStore((s) => s.isSitePhotosOpen);

  return (
    <div>
      {isSitePhotosOpen && <SitePhotos />}

      {openExpandTower && <ExpandTowerPreview />}
      <TowerView />

      {/* <Globe /> */}
    </div>
  );
};

export default page;
