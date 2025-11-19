"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import "cesium/Build/Cesium/Widgets/widgets.css";

const CesiumOfflineGlobe = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    let viewer;

    const init = async () => {
      if (!containerRef.current) return;

      // Prevent multiple initializations
      if ((containerRef.current )._viewerInitialized) return;
      (containerRef.current )._viewerInitialized = true;

      const Cesium = await import("cesium");
      (window ).CESIUM_BASE_URL = "/cesium";

      viewer = new Cesium.Viewer(containerRef.current, {
        animation: false,
        timeline: false,
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        fullscreenButton: false,
        infoBox: false,
        selectionIndicator: false,
        terrainProvider: new Cesium.EllipsoidTerrainProvider(),
        imageryProvider: new Cesium.UrlTemplateImageryProvider({
          url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        }),
      });

      // Hide default atmosphere and skybox
      if (viewer.scene.skyBox) viewer.scene.skyBox.show = false;
      if (viewer.scene.skyAtmosphere) viewer.scene.skyAtmosphere.show = false;
      viewer.scene.backgroundColor = Cesium.Color.BLACK;

      // Add example towers
      const towers = [
        { name: "Tower A", lat: 22.5726, lng: 88.3639, height: 100 },
        { name: "Tower B", lat: 28.6139, lng: 77.209, height: 80 },
      ];

      towers.forEach((t) => {
        viewer.entities.add({
          name: t.name,
          position: Cesium.Cartesian3.fromDegrees(t.lng, t.lat, t.height),
          point: { pixelSize: 10, color: Cesium.Color.ORANGE },
          label: {
            text: `${t.name} (${t.height}m)`,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -15),
          },
        });
      });

      viewer.zoomTo(viewer.entities);

      // Store viewer reference for cleanup
      (containerRef.current )._viewer = viewer;
    };

    init();

    // Cleanup on unmount
    return () => {
      if (containerRef.current && (containerRef.current )._viewer) {
        (containerRef.current )._viewer.destroy();
        delete (containerRef.current )._viewer;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-screen overflow-hidden"
      style={{ minHeight: "100vh" }}
    />
  );
};

export default dynamic(() => Promise.resolve(CesiumOfflineGlobe), {
  ssr: false,
});
