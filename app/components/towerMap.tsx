import React, { useState } from "react";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getTwinById, getTwins } from "../api/endpoints";
import TowerPreview from "./towerPreveiw";

// Tower icon
const towerIcon = L.icon({
  iconUrl: "/images/tower_icon.png",
  iconSize: [45, 62],
  iconAnchor: [25, 60],
  popupAnchor: [0, -60],
});

const FitMarkersBounds: React.FC<{ positions: [number, number][] }> = ({
  positions,
}) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length) {
      const group = L.featureGroup(positions.map((pos) => L.marker(pos)));
      map.fitBounds(group.getBounds(), { padding: [20, 20] });
    }
  }, [map, positions]);
  return null;
};

const towerMap = ({
  currTower,
  setcurrTower,
}: {
  currTower: any;
  setcurrTower: React.Dispatch<React.SetStateAction<any>>;
}) => {
  const [towers, setTowers] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getTwins();
        console.log("Fetched towers:", data);
        setTowers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching towers:", err);
        setTowers([]);
      }
    })();
  }, []);

  const getTwinDetails = async (id: string) => {
    await getTwinById(id).then((res) => {
      setcurrTower(res);
      console.log("Twin Details:", res);
    });
  };

  const positions = towers.map(
    (t: any) =>
      [t.attributes.location.lat, t.attributes.location.lng] as [number, number]
  );

  return (
    <div className="w-[70%] h-screen">
      <div className="absolute z-9999 border-black border-2 w-12 h-12 bg-green-400 top-0 left-0">
        Search Bar
      </div>
      <MapContainer
        style={{ width: "100%", height: "100%" }}
        center={[22.5, 80]}
        zoom={5}
        minZoom={2}
        maxZoom={18}
        scrollWheelZoom
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          noWrap={true}
          attribution="&copy; OSM &copy; CARTO"
        />
        <FitMarkersBounds positions={positions} />
        {towers.map((tower: any) => (
          <Marker
            key={tower.thingId}
            position={[
              tower.attributes.location.lat,
              tower.attributes.location.lng,
            ]}
            icon={L.icon({
              iconUrl: "/images/tower_icon.png",
              iconSize: [
                tower.attributes.height_m / 2.5,
                tower.attributes.height_m / 1.5,
              ],
              iconAnchor: [20, 40],
              popupAnchor: [0, -40],
            })}
            eventHandlers={{
              click: () => getTwinDetails(tower.thingId),
            }}
          >
            <Popup className="w-[740px]">
              <strong>{tower.thingId}</strong>
              <div className="w-[700px]">
                <TowerPreview
                  components={currTower?.features?.components?.properties || {}}
                />
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default towerMap;
