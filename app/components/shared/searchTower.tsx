import React from "react";
import { div } from "three/tsl";
import { FaSearch } from "react-icons/fa";

const searchTower = () => {
  return (
    <div className="absolute z-9999  top-4 left-16 ">
      <input
        placeholder="Search Tower"
        className="w-80 h-12 border border-black rounded-full bg-white font pl-2"
      />
      <FaSearch
        size={25}
        className="absolute top-3 right-4 text-gray-500 opacity-60"
      />
    </div>
  );
};

export default searchTower;
