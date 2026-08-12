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
import { isValidIndianSiteLocation } from "@/app/utils/indiaBounds";
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
    critical_fault?: boolean;
    temperature?: number;
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
      map.fitBounds(L.latLngBounds(positions), { padding: [20, 20] });
    }
  }, [map, positions]);
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// CanvasIconLayer
// ─────────────────────────────────────────────────────────────────────────────
const drawStatusBadge = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  glyph: string,
) => {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#fff";
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = "bold 7px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(glyph, x, y + 0.5);
};

// Pulse rings only render when at most this many up-towers are visible in
// the viewport. Zoomed out (thousands visible) they'd be unreadable noise
// AND a per-frame cost multiplier — so the map stays static there, and
// the animation kicks in automatically once the user zooms into an area
// with few enough towers to make individual rings meaningful.
const MAX_PULSE_RINGS = 300;
const PULSE_CYCLE_MS = 1500;
const PULSE_COLOR = "#01c001";
const drawPulseRing = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  nowMs: number,
) => {
  const t = Math.min((nowMs % PULSE_CYCLE_MS) / PULSE_CYCLE_MS / 0.8, 1);
  const scale = 0.5 + t;
  const opacity = 0.8 * (1 - t);
  if (opacity <= 0) return;
  ctx.beginPath();
  ctx.arc(x, y, 12.5 * scale, 0, Math.PI * 2);
  ctx.strokeStyle = PULSE_COLOR;
  ctx.lineWidth = 3 * scale;
  ctx.globalAlpha = opacity;
  ctx.stroke();
  ctx.globalAlpha = 1;
};

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

  useEffect(() => { onHoverRef.current = onHover; }, [onHover]);
  useEffect(() => { onHoverOffRef.current = onHoverOff; }, [onHoverOff]);
  useEffect(() => { onClickRef.current = onClick; }, [onClick]);

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
    // Index of the tower currently under the cursor (-1 = none) — used to
    // draw a highlight halo so the user can tell which tower the hover
    // tooltip belongs to in dense areas.
    const hoveredIdxRef = { current: -1 };
    // Screen positions of visible up-towers, collected during the icon
    // pass so rings can be drawn (or skipped wholesale) afterwards.
    const ringPositions = new Float32Array(MAX_PULSE_RINGS * 2);
    let ringsAnimating = false;
    let forceRedraw = true;
    let lastHoveredDrawn = -1;

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

    const drawNow = (nowMs: number) => {
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

      let upVisibleCount = 0;

      for (let i = 0; i < towers.length; i++) {
        const px = pixelPositions[i * 2];
        const py = pixelPositions[i * 2 + 1];
        if (px < minX || px > maxX || py < minY || py > maxY) continue;

        const tower = towers[i];
        // Colour reflects up/down only — critical fault / high temp are
        // surfaced as badges instead, so an "up" tower always reads green.
        const isRed = tower.attributes.down_time !== 0;

        if (useFallback) {
          ctx.fillStyle = isRed ? "#ef4444" : "#22c55e";
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(px, py - iconHeight / 2, iconWidth / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else {
          const img = isRed ? redImg : greenImg;
          ctx.drawImage(
            img,
            px - iconWidth / 2,
            py - iconHeight,
            iconWidth,
            iconHeight,
          );
        }

        // Collect visible up-tower positions; rings are drawn after the
        // loop only if the total stays within the animation budget.
        if (!isRed) {
          if (upVisibleCount < MAX_PULSE_RINGS) {
            ringPositions[upVisibleCount * 2] = px;
            ringPositions[upVisibleCount * 2 + 1] = py - iconHeight - 5.5;
          }
          upVisibleCount++;
        }

        // ── Status badges (bottom-right corner of the icon) ──
        const hasCriticalFault = tower.attributes.critical_fault === true;
        const hasHighTemp = (tower.attributes.temperature ?? 0) > 40;

        if (hasCriticalFault || hasHighTemp) {
          const badgeR = 5;
          const badgeX = px + iconWidth / 2 - 3;
          let badgeY = py - 3;

          if (hasCriticalFault) {
            drawStatusBadge(ctx, badgeX, badgeY, badgeR, "#dc2626", "!");
            badgeY -= badgeR * 2 + 2;
          }
          if (hasHighTemp) {
            drawStatusBadge(ctx, badgeX, badgeY, badgeR, "#f97316", "H");
          }
        }
      }

      // Pulse rings, budget-gated: skipped entirely when too many
      // up-towers are on screen (see MAX_PULSE_RINGS). ringsAnimating
      // feeds back into the ticker — when false, the map stops
      // re-rendering every frame and goes fully static until the next
      // pan/zoom/hover.
      ringsAnimating = upVisibleCount > 0 && upVisibleCount <= MAX_PULSE_RINGS;
      if (ringsAnimating) {
        for (let r = 0; r < upVisibleCount; r++) {
          drawPulseRing(
            ctx,
            ringPositions[r * 2],
            ringPositions[r * 2 + 1],
            nowMs,
          );
        }
      }

      // Highlight halo around the hovered tower, drawn last so it stays
      // visible above neighbouring icons in dense clusters.
      const hi = hoveredIdxRef.current;
      if (hi >= 0 && hi < towers.length) {
        const hx = pixelPositions[hi * 2];
        const hy = pixelPositions[hi * 2 + 1];
        ctx.beginPath();
        ctx.arc(hx, hy - iconHeight / 2, iconWidth * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(2,132,199,0.15)";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#0284c7";
        ctx.stroke();
      }
    };

    // Redraw only when something actually changed: the viewport moved,
    // the hovered tower changed, or rings are actively animating (which
    // the draw itself reports via ringsAnimating). An idle zoomed-out map
    // with rings over budget does no canvas work at all.
    const FRAME_INTERVAL_MS = 1000 / 24;
    let rafId: number | null = null;
    let lastDrawMs = 0;
    const tick = (nowMs: number) => {
      if (nowMs - lastDrawMs >= FRAME_INTERVAL_MS) {
        const hoverChanged = hoveredIdxRef.current !== lastHoveredDrawn;
        if (forceRedraw || positionsDirty || ringsAnimating || hoverChanged) {
          lastDrawMs = nowMs;
          forceRedraw = false;
          drawNow(nowMs);
          lastHoveredDrawn = hoveredIdxRef.current;
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    const onImgLoad = () => {
      imagesReady++;
      forceRedraw = true;
    };
    const onImgError = () => {
      useFallback = true;
      forceRedraw = true;
    };

    greenImg.onload = onImgLoad;
    redImg.onload = onImgLoad;
    greenImg.onerror = onImgError;
    redImg.onerror = onImgError;
    greenImg.src = greenIconUrl;
    redImg.src = redIconUrl;

    const hitTest = (containerPt: L.Point): number => {
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
          return i;
        }
      }
      return -1;
    };

    const onMove = () => {
      positionsDirty = true;
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
        const foundIdx = hitTest(ev.containerPoint);
        hoveredIdxRef.current = foundIdx;
        if (foundIdx >= 0) {
          onHoverRef.current(
            towers[foundIdx],
            ev.containerPoint.x,
            ev.containerPoint.y,
          );
          map.getContainer().style.cursor = "pointer";
        } else {
          onHoverOffRef.current();
          map.getContainer().style.cursor = "";
        }
      });
    };

    const onMapClick = (e: L.LeafletMouseEvent) => {
      const foundIdx = hitTest(e.containerPoint);
      if (foundIdx >= 0) onClickRef.current(towers[foundIdx], e.latlng);
    };

    const onMouseOut = () => {
      hoveredIdxRef.current = -1;
      onHoverOffRef.current();
      map.getContainer().style.cursor = "";
    };

    // 3. Inject canvas into the Marker Pane (z-index 600) instead of the Map Container
    // This allows the React-Leaflet Popup (z-index 700) to naturally render on top!
    const pane = map.getPane("markerPane");
    if (pane) pane.appendChild(canvas);

    map.on("move zoom viewreset resize moveend zoomend", onMove);
    map.on("mousemove", onMouseMove);
    map.on("mouseout", onMouseOut);
    map.on("click", onMapClick);
    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (mouseRafId !== null) cancelAnimationFrame(mouseRafId);
      map.off("move zoom viewreset resize moveend zoomend", onMove);
      map.off("mousemove", onMouseMove);
      map.off("mouseout", onMouseOut);
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
  const setIsSidebarOpen = useTowerStore((s) => s.setIsSidebarOpen);
  const { data: selectedTower } = useTower(selectedTowerId ?? undefined);

  const validTowers = useMemo(
    () =>
      (towers as Tower[]).filter((t) =>
        isValidIndianSiteLocation(
          t.attributes.location?.lat,
          t.attributes.location?.lng,
        ),
      ),
    [towers],
  );

  const positions = useMemo(
    () =>
      validTowers.map(
        (t) =>
          [t.attributes.location.lat, t.attributes.location.lng] as [
            number,
            number,
          ],
      ),
    [validTowers],
  );

  // Keep popup in sync
  useEffect(() => {
    if (!selectedTowerId) setActivePopup(null);
  }, [selectedTowerId]);

  const handleClose = useCallback(() => {
    setActivePopup(null);
    setIsSidebarOpen(false);
    setTimeout(() => setSelectedTowerId(null), 300);
  }, [setSelectedTowerId, setIsSidebarOpen]);

  // Tooltip only appears after the cursor rests on a tower for a beat —
  // with tens of thousands of sites, sweeping the cursor across the map
  // would otherwise flash a tooltip for every tower it grazes.
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingHover = useRef<TooltipState | null>(null);
  const shownTowerIdRef = useRef<string | null>(null);

  const handleHover = useCallback((tower: Tower, x: number, y: number) => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    if (shownTowerIdRef.current === tower.thingId) {
      // Already showing this tower's tooltip — just follow the cursor.
      setTooltip({ tower, x, y });
      return;
    }
    const pending = pendingHover.current;
    pendingHover.current = { tower, x, y };
    if (!pending || pending.tower.thingId !== tower.thingId) {
      if (showTimer.current) clearTimeout(showTimer.current);
      showTimer.current = setTimeout(() => {
        showTimer.current = null;
        const p = pendingHover.current;
        if (p) {
          shownTowerIdRef.current = p.tower.thingId;
          setTooltip(p);
        }
      }, 250);
    }
  }, []);

  const handleHoverOff = useCallback(() => {
    if (showTimer.current) {
      clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    pendingHover.current = null;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      shownTowerIdRef.current = null;
      setTooltip(null);
    }, 80);
  }, []);

  const handleTowerClick = useCallback(
    (tower: Tower, latlng: L.LatLng) => {
      setSelectedTowerId(tower.thingId);
      setIsSidebarOpen(true);
      setActivePopup({ tower, latlng });
      if (showTimer.current) {
        clearTimeout(showTimer.current);
        showTimer.current = null;
      }
      pendingHover.current = null;
      shownTowerIdRef.current = null;
      setTooltip(null);
    },
    [setSelectedTowerId, setIsSidebarOpen],
  );

  return (
    <div className="w-full h-screen" style={{ position: "relative" }}>
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
          towers={validTowers}
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
              selectedTower.thingId !== activePopup.tower.thingId ? (
                <div className="p-4 text-sm text-gray-500">
                  Loading tower details…
                </div>
              ) : (
                <TowerPreview
                  structureType={selectedTower.attributes.structure_type}
                  installationType={selectedTower.attributes.installation_type}
                  // The new backend has no per-site component inventory
                  // (that was Ditto-only data) — with an empty object the
                  // preview renders the base tower without accessory
                  // layers instead of blocking on "Loading…" forever.
                  components={
                    selectedTower.features?.components?.properties ?? {}
                  }
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
