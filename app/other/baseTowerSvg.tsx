export default function BaseTowerSVG() {
  // Tower coordinates
  const topY = 20;
  const bottomY = 580;
  const leftBottomX = 110;
  const rightBottomX = 190;
  const leftTopX = 140;
  const rightTopX = 160;

  const sections = 9;
  const sectionHeight = (bottomY - (topY + 70)) / sections;

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const braces = [];

  for (let i = 0; i < sections; i++) {
    const y1 = topY + 70 + i * sectionHeight;
    const y2 = y1 + sectionHeight;
    const t1 = (y1 - (topY + 70)) / (bottomY - (topY + 70));
    const t2 = (y2 - (topY + 70)) / (bottomY - (topY + 70));

    const leftX1 = lerp(leftTopX, leftBottomX, t1);
    const rightX1 = lerp(rightTopX, rightBottomX, t1);
    const leftX2 = lerp(leftTopX, leftBottomX, t2);
    const rightX2 = lerp(rightTopX, rightBottomX, t2);

    braces.push(
      <g key={i}>
        <line
          x1={leftX1}
          y1={y1}
          x2={rightX2}
          y2={y2}
          stroke="black"
          strokeWidth="3"
        />
        <line
          x1={rightX1}
          y1={y1}
          x2={leftX2}
          y2={y2}
          stroke="black"
          strokeWidth="3"
        />
      </g>
    );
  }

  return (
    <>
      {/* Tower legs */}
      <line x1="150" y1="20" x2="140" y2="70" stroke="black" strokeWidth="3" />
      <line x1="150" y1="20" x2="160" y2="70" stroke="black" strokeWidth="3" />
      <line x1="140" y1="70" x2="110" y2="580" stroke="black" strokeWidth="4" />
      <line x1="160" y1="70" x2="190" y2="580" stroke="black" strokeWidth="4" />

      {/* Bottom */}
      <line
        x1="110"
        y1="580"
        x2="190"
        y2="580"
        stroke="black"
        strokeWidth="4"
      />

      {/* Center spine */}
      <line x1="150" y1="20" x2="150" y2="580" stroke="black" strokeWidth="3" />

      {/* Braces */}
      {braces}
    </>
  );
}
