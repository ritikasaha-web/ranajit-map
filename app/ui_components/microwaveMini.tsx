export function MicrowaveMini({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(0.25)`}>
      {/* Rectangle body */}
      <rect
        x="40"
        y="10"
        width="26"
        height="80"
        rx="5"
        fill="red"
        stroke="black"
        strokeWidth="3"
      />

      {/* Curved dish */}
      <path
        d="M10 10 Q-2 50 10 90 L40 50 Z"
        fill="red"
        stroke="black"
        strokeWidth="3"
      />
    </g>
  );
}
