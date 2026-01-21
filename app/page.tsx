"use client";
import NavBar from "./components/shared/navBar";
import "./globals.css";
import Attribures from "./components/shared/attributes";
import Features from "./components/shared/features";
import EditTwin from "./components/common/editTwin";
import Globe from "./other/Globe";
import CesiumOfflineGlobe from "./other/offlineCesiumGlobe";
import ExpandTowerPreview from "./components/shared/expandTowerPreview";

import { useState } from "react";
import dynamic from "next/dynamic";

const TowerView = dynamic(() => import("./components/common/towerView"), {
  ssr: false,
});

const page = () => {
  const [currTower, setcurrTower] = useState<any>();
  const [openExpandTower, setOpenExpandTower] = useState<boolean>(false);

  return (
    <div>
      {openExpandTower && (
        <ExpandTowerPreview
          onClose={() => {
            console.log(currTower);
            setOpenExpandTower(false);
          }}
          currTower={currTower}
        />
      )}
      <TowerView
        currTower={currTower}
        setcurrTower={setcurrTower}
        setOpenExpandTower={setOpenExpandTower}
      />

      {/* <Globe /> */}
    </div>
  );
};

export default page;
