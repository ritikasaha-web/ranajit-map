"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getTwinById, getTwins } from "../../api/endpoints";
import TowerPreview from "../shared/towerPreview";
import { useTowerStore } from "@/app/store/useTowerStore";
import { useTower, useTowers } from "@/app/hooks/getTowers";
import TowerTooltip from "@/app/components/shared/TowerTooltip";
import MapLegend from "../shared/mapLegend";

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

const TowerMap = () => {
  const [towers, setTowers] = useState<any[]>([]);
  const [zoom, setZoom] = useState(5);

  useEffect(() => {
    (async () => {
      try {
        const data = await getTwins();
        const seen = new Set();
        const unique = (Array.isArray(data) ? data : []).filter((t: any) => {
          if (seen.has(t.thingId)) return false;
          seen.add(t.thingId);
          return true;
        });
        setTowers(unique); // ✅ only this
      } catch (err) {
        console.error("Error fetching towers:", err);
        setTowers([]);
      }
    })();
  }, []);

  const positions = useMemo(() => {
    return towers.map(
      (t: any) =>
        [t.attributes.location.lat, t.attributes.location.lng] as [
          number,
          number,
        ],
    );
  }, [towers]);

  const selectedTowerId = useTowerStore((s) => s.selectedTowerId);
  const setSelectedTowerId = useTowerStore((s) => s.setSelectedTowerId);
  const { data: selectedTower } = useTower(selectedTowerId ?? undefined);
  const icon_url = (down_time: number) => {
    if (down_time == 0) return "/images/tower_icon_green.png";
    // else if (down_time > 0 && down_time < 20)
    //   return "/images/tower_icon_orange.png";
    return "/images/tower_icon_red.png";
  };

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
                    iconUrl: icon_url(tower.attributes.down_time),
                    iconSize: [
                      tower.attributes.height_m / 3,
                      tower.attributes.height_m / 2,
                    ],
                    iconAnchor: [20, 40],
                    popupAnchor: [0, -40],
                  })
            } // 👈 SWITCH HERE
            eventHandlers={{
              click: () => setSelectedTowerId(tower.thingId),
            }}
          >
            <Tooltip
              direction="top"
              offset={[0, -50]}
              opacity={1}
              className="tower-tooltip-override"
            >
              <TowerTooltip
                thingId={tower.thingId}
                down_time={tower.attributes.down_time}
                uptime={tower.attributes.uptime}
              />
            </Tooltip>
            <Popup className="w-[450px] h-[450px]">
              <strong>{tower.thingId}</strong>
              <div className="w-[420px] h-[450px] overflow-auto">
                {!selectedTower || selectedTower.thingId !== tower.thingId ? (
                  <div className="p-4 text-sm text-gray-500">
                    Loading tower details…
                  </div>
                ) : (
                  <TowerPreview
                    structureType={selectedTower.attributes.structure_type}
                    installationType={
                      selectedTower.attributes.installation_type
                    }
                    components={selectedTower.features.components.properties}
                    uptime={selectedTower.attributes.uptime}
                    down_time={selectedTower.attributes.down_time}
                  />
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <MapLegend />
    </div>
  );
};

export default TowerMap;
