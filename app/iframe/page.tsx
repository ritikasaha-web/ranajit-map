import React from "react";
import { div } from "three/tsl";

const Page = () => {
  const lat = 22.5726; // example latitude
  const lng = 88.3639; // example longitude
  const apiKey = "YOUR_API_KEY"; // replace with your key

  return (
    <div className="h-1/2 w-full m-auto">
      <div className="h-full w-full flex items-center justify-center bg-gray-100 p-4">
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0, borderRadius: 8 }}
          loading="lazy"
          allowFullScreen
          src={`https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&location=${lat},${lng}&heading=210&pitch=10&fov=80`}
        />
      </div>
    </div>
  );
};

export default Page;
