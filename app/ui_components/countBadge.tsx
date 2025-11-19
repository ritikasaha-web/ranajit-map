export function CountBadge({
  x,
  y,
  count,
}: {
  x: number;
  y: number;
  count: number;
}) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Red circle background */}
      <circle cx="0" cy="0" r="15" fill="red" stroke="black" strokeWidth="2" />

      {/* Number text */}
      <text
        x="0"
        y="6"
        fontSize="16"
        fontWeight="bold"
        textAnchor="middle"
        fill="white"
      >
        {count}
      </text>
    </g>
  );
}
