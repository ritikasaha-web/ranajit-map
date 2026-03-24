import TwinOverview from "../twinOverview";
import SearchTower from "../shared/searchTower";
import dynamic from "next/dynamic";

const TowerMap = dynamic(() => import("./towerMap"), {
  ssr: false,
});
const TowerView = () => {
  return (
    <div className="flex">
      {/* <SearchTower /> */}
      <TowerMap />
      <TwinOverview />
    </div>
  );
};

export default TowerView;
