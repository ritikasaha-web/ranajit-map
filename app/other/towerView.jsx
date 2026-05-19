"use client";
import tower_image from "@/public/images/tower_image.png";
export default function TowerView({ twin }) {
  const height = twin?.attributes?.height_m || 100; // tower height in meters

  // Adjusted scale for more visible differences
  const minHeight = 150;  // pixel size for smallest tower
  const maxHeight = 800;  // pixel size for tallest tower
  const maxRealHeight = 200; // tallest real tower (m)
  const scaledHeight = Math.min(
    Math.max((height / maxRealHeight) * maxHeight, minHeight),
    maxHeight
  );

  return (
    <div className="flex flex-col items-center justify-end w-full mt-7 bg-transparent relative">
      <div
        className="flex items-end justify-center"
        style={{
          height: `${scaledHeight}px`,
          transition: "height 0.3s ease",
        }}
      >
        <img
          src={tower_image.src}
          alt="Tower"
          className="object-contain"
          style={{
            height: "100%",
            backgroundColor: "transparent",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
      </div>

      <div className=" text-lg font-semibold text-gray-700 bg-white/70 px-4 py-1 rounded-lg shadow">
        Height: {height} 
      </div>
    </div>
  );
}
