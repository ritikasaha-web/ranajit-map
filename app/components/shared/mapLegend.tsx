// import online_icon from "@/public/images/tower_icon_green.png";
// import risk_icon from "@/public/images/tower_icon_orange.png";
// import down_icon from "@/public/images/tower_icon_red.png";
const MapLegend = () => {
  const items = [
    {
      icon: "https://dev-citadel.codez.co.in/ranajit_map/images/tower_icon_green.png",
      label: "Online",
      color: "#16a34a",
    },
    // {
    //   icon: "/images/tower_icon_orange.png",
    //   label: "Running at Risk",
    //   sub: "< 20 min down",
    //   color: "#ea580c",
    // },
    {
      icon: "https://dev-citadel.codez.co.in/ranajit_map/images/tower_icon_red.png",
      label: "Down",
      color: "#dc2626",
    },
  ];

  const badges = [
    { glyph: "!", color: "#dc2626", label: "Critical Fault" },
    { glyph: "H", color: "#f97316", label: "High Temperature" },
  ];

  return (
    <div className="absolute font-rubik bottom-2 left-4 z-[1000] bg-transparent px-2 py-1 flex items-center gap-1.5 flex-wrap max-w-[92vw]">
      {items.map(({ icon, label, color }) => (
        <div
          key={label}
          className="flex items-center gap-1.5 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] pl-1.5 pr-3 py-0.5"
        >
          <img
            src={icon}
            alt={label}
            className="w-3.5 h-5 object-contain shrink-0"
          />
          <span
            className="text-[11px] font-normal whitespace-nowrap tracking-tight"
            style={{ color }}
          >
            {label}
          </span>
        </div>
      ))}

      {badges.map(({ glyph, color, label }) => (
        <div
          key={label}
          className="flex items-center gap-1.5 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] pl-1 pr-3 py-0.5"
        >
          <span
            className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0 shadow-sm"
            style={{ backgroundColor: color }}
          >
            {glyph}
          </span>
          <span
            className="text-[11px] font-normal whitespace-nowrap tracking-tight"
            style={{ color }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default MapLegend;
