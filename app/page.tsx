"use client";
import "./globals.css";
import ExpandTowerPreview from "./components/common/expandTowerPreview";
import React, { Suspense, lazy, useState, useEffect } from "react";
import { useExpandTowerStore, useSitePhotosStore } from "./store/useTowerStore";
import SitePhotos from "./components/common/SitePhotos";
import FilterBar from "./components/shared/filterTower";
import TowerDetails from "./tower/[id]/page";

const TowerView = lazy(() => import("./components/common/towerView"));

const page = () => {
  const openExpandTower = useExpandTowerStore((state) => state.openExpandTower);
  const isSitePhotosOpen = useSitePhotosStore((s) => s.isSitePhotosOpen);
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const towerMatch = hash.match(/^#\/tower\/(.+)$/);
  if (towerMatch) {
    return <TowerDetails id={decodeURIComponent(towerMatch[1])} />;
  }

  return (
    <div className="relative">
      {isSitePhotosOpen && <SitePhotos />}

      {openExpandTower && <ExpandTowerPreview />}
      <div className="absolute top-2 left-10 z-9999">
        <FilterBar />
      </div>
      <Suspense fallback={null}>
        <TowerView />
      </Suspense>
    </div>
  );
};

export default page;
