"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { MapContainer, TileLayer, useMap, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { useTowerStore } from "@/app/store/useTowerStore";
import { useTower, useTowers } from "@/app/hooks/getTowers";
import TowerTooltip from "@/app/components/shared/TowerTooltip";
import TowerPreview from "../shared/towerPreview";
import MapLegend from "../shared/mapLegend";
// import tower_green_icon from "/ranajit_map/images/tower_icon_green.png";
// import tower_red_icon from "/ranajit_map/images/tower_icon_red.png";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Tower {
  thingId: string;
  attributes: {
    location: { lat: number; lng: number };
    down_time: number;
    uptime: number;
    height_m: number;
    structure_type: string;
    installation_type: string;
  };
  features?: { components?: { properties?: Record<string, unknown> } };
}

interface TooltipState {
  tower: Tower;
  x: number;
  y: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// ZoomWatcher
// ─────────────────────────────────────────────────────────────────────────────
const ZoomWatcher = ({ setZoom }: { setZoom: (z: number) => void }) => {
  const map = useMap();
  useEffect(() => {
    const handler = () => setZoom(map.getZoom());
    map.on("zoomend", handler);
    return () => {
      map.off("zoomend", handler);
    };
  }, [map, setZoom]);
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// FitMarkersBounds — fires once on first load
// ─────────────────────────────────────────────────────────────────────────────
const FitMarkersBounds: React.FC<{ positions: [number, number][] }> = ({
  positions,
}) => {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (positions.length && !fitted.current) {
      fitted.current = true;
      const group = L.featureGroup(positions.map((p) => L.marker(p)));
      map.fitBounds(group.getBounds(), { padding: [20, 20] });
    }
  }, [map, positions]);
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// CanvasIconLayer
// ─────────────────────────────────────────────────────────────────────────────
interface CanvasIconLayerProps {
  towers: Tower[];
  greenIconUrl: string;
  redIconUrl: string;
  iconWidth?: number;
  iconHeight?: number;
  onHover: (tower: Tower, x: number, y: number) => void;
  onHoverOff: () => void;
  onClick: (tower: Tower, latlng: L.LatLng) => void;
}

const CanvasIconLayer: React.FC<CanvasIconLayerProps> = ({
  towers,
  greenIconUrl,
  redIconUrl,
  iconWidth = 24,
  iconHeight = 32,
  onHover,
  onHoverOff,
  onClick,
}) => {
  const map = useMap();

  const onHoverRef = useRef(onHover);
  const onHoverOffRef = useRef(onHoverOff);
  const onClickRef = useRef(onClick);

  useEffect(() => {
    onHoverRef.current = onHover;
  }, [onHover]);
  useEffect(() => {
    onHoverOffRef.current = onHoverOff;
  }, [onHoverOff]);
  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  useEffect(() => {
    if (!towers.length) return;

    const greenImg = new Image();
    const redImg = new Image();
    let imagesReady = 0;
    let useFallback = false;

    const canvas = document.createElement("canvas");
    // 1. Removed strict z-index so Leaflet's pane system takes control
    canvas.style.cssText = "position:absolute;pointer-events:none;";
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    let pixelPositions: Float32Array = new Float32Array(towers.length * 2);
    let positionsDirty = true;

    const recomputePositions = () => {
      if (pixelPositions.length !== towers.length * 2) {
        pixelPositions = new Float32Array(towers.length * 2);
      }
      for (let i = 0; i < towers.length; i++) {
        const t = towers[i];
        const pt = map.latLngToContainerPoint([
          t.attributes.location.lat,
          t.attributes.location.lng,
        ]);
        pixelPositions[i * 2] = pt.x;
        pixelPositions[i * 2 + 1] = pt.y;
      }
      positionsDirty = false;
    };

    const drawNow = () => {
      if (imagesReady < 2 && !useFallback) return;
      if (positionsDirty) recomputePositions();

      const size = map.getSize();
      canvas.style.width = size.x + "px";
      canvas.style.height = size.y + "px";
      canvas.width = Math.round(size.x * dpr);
      canvas.height = Math.round(size.y * dpr);

      // 2. Keep the canvas perfectly aligned with the viewport when panning
      const topLeft = map.containerPointToLayerPoint([0, 0]);
      L.DomUtil.setPosition(canvas, topLeft);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size.x, size.y);

      const minX = -iconWidth;
      const maxX = size.x + iconWidth;
      const minY = -iconHeight;
      const maxY = size.y + iconHeight;

      for (let i = 0; i < towers.length; i++) {
        const px = pixelPositions[i * 2];
        const py = pixelPositions[i * 2 + 1];
        if (px < minX || px > maxX || py < minY || py > maxY) continue;

        const tower = towers[i];
        if (useFallback) {
          ctx.fillStyle =
            tower.attributes.down_time === 0 ? "#22c55e" : "#ef4444";
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(px, py - iconHeight / 2, iconWidth / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else {
          const img = tower.attributes.down_time === 0 ? greenImg : redImg;
          ctx.drawImage(
            img,
            px - iconWidth / 2,
            py - iconHeight,
            iconWidth,
            iconHeight,
          );
        }
      }
    };

    let rafId: number | null = null;
    const draw = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        drawNow();
      });
    };

    const onImgLoad = () => {
      imagesReady++;
      draw();
    };
    const onImgError = () => {
      useFallback = true;
      draw();
    };

    greenImg.onload = onImgLoad;
    redImg.onload = onImgLoad;
    greenImg.onerror = onImgError;
    redImg.onerror = onImgError;
    greenImg.src = greenIconUrl;
    redImg.src = redIconUrl;

    const hitTest = (containerPt: L.Point): Tower | null => {
      if (positionsDirty) recomputePositions();
      const halfW = iconWidth / 2;
      for (let i = towers.length - 1; i >= 0; i--) {
        const px = pixelPositions[i * 2];
        const py = pixelPositions[i * 2 + 1];
        if (
          containerPt.x >= px - halfW &&
          containerPt.x <= px + halfW &&
          containerPt.y >= py - iconHeight &&
          containerPt.y <= py
        ) {
          return towers[i];
        }
      }
      return null;
    };

    const onMove = () => {
      positionsDirty = true;
      draw();
    };

    let mouseRafId: number | null = null;
    let pendingMouseEvent: L.LeafletMouseEvent | null = null;
    const onMouseMove = (e: L.LeafletMouseEvent) => {
      pendingMouseEvent = e;
      if (mouseRafId !== null) return;
      mouseRafId = requestAnimationFrame(() => {
        mouseRafId = null;
        const ev = pendingMouseEvent;
        pendingMouseEvent = null;
        if (!ev) return;
        const found = hitTest(ev.containerPoint);
        if (found) {
          onHoverRef.current(found, ev.containerPoint.x, ev.containerPoint.y);
          map.getContainer().style.cursor = "pointer";
        } else {
          onHoverOffRef.current();
          map.getContainer().style.cursor = "";
        }
      });
    };

    const onMapClick = (e: L.LeafletMouseEvent) => {
      const found = hitTest(e.containerPoint);
      if (found) onClickRef.current(found, e.latlng);
    };

    // 3. Inject canvas into the Marker Pane (z-index 600) instead of the Map Container
    // This allows the React-Leaflet Popup (z-index 700) to naturally render on top!
    const pane = map.getPane("markerPane");
    if (pane) pane.appendChild(canvas);

    map.on("move zoom viewreset resize moveend zoomend", onMove);
    map.on("mousemove", onMouseMove);
    map.on("click", onMapClick);
    draw();

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (mouseRafId !== null) cancelAnimationFrame(mouseRafId);
      map.off("move zoom viewreset resize moveend zoomend", onMove);
      map.off("mousemove", onMouseMove);
      map.off("click", onMapClick);
      if (pane) pane.removeChild(canvas);
      map.getContainer().style.cursor = "";
    };
  }, [map, towers, greenIconUrl, redIconUrl, iconWidth, iconHeight]);

  return null;
};
// ─────────────────────────────────────────────────────────────────────────────
// GlobalTooltip
// ─────────────────────────────────────────────────────────────────────────────
const GlobalTooltip: React.FC<{ state: TooltipState | null }> = ({ state }) => {
  if (!state) return null;
  return (
    <div
      className="tower-tooltip-override"
      style={{
        position: "absolute",
        left: state.x,
        top: state.y,
        transform: "translate(-50%, calc(-100% - 14px))",
        zIndex: 1500,
        pointerEvents: "none",
      }}
    >
      <TowerTooltip
        thingId={state.tower.thingId}
        down_time={state.tower.attributes.down_time}
        uptime={state.tower.attributes.uptime}
        imageUrl="/images/image.png"
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// InnerMap
// ─────────────────────────────────────────────────────────────────────────────
interface InnerMapProps {
  towers: Tower[];
  positions: [number, number][];
  mapRef: React.RefObject<L.Map | null>;
  setZoom: (z: number) => void;
  onHover: (tower: Tower, x: number, y: number) => void;
  onHoverOff: () => void;
  onTowerClick: (tower: Tower, latlng: L.LatLng) => void;
}

const InnerMap: React.FC<InnerMapProps> = ({
  towers,
  positions,
  mapRef,
  setZoom,
  onHover,
  onHoverOff,
  onTowerClick,
}) => {
  const map = useMap();

  useEffect(() => {
    (mapRef as React.MutableRefObject<L.Map | null>).current = map;
  }, [map, mapRef]);

  return (
    <>
      <ZoomWatcher setZoom={setZoom} />
      <FitMarkersBounds positions={positions} />
      {towers.length > 0 && (
        <CanvasIconLayer
          towers={towers}
          // greenIconUrl={tower_green_icon.src}
          // redIconUrl={tower_red_icon.src}
          greenIconUrl="https://dev-citadel.codez.co.in/ranajit_map/images/tower_icon_green.png"
          redIconUrl="https://dev-citadel.codez.co.in/ranajit_map/images/tower_icon_red.png"
          iconWidth={24}
          iconHeight={32}
          onHover={onHover}
          onHoverOff={onHoverOff}
          onClick={onTowerClick}
        />
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TowerMap — root component
// ─────────────────────────────────────────────────────────────────────────────
const TowerMap = () => {
  const { data: towers = [] } = useTowers();
  const [zoom, setZoom] = useState(5);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [activePopup, setActivePopup] = useState<{
    tower: Tower;
    latlng: L.LatLng;
  } | null>(null);

  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const selectedTowerId = useTowerStore((s) => s.selectedTowerId);
  const setSelectedTowerId = useTowerStore((s) => s.setSelectedTowerId);
  const { data: selectedTower } = useTower(selectedTowerId ?? undefined);

  const positions = useMemo(
    () =>
      (towers as Tower[]).map(
        (t) =>
          [t.attributes.location.lat, t.attributes.location.lng] as [
            number,
            number,
          ],
      ),
    [towers],
  );

  const handleClose = useCallback(() => {
    setSelectedTowerId(null as unknown as string);
    setActivePopup(null);
  }, [setSelectedTowerId]);

  const handleHover = useCallback((tower: Tower, x: number, y: number) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setTooltip({ tower, x, y });
  }, []);

  const handleHoverOff = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setTooltip(null), 80);
  }, []);

  const handleTowerClick = useCallback(
    (tower: Tower, latlng: L.LatLng) => {
      setSelectedTowerId(tower.thingId);
      setActivePopup({ tower, latlng });
      setTooltip(null);
    },
    [setSelectedTowerId],
  );

  return (
    <div className="w-[70%] h-screen" style={{ position: "relative" }}>
      <MapContainer
        style={{ width: "100%", height: "100%" }}
        center={[22.5, 80]}
        zoom={5}
        minZoom={2}
        maxZoom={18}
        scrollWheelZoom
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          noWrap={true}
          attribution="&copy; OSM &copy; CARTO"
        />

        <InnerMap
          towers={towers as Tower[]}
          positions={positions}
          mapRef={mapRef}
          setZoom={setZoom}
          onHover={handleHover}
          onHoverOff={handleHoverOff}
          onTowerClick={handleTowerClick}
        />

        {/* Native React-Leaflet Popup rendered based on click state */}
        {activePopup && (
          <Popup
            position={activePopup.latlng}
            eventHandlers={{ remove: handleClose }}
            className="w-[450px] h-[450px] z-9999"
            minWidth={450}
          >
            <strong>{activePopup.tower.thingId}</strong>
            <div className="w-[420px] h-[450px] overflow-auto">
              {!selectedTower ||
              selectedTower.thingId !== activePopup.tower.thingId ||
              !selectedTower.features?.components ? (
                <div className="p-4 text-sm text-gray-500">
                  Loading tower details…
                  {activePopup.tower.thingId}
                  {selectedTower.thingId}
                </div>
              ) : (
                <TowerPreview
                  structureType={selectedTower.attributes.structure_type}
                  installationType={selectedTower.attributes.installation_type}
                  components={selectedTower.features.components.properties}
                  uptime={selectedTower.attributes.uptime}
                  down_time={selectedTower.attributes.down_time}
                />
              )}
            </div>
          </Popup>
        )}
      </MapContainer>

      <GlobalTooltip state={tooltip} />
      <MapLegend />
    </div>
  );
};

export default TowerMap;
