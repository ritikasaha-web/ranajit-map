export function Antenna({
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
          ? `translate(${x + 24}, ${y}) scale(-1, 1)`
          : `translate(${x}, ${y})`
      }
    >
      <rect
        width="24"
        height="100"
        rx="6"
        fill="gray"
        stroke="black"
        strokeWidth="3"
      />
      <rect
        x="24"
        y="42"
        width="12"
        height="16"
        rx="3"
        fill="gray"
        stroke="black"
        strokeWidth="2"
      />
    </g>
  );
}
