import React from "react";
import { RxCross2 } from "react-icons/rx";
import { LuEye } from "react-icons/lu";
import { useState } from "react";

const ExpandTowerPreview = ({
  onClose,
  currTower,
}: {
  onClose: () => void;
  currTower: any;
}) => {
  const towerItems = currTower?.features?.components?.properties || {};

  const Compoenents = currTower?.features?.components?.properties || {};

  const [activeComponents, setActiveComponents] = useState<Set<string>>(
    new Set(),
  );
  const toggleComponent = (component: string) => {
    setActiveComponents((prev) => {
      const next = new Set(prev);

      if (next.has(component)) {
        next.delete(component);
      } else {
        next.add(component);
      }

      return next;
    });
  };
  const shouldRenderComponent = (component: string) => {
    // If nothing is selected → show all
    if (activeComponents.size === 0) return true;

    // Otherwise show only selected ones
    return activeComponents.has(component);
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center dim-background absolute inset-0 z-9999">
      <div className="flex relative h-4/5 w-4/5 rounded-3xl bg-white place-items-center gap-6 p-6">
        <div className="absolute top-6 right-6 text-3xl cursor-pointer opacity-60 duration-150 rounded-full bg-black/10 p-0.5 hover:opacity-100">
          <RxCross2 onClick={onClose} />
        </div>
        <div className="w-1/2 bg-white rounded-3xl">
          <div className="relative w-full h-[500px] rounded-3xl ">
            <img
              src={
                `/${currTower?.attributes?.installation_type}.png` || "/GBT.png"
              }
              alt="Installation Type"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />

            <img
              src={
                `/${currTower?.attributes?.structure_type}/${currTower?.attributes?.structure_type}.png` ||
                "/four_pole/four_pole.png"
              }
              alt="Four Pole"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />

            {Object.keys(towerItems)
              .filter((item) => shouldRenderComponent(item))
              .map((item: string) => (
                <img
                  key={item}
                  src={`/${currTower?.attributes?.structure_type}/${item}.png`}
                  alt={item}
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />
              ))}
          </div>
        </div>
        <hr className=" w-0.5 h-4/5 bg-black rounded-md" />
        <div className="w-1/2 h-4/5">
          <div>
            <h1 className="text-2xl font-semibold">{currTower?.thingId}</h1>
          </div>
          <div className="my-4 flex place-items-center text-xl">
            <div>
              {currTower?.attributes?.structure_type === "monopole" &&
              currTower?.attributes?.installation_type === "GBT"
                ? "GBM"
                : currTower?.attributes?.installation_type}
              {/* {currTower?.attributes?.installation_type === "GBM"
                ? "GBT"
                : currTower?.attributes?.installation_type} */}
            </div>
            <hr className="bg-black opacity-80 w-px h-4 mx-2" />
            <div>
              {" "}
              {currTower?.attributes?.structure_type
                ?.replace(/_/g, " ")
                .toLowerCase()
                .replace(/\b\w/g, (c: any) => c.toUpperCase())}
            </div>
          </div>
          <div className="h-4/5 overflow-y-auto pr-2 space-y-4">
            {Object.entries(Compoenents).map(([key, value], index) => (
              <div
                key={index}
                className="flex justify-between border-b text-lg"
              >
                <span className="">{String(key)}</span>
                <span className="flex gap-4 items-center">
                  <div>{String(value)}</div>
                  <div
                    onClick={() => toggleComponent(String(key))}
                    className={`cursor-pointer transition-colors ${
                      activeComponents.has(String(key))
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  >
                    <LuEye />
                  </div>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpandTowerPreview;
