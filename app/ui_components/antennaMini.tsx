export function AntennaMini({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(0.25)`}>
      <rect
        x="0"
        y="0"
        width="26"
        height="110"
        rx="6"
        fill="red"
        stroke="black"
        strokeWidth="3"
      />
      <rect
        x="26"
        y="45"
        width="14"
        height="20"
        rx="4"
        fill="red"
        stroke="black"
        strokeWidth="2"
      />
    </g>
  );
}
