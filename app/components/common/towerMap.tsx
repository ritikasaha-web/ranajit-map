"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import * as ReactDOMClient from "react-dom/client";
import "leaflet/dist/leaflet.css";

import { useTowerStore } from "@/app/store/useTowerStore";
import { useTower, useTowers } from "@/app/hooks/getTowers";
import TowerTooltip from "@/app/components/shared/TowerTooltip";
import TowerPreview from "../shared/towerPreview";
import MapLegend from "../shared/mapLegend";

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

// ─── Alarm-ring div icon ──────────────────────────────────────────────────────
const alarmDivIcon = L.divIcon({
  className: "custom-div-icon",
  html: `<div class="alarm-circle"></div>`,
  iconSize: [40, 40],
  iconAnchor: [19, 50],
});

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
// AlarmRings — one alarm-circle marker per green tower (same as original)
// ─────────────────────────────────────────────────────────────────────────────
const AlarmRings: React.FC<{ towers: Tower[] }> = ({ towers }) => (
  <>
    {towers
      .filter((t) => t.attributes.down_time === 0)
      .map((t) => (
        <Marker
          key={`alarm-${t.thingId}`}
          position={[t.attributes.location.lat, t.attributes.location.lng]}
          icon={alarmDivIcon}
          interactive={false}
        />
      ))}
  </>
);

