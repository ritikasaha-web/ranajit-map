import TwinOverview from "../twinOverview";
import React, { Suspense, lazy } from "react";
import { useTowerStore } from "@/app/store/useTowerStore";

const TowerMap = lazy(() => import("./towerMap"));

const TowerView = () => {
  const isSidebarOpen = useTowerStore((s) => s.isSidebarOpen);
  const selectedTowerId = useTowerStore((s) => s.selectedTowerId);

  return (
    <div className="relative">
      <Suspense fallback={null}>
        <TowerMap />
      </Suspense>
      {/* Mount only when open or during exit animation */}
      {(isSidebarOpen || !!selectedTowerId) && <TwinOverview />}
    </div>
  );
};

export default TowerView;
