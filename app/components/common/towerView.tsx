import TwinOverview from "../twinOverview";
import React, { Suspense, lazy } from "react";

const TowerMap = lazy(() => import("./towerMap"));

const TowerView = () => {
  return (
    <div className="flex relative">
      <Suspense fallback={null}>
        <TowerMap />
      </Suspense>
      <TwinOverview />
    </div>
  );
};

export default TowerView;
