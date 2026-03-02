import React from "react";
import { RxCross2 } from "react-icons/rx";

const page = () => {
  const towerItems = [
    "antenna",
    "backup_supply",
    "beacon",
    "equipment_shelter",
    "fuel_tank",
    "ladder",
    "lightning_rod",
    "microwave",
    "power_cabinate",
  ];

  const Compoenents = [
    "antenna",
    "backup_supply",
    "beacon",
    "equipment_shelter",
    "fuel_tank",
    "ladder",
    "lightning_rod",
    "microwave",
    "power_cabinate",
  ];

  return (
    <div className="flex h-screen w-screen items-center justify-center dim-background fixed inset-0 z-50">
      <div className="flex relative h-4/5 w-4/5 rounded-3xl bg-white place-items-center gap-6 p-6">
        <div className="absolute top-6 right-6 text-3xl cursor-pointer opacity-60 duration-150 rounded-full bg-black/10 p-0.5 hover:opacity-100">
          <RxCross2 />
        </div>
        <div className="w-1/2 bg-white rounded-3xl">
          <div className="relative w-full h-[500px] rounded-3xl ">
            <img
              src="/GBT.webp"
              alt="GBT"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />

            <img
              src="/four_pole/four_pole.webp"
              alt="Four Pole"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />

            {towerItems.map((item) => (
              <img
                key={item}
                src={`/four_pole/${item}.webp`}
                alt={item}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />
            ))}
          </div>
        </div>
        <hr className=" w-0.5 h-4/5 bg-black rounded-md" />
        <div className="w-1/2 h-4/5">
          <div>
            <h1 className="text-2xl font-semibold">towerId</h1>
          </div>
          <div className="my-4 flex place-items-center text-xl">
            <div>GBT</div>
            <hr className="bg-black opacity-80 w-px h-4 mx-2" />
            <div>4 Poled lattice</div>
          </div>
          <div className="h-4/5 overflow-y-auto pr-2 space-y-4">
            {Compoenents.map(([key, value], index) => (
              <div
                key={index}
                className="flex justify-between border-b text-lg"
              >
                <span className="">{String(key)}</span>
                <span className="">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
