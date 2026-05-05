"use client";
import "./globals.css";
import ExpandTowerPreview from "./components/common/expandTowerPreview";
import dynamic from "next/dynamic";
import { useExpandTowerStore, useSitePhotosStore } from "./store/useTowerStore";
import SitePhotos from "./components/common/SitePhotos";
import FilterBar from "./components/shared/filterTower";

const TowerView = dynamic(() => import("./components/common/towerView"), {
  ssr: false,
});

const page = () => {
  const openExpandTower = useExpandTowerStore((state) => state.openExpandTower);
  const isSitePhotosOpen = useSitePhotosStore((s) => s.isSitePhotosOpen);

  return (
    <div className="relative">
      {isSitePhotosOpen && <SitePhotos />}

      {openExpandTower && <ExpandTowerPreview />}
      <div className="absolute top-2 left-10 z-9999">
        <FilterBar />
      </div>
      <TowerView />
      {/* <Globe /> */}
    </div>
  );
};

export default page;
