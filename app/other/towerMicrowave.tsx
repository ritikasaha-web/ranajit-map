export function Microwave({
  x,
  y,
  flip = false,
}: {
  x: number;
  y: number;
  flip?: boolean;
}) {
  return (
    <g
      transform={
        flip
          ? `translate(${x + 60}, ${y}) scale(-1,1)`
          : `translate(${x}, ${y})`
      }
    >
      {/* Back rectangle */}
      <rect
        x="40"
        y="10"
        width="20"
        height="60"
        rx="4"
        fill="gray"
        stroke="black"
        strokeWidth="3"
      />
      {/* Fan dish */}
      <path
        d="M10 10 Q0 40 10 70 L40 40 Z"
        fill="gray"
        stroke="black"
        strokeWidth="3"
      />
    </g>
  );
}
