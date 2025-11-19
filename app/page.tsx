"use client";
import NavBar from "./components/navBar";
import "./globals.css";
import Attribures from "./components/attributes";
import Features from "./components/features";
import EditTwin from "./components/editTwin";
import Globe from "./other/Globe";
import CesiumOfflineGlobe from "./other/offlineCesiumGlobe";

import { useState } from "react";
import dynamic from "next/dynamic";

const TowerGlobe = dynamic(() => import("./components/towerGlobe"), {
  ssr: false,
});

const page = () => {
  const [currTower, setcurrTower] = useState<any>();

  return (
    <div>
      <TowerGlobe currTower={currTower} setcurrTower={setcurrTower} />

      {/* <Globe /> */}
    </div>
  );
};

export default page;
