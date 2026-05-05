import TwinOverview from "../twinOverview";
import FilterBar from "../shared/filterTower";
import dynamic from "next/dynamic";

const TowerMap = dynamic(() => import("./towerMap"), {
  ssr: false,
});
const TowerView = () => {
  return (
    <div className="flex relative">
      <TowerMap />
      <TwinOverview />
    </div>
  );
};

export default TowerView;
