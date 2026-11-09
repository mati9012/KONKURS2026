const INK = '#33291f'
const COAT = '#c9c6bd'
const COAT_SHADE = '#a6a299'
const HORN = '#9a8257'
const HIP_Y = -34

function Leg({ x, phase, far }: { x: number; phase: number; far?: boolean }) {
  return (
    <g data-leg={phase} data-hip={x}>
      <path
        d={`M${x - 5} ${HIP_Y - 4}L${x + 5} ${HIP_Y - 4}L${x + 3} -3L${x - 3} -3Z`}
        fill={far ? COAT_SHADE : COAT}
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <rect x={x - 3.8} y={-5} width={7.6} height={5} rx={1.2} fill="#3b3128" />
    </g>
  )
}

export function GoatSprite() {
  return (
    <g>
      <ellipse cx={0} cy={0} rx={38} ry={7} fill="#2c3a1c" opacity={0.25} />
      <Leg x={-22} phase={Math.PI} far />
      <Leg x={18} phase={0} far />
      <path
        d="M-33 -52L-44 -66L-35 -47Z"
        fill={COAT}
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path
        d="M-36 -48C-37 -60-10 -62 10 -60C26 -60 35 -56 35 -45C35 -33 20 -29 0 -29C-20 -29-35 -34-36 -48Z"
        fill={COAT}
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path
        d="M-26 -36C-10 -32 10 -32 26 -36"
        fill="none"
        stroke={COAT_SHADE}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <path
        d="M-6 -60C2 -54 6 -42 4 -32"
        fill="none"
        stroke="#8a4b2a"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <path
        d="M-4 -40C4 -44 14 -42 16 -34C10 -30 0 -30-4 -34Z"
        fill="#a3643b"
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path
        d="M24 -55C28 -69 36 -79 47 -81C56 -82 61 -76 61 -69C61 -63 55 -60 51 -62C45 -58 37 -49 35 -43Z"
        fill={COAT}
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path
        d="M41 -79C36 -95 23 -101 15 -92C25 -93 32 -88 37 -76Z"
        fill={HORN}
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path
        d="M33 -91C30 -90 27 -88 25 -86M37 -86C34 -85 31 -83 29 -81"
        stroke="#6e5a39"
        strokeWidth={1.2}
        fill="none"
      />
      <path
        d="M39 -73L27 -70L37 -66Z"
        fill={COAT_SHADE}
        stroke={INK}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <path
        d="M52 -63C52 -56 50 -50 47 -46C52 -48 56 -55 57 -63Z"
        fill="#e9e5da"
        stroke={INK}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <ellipse cx={58} cy={-70} rx={3} ry={2.2} fill="#7a6a5c" />
      <circle cx={49} cy={-73} r={2.3} fill="#1a120c" />
      <circle cx={49.8} cy={-73.8} r={0.8} fill="#fff8e6" />
      <Leg x={-28} phase={0} />
      <Leg x={24} phase={Math.PI} />
    </g>
  )
}
