// import online_icon from "@/public/images/tower_icon_green.png";
// import risk_icon from "@/public/images/tower_icon_orange.png";
// import down_icon from "@/public/images/tower_icon_red.png";
const MapLegend = () => {
  const items = [
    {
      icon: "https://dev-citadel.codez.co.in/ranajit_map/images/tower_icon_green.png",
      label: "Online",
      sub: "No downtime",
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
      sub: "> 20 min down",
      color: "#dc2626",
    },
  ];

  const badges = [
    { glyph: "!", color: "#dc2626", label: "Critical Fault" },
    { glyph: "H", color: "#f97316", label: "High Temperature" },
  ];

  return (
    <div className="absolute bottom-6 left-4 z-[1000] rounded-xl shadow-lg border border-sky-200 bg-white overflow-hidden min-w-[160px]">
      {/* Blue top accent bar */}
      <div className="h-[3px] bg-gradient-to-r from-sky-500 to-blue-400" />

      <div className="px-4 py-3 flex flex-col gap-2.5">
        <p className="text-[9px] uppercase tracking-widest text-sky-400 font-semibold border-b border-sky-100 pb-1.5">
          Tower Status
        </p>

        {items.map(({ icon, label, sub, color }) => (
          <div key={label} className="flex items-center gap-3">
            <img
              src={icon}
              alt={label}
              className="w-5 h-7 object-contain shrink-0"
            />
            <div>
              <p
                className="text-xs font-semibold leading-none"
                style={{ color }}
              >
                {label}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
            </div>
          </div>
        ))}

        <p className="text-[9px] uppercase tracking-widest text-sky-400 font-semibold border-b border-t border-sky-100 py-1.5 mt-0.5">
          Badges
        </p>

        {badges.map(({ glyph, color, label }) => (
          <div key={label} className="flex items-center gap-3">
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              style={{ backgroundColor: color }}
            >
              {glyph}
            </span>
            <p className="text-xs font-semibold leading-none text-slate-700">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapLegend;
