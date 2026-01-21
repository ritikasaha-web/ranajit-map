"use client";
import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getTwinById, getTwins } from "../../api/endpoints";
import TowerPreview from "../shared/towerPreview";

const smallIcon = L.icon({
  iconUrl: "/images/tower_icon.png",
  iconSize: [30, 40],
  iconAnchor: [15, 40],
  popupAnchor: [0, -40],
});

const bigIcon = L.icon({
  iconUrl: "/images/towerOnMap.png",
  iconSize: [150, 170],
  iconAnchor: [30, 80],
  popupAnchor: [0, -80],
});

const ZoomWatcher = ({ setZoom }: any) => {
  const map = useMap();

  useEffect(() => {
    const updateZoom = () => setZoom(map.getZoom());
    map.on("zoomend", updateZoom);

    return () => {
      map.off("zoomend", updateZoom);
    };
  }, [map, setZoom]);

  return null;
};

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

const TowerMap = ({
  currTower,
  setcurrTower,
  setOpenExpandTower,
}: {
  currTower: any;
  setcurrTower: React.Dispatch<React.SetStateAction<any>>;
  setOpenExpandTower: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [towers, setTowers] = useState<any[]>([]);
  const [zoom, setZoom] = useState(5); // 👈 zoom state

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
    const res = await getTwinById(id);
    setcurrTower(res);
  };

  const positions = useMemo(() => {
    return towers.map(
      (t: any) =>
        [t.attributes.location.lat, t.attributes.location.lng] as [
          number,
          number
        ]
    );
  }, [towers]);

  return (
    <div className="w-[70%] h-screen">
      <MapContainer
        style={{ width: "100%", height: "100%" }}
        center={[22.5, 80]}
        zoom={5}
        minZoom={2}
        maxZoom={18}
        scrollWheelZoom
      >
        {/* Watches zoom level */}
        <ZoomWatcher setZoom={setZoom} />

        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          noWrap={true}
          attribution="&copy; OSM &copy; CARTO"
        />

        <FitMarkersBounds positions={positions} />

        {/* --- All Towers --- */}
        {towers.map((tower: any) => (
          <Marker
            key={tower.thingId}
            position={[
              tower.attributes.location.lat,
              tower.attributes.location.lng,
            ]}
            icon={
              zoom >= 18
                ? bigIcon
                : L.icon({
                    iconUrl: "/images/tower_icon.png",
                    iconSize: [
                      tower.attributes.height_m / 2.5,
                      tower.attributes.height_m / 1.5,
                    ],
                    iconAnchor: [20, 40],
                    popupAnchor: [0, -40],
                  })
            } // 👈 SWITCH HERE
            eventHandlers={{
              click: () => getTwinDetails(tower.thingId),
            }}
          >
            <Popup className="w-[450px] h-[450px]">
              <strong>{tower.thingId}</strong>
              <div className="w-[420px] h-[450px] overflow-auto">
                <TowerPreview
                  structureType={currTower?.attributes?.structure_type || ""}
                  installationType={
                    currTower?.attributes?.installation_type || ""
                  }
                  components={currTower?.features?.components?.properties || {}}
                  setOpenExpandTower={setOpenExpandTower}
                />
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default TowerMap;