// ─────────────────────────────────────────────────────────────────────────────
// CanvasIconLayer
//
// Renders all tower icons onto a single <canvas> using the browser's 2D API.
// Zero extra npm packages. Works in every bundler including Turbopack.
// Handles 40k points smoothly — one drawImage call per tower per frame.
//
// Hit-testing on mousemove/click is a simple bounding-box check over the
// towers array. For datasets > 20k you can swap this for an RBush spatial
// index, but the loop is fast enough for typical viewport counts.
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

  // Keep callbacks stable — layer captures them once at mount
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

    // ── Load icon images (with error fallback to colored circles) ──────────
    const greenImg = new Image();
    const redImg = new Image();
    let imagesReady = 0;
    let useFallback = false;

    // ── Canvas setup ────────────────────────────────────────────────────────
    const canvas = document.createElement("canvas");
    canvas.style.cssText =
      "position:absolute;top:0;left:0;pointer-events:none;z-index:400;";
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    // ── Cached pixel positions ─────────────────────────────────────────────
    // latLngToContainerPoint is the single biggest cost in hot paths.
    // Compute every tower's pixel position once per pan/zoom and reuse
    // for both drawing and hit-testing.
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

    // ── Draw all towers (uses cached positions) ────────────────────────────
    const drawNow = () => {
      if (imagesReady < 2 && !useFallback) return;
      if (positionsDirty) recomputePositions();

      const size = map.getSize();
      canvas.style.width = size.x + "px";
      canvas.style.height = size.y + "px";
      canvas.width = Math.round(size.x * dpr);
      canvas.height = Math.round(size.y * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size.x, size.y);

      // Off-screen culling bounds (pad by icon size)
      const minX = -iconWidth;
      const maxX = size.x + iconWidth;
      const minY = -iconHeight;
      const maxY = size.y + iconHeight;

      for (let i = 0; i < towers.length; i++) {
        const px = pixelPositions[i * 2];
        const py = pixelPositions[i * 2 + 1];
        // Skip towers outside the viewport — biggest single perf win
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

    // ── RAF-throttled draw ─────────────────────────────────────────────────
    // Multiple Leaflet "move" events fire during a single drag — coalesce
    // them into one paint per animation frame.
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
      console.warn(
        "[TowerMap] Tower icon PNG failed to load — falling back to colored circles",
      );
      useFallback = true;
      draw();
    };

    greenImg.onload = onImgLoad;
    redImg.onload = onImgLoad;
    greenImg.onerror = onImgError;
    redImg.onerror = onImgError;
    greenImg.src = greenIconUrl;
    redImg.src = redIconUrl;

    // ── Hit-test using cached pixel positions ──────────────────────────────
    const hitTest = (containerPt: L.Point): Tower | null => {
      if (positionsDirty) recomputePositions();
      const halfW = iconWidth / 2;
      // Iterate from last to first so towers drawn on top win the hit-test
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

    // ── Map event handlers ──────────────────────────────────────────────────
    // Mark positions dirty on pan/zoom so they get recomputed on next draw/hit
    const onMove = () => {
      positionsDirty = true;
      draw();
    };

    // RAF-throttle the mousemove — at most one hit-test per frame
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
      if (found) {
        onClickRef.current(found, e.latlng);
      }
    };

    // IMPORTANT: Append canvas directly to map CONTAINER, not to a pane.
    // Leaflet transforms its panes during pan/zoom; the canvas draws in
    // container coordinates, so a transformed parent would shift icons
    // off-screen. The container itself is never transformed.
    map.getContainer().appendChild(canvas);
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
      canvas.remove();
      map.getContainer().style.cursor = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, towers, greenIconUrl, redIconUrl, iconWidth, iconHeight]);

  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// GlobalTooltip — one positioned div shown on hover
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
// usePopupController — single native L.popup with React content inside
// ─────────────────────────────────────────────────────────────────────────────
function usePopupController(
  mapRef: React.RefObject<L.Map | null>,
  selectedTower: Tower | undefined,
  onClose: () => void,
) {
  const popupRef = useRef<L.Popup | null>(null);
  const rootRef = useRef<ReactDOMClient.Root | null>(null);
  const containerEl = useRef<HTMLDivElement | null>(null);
  const activeTower = useRef<Tower | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const renderContent = useCallback((tower: Tower, latestData?: Tower) => {
    if (!containerEl.current) return;
    if (!rootRef.current) {
      rootRef.current = ReactDOMClient.createRoot(containerEl.current);
    }

    rootRef.current.render(
      <div style={{ width: 450 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 12px",
            borderBottom: "1px solid #eee",
          }}
        >
          <strong style={{ fontSize: 13 }}>{tower.thingId}</strong>
          <button
            onClick={() => popupRef.current?.remove()}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
              padding: "0 2px",
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            width: 420,
            maxHeight: 450,
            overflowY: "auto",
            padding: "0 12px 12px",
          }}
        >
          {!latestData ||
          latestData.thingId !== tower.thingId ||
          !latestData.features?.components ? (
            <div className="p-4 text-sm text-gray-500">
              Loading tower details…
            </div>
          ) : (
            <TowerPreview
              structureType={latestData.attributes.structure_type}
              installationType={latestData.attributes.installation_type}
              components={latestData.features.components.properties ?? {}}
              uptime={latestData.attributes.uptime}
              down_time={latestData.attributes.down_time}
            />
          )}
        </div>
      </div>,
    );
  }, []);

  // Re-render when full tower data arrives from API
  useEffect(() => {
    if (
      activeTower.current &&
      selectedTower?.thingId === activeTower.current.thingId
    ) {
      renderContent(activeTower.current, selectedTower);
    }
  }, [selectedTower, renderContent]);

  const open = useCallback(
    (tower: Tower, latlng: L.LatLng) => {
      if (!mapRef.current) return;
      activeTower.current = tower;

      if (!containerEl.current) {
        containerEl.current = document.createElement("div");
      }

      renderContent(tower);

      if (popupRef.current) {
        popupRef.current.off("remove");
        popupRef.current.remove();
      }

      popupRef.current = L.popup({
        closeButton: false,
        maxWidth: 460,
        className: "tower-global-popup",
        autoPan: true,
      })
        .setLatLng(latlng)
        .setContent(containerEl.current)
        .openOn(mapRef.current);

      popupRef.current.on("remove", () => {
        activeTower.current = null;
        onCloseRef.current();
      });
    },
    [mapRef, renderContent],
  );

  const close = useCallback(() => {
    if (popupRef.current) {
      popupRef.current.off("remove");
      popupRef.current.remove();
      popupRef.current = null;
      activeTower.current = null;
    }
  }, []);

  return { open, close };
}

// ─────────────────────────────────────────────────────────────────────────────
// InnerMap — child of <MapContainer> so useMap() works
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
          greenIconUrl="/images/tower_icon_green.png"
          redIconUrl="/images/tower_icon_red.png"
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
  }, [setSelectedTowerId]);

  const popup = usePopupController(mapRef, selectedTower, handleClose);

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
      popup.open(tower, latlng);
      setTooltip(null);
    },
    [setSelectedTowerId, popup],
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
      </MapContainer>

      <GlobalTooltip state={tooltip} />
      <MapLegend />
    </div>
  );
};

export default TowerMap;
