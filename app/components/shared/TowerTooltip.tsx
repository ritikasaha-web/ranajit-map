import React, { useMemo } from "react";
interface TowerTooltipProps {
  thingId: string;
  down_time: number;
  uptime: number;
  bb_hours?: number;
  eb_sanction_load?: number;
  id_od?: string;
  dg?: string;
}

const formatDuration = (minutes: number): string => {
  const totalSeconds = minutes * 60;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const TowerTooltip = ({
  thingId,
  down_time,
  uptime,
  bb_hours,
  eb_sanction_load,
  id_od,
  dg,
}: TowerTooltipProps) => {
  const randomized = useMemo(
    () => ({
      bb_hours:
        bb_hours ?? parseFloat((Math.random() * (6 - 3) + 3).toFixed(1)),
      eb_sanction_load: eb_sanction_load ?? Math.floor(Math.random() * 26) + 5,
      id_od: id_od ?? (Math.random() > 0.5 ? "IN / OUT" : "OUT / IN"),
      dg: dg ?? ["Running", "Standby", "Off"][Math.floor(Math.random() * 3)],
    }),
    [thingId],
  ); // keyed to thingId so each tower gets stable values
  const isOnline = down_time === 0;
  const isSevere = down_time > 20;

  const statusLabel = isOnline ? "Online" : isSevere ? "Severe" : "Degraded";
  const statusColor = isOnline ? "#16a34a" : isSevere ? "#dc2626" : "#ea580c";
  const statusBg = isOnline ? "#f0fdf4" : isSevere ? "#fef2f2" : "#fff7ed";
  const statusBorder = isOnline ? "#bbf7d0" : isSevere ? "#fecaca" : "#fed7aa";

  return (
    <div
      style={{
        width: "230px",
        background: "#ffffff",
        minWidth: "230px", // 👈 add this
        borderRadius: "10px",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
        boxShadow:
          "0 4px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(14,165,233,0.15)",
        position: "relative",
      }}
    >
      {/* Blue top accent bar */}
      <div
        style={{
          height: "3px",
          background: "linear-gradient(90deg, #0284c7, #38bdf8)",
        }}
      />

      {/* Header */}
      <div
        style={{ padding: "10px 14px 8px", borderBottom: "1px solid #f1f5f9" }}
      >
        <p
          style={{
            fontSize: "9px",
            letterSpacing: "0.1em",
            color: "#94a3b8",
            textTransform: "uppercase",
            marginBottom: "2px",
          }}
        >
          Tower ID
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#0f172a",
              letterSpacing: "-0.01em",
              wordBreak: "break-all",
              flex: 1,
            }}
          >
            {thingId}
          </p>
          {/* Status badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              background: statusBg,
              border: `1px solid ${statusBorder}`,
              borderRadius: "20px",
              padding: "3px 9px 3px 7px",
              flexShrink: 0, // 👈 prevents badge from squishing
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: statusColor,
                flexShrink: 0,
              }}
            />
            <span
              style={{ fontSize: "10px", fontWeight: 600, color: statusColor }}
            >
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Uptime / Downtime */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        <div style={{ padding: "8px 14px", borderRight: "1px solid #f1f5f9" }}>
          <p
            style={{
              fontSize: "9px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#94a3b8",
              marginBottom: "3px",
            }}
          >
            Uptime
          </p>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#16a34a",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatDuration(uptime)}
          </p>
        </div>
        <div style={{ padding: "8px 14px" }}>
          <p
            style={{
              fontSize: "9px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#94a3b8",
              marginBottom: "3px",
            }}
          >
            Downtime
          </p>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: isOnline ? "#94a3b8" : statusColor,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {isOnline ? "—" : formatDuration(down_time)}
          </p>
        </div>
      </div>

      {/* Info rows — matches the sidebar's "Label: Value" pattern */}
      <div style={{ padding: "8px 0" }}>
        <Row
          icon={<BatteryIcon />}
          label="Battery Backup"
          value={`${randomized.bb_hours} hrs`}
          valueColor={
            randomized.bb_hours >= 5
              ? "#16a34a"
              : randomized.bb_hours >= 3
                ? "#ea580c"
                : "#dc2626"
          }
        />
        <Row
          icon={<BoltIcon />}
          label="EB Sanction Load"
          value={`${randomized.eb_sanction_load} kW`}
        />
        <Row icon={<PinIcon />} label="ID / OD" value={randomized.id_od} />
        <Row
          icon={<DGIcon />}
          label="DG Status"
          value={randomized.dg}
          valueColor={
            randomized.dg === "Running"
              ? "#0284c7"
              : randomized.dg === "Standby"
                ? "#64748b"
                : "#dc2626"
          }
        />
      </div>
    </div>
  );
};

const Row = ({
  icon,
  label,
  value,
  valueColor = "#0f172a",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "5px 14px",
      borderBottom: "1px solid #f8fafc",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
      <span style={{ color: "#0284c7", display: "flex" }}>{icon}</span>
      <span style={{ fontSize: "11px", color: "#64748b" }}>{label}</span>
    </div>
    <span style={{ fontSize: "11px", fontWeight: 600, color: valueColor }}>
      {value}
    </span>
  </div>
);

const BatteryIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
  >
    <rect x="2" y="7" width="18" height="11" rx="2" />
    <path d="M22 11v3" />
  </svg>
);
const BoltIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);
const PinIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
  >
    <circle cx="12" cy="10" r="3" />
    <path d="M12 2a8 8 0 0 1 8 8c0 5-8 13-8 13S4 15 4 10a8 8 0 0 1 8-8z" />
  </svg>
);
const DGIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

export default TowerTooltip;
