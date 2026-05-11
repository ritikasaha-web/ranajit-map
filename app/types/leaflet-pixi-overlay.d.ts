import * as L from "leaflet";
import type { Container, IRenderer } from "pixi.js";

declare module "leaflet-pixi-overlay" {
  interface PixiOverlayUtils {
    latLngToLayerPoint: (latlng: [number, number]) => { x: number; y: number };
    getScale: () => number;
    getRenderer: () => IRenderer;
    getContainer: () => Container;
    getMap: () => L.Map;
  }

  type DrawCallback = (utils: PixiOverlayUtils) => void;

  interface PixiOverlayOptions {
    padding?: number;
    forceCanvas?: boolean;
    destroyInteractionManager?: boolean;
    autoPreventDefault?: boolean;
    resolution?: number;
    projectionZoom?: (map: L.Map) => number;
    pane?: string;
  }

  function pixiOverlay(
    drawCallback: DrawCallback,
    container: Container,
    options?: PixiOverlayOptions,
  ): L.Layer;
}

declare module "leaflet" {
  function pixiOverlay(
    drawCallback: import("leaflet-pixi-overlay").DrawCallback,
    container: import("pixi.js").Container,
    options?: import("leaflet-pixi-overlay").PixiOverlayOptions,
  ): L.Layer;
}
