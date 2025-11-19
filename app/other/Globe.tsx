"use client";
import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const Globe = () => {
  const globeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadGlobe = async () => {
      const Globe = (await import("globe.gl")).default;
      const THREE = await import("three");

      const globe = new Globe(globeRef.current!);

      globe
        .globeImageUrl("/images/earth_8k.png")
        .bumpImageUrl("")
        .pointOfView({ lat: 20, lng: 80, altitude: 2 });

      const towers = [
        { name: "Tower A", lat: 22.5726, lng: 88.3639, height: 100 },
        { name: "Tower B", lat: 28.6139, lng: 77.209, height: 80 },
        { name: "Tower C", lat: 19.076, lng: 72.8777, height: 120 },
      ];

      globe
        .pointsData(towers)
        .pointAltitude((d: any) => d.height / 1000)
        .pointColor(() => "#ff8800")
        .pointRadius(0.3)
        .onPointClick((t: any) => alert(`${t.name} (${t.height}m)`));

      // Controls
      const controls = globe.controls();
      controls.autoRotate = false;
      controls.enableZoom = true;

      // ---- LIMIT ZOOM ---- //
      // controls.minDistance = 200; // minimum zoom (stop getting too close)
      controls.maxDistance = 600;

      // Renderer quality
      const renderer: any = globe.renderer();
      renderer.setPixelRatio(window.devicePixelRatio);

      // ---- 👇 ADD STARS, SUN & GALAXY BACKGROUND ---- //

      const scene: any = globe.scene();

      // ★ STARFIELD
      const starGeometry = new THREE.BufferGeometry();
      const starVertices = [];

      for (let i = 0; i < 5000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starVertices.push(x, y, z);
      }

      starGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(starVertices, 3)
      );

      const starMaterial = new THREE.PointsMaterial({
        size: 1,
      });

      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);

      // 🌌 GALAXY BACKGROUND
      const galaxyGeo = new THREE.SphereGeometry(1500, 64, 64);
      const galaxyMat = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("/images/space_bg.jpg"),
        side: THREE.BackSide,
      });
      const galaxy = new THREE.Mesh(galaxyGeo, galaxyMat);
      scene.add(galaxy);
    };

    loadGlobe();
  }, []);

  return (
    <div
      ref={globeRef}
      className="w-full h-screen  overflow-hidden border border-gray-700"
    />
  );
};

export default dynamic(() => Promise.resolve(Globe), { ssr: false });
