const INK = '#3a2a1c'
const COAT = '#9b9182'
const COAT_SHADE = '#7f7567'
const BELLY = '#c4b9a5'
const LEG_DARK = '#3d342c'
const MANE = '#2a221c'
const HIP_Y = -44

type LegProps = { x: number; phase: number; far?: boolean }

function Leg({ x, phase, far }: LegProps) {
  return (
    <g data-leg={phase} data-hip={x}>
      <path
        d={`M${x - 7} ${HIP_Y - 6}L${x + 7} ${HIP_Y - 6}L${x + 4.5} -12L${x + 5} -3L${x - 4.5} -3L${x - 4} -12Z`}
        fill={far ? COAT_SHADE : COAT}
        stroke={INK}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <path d={`M${x - 4.6} -20L${x + 4.6} -20L${x + 5} -3L${x - 4.6} -3Z`} fill={LEG_DARK} />
      <rect x={x - 5.5} y={-5} width={11} height={5} rx={1.5} fill="#1f1812" />
    </g>
  )
}

export function KonikSprite() {
  return (
    <g>
      <ellipse cx={0} cy={0} rx={52} ry={9} fill="#2c3a1c" opacity={0.22} />
      <Leg x={-30} phase={Math.PI} far />
      <Leg x={24} phase={0} far />
      <path
        d="M-50 -60C-62 -56-70 -38-66 -16C-64 -10-58 -12-58 -18C-58 -30-56 -44-48 -52Z"
        fill={MANE}
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path
        d="M-52 -62C-52 -77-22 -76 0 -73C20 -72 34 -77 43 -70C51 -63 49 -45 40 -39C20 -31-20 -31-40 -37C-55 -42-57 -54-52 -62Z"
        fill={COAT}
        stroke={INK}
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
      <path d="M-34 -40C-14 -35 14 -35 32 -40C18 -36-14 -34-34 -40Z" fill={BELLY} opacity={0.9} />
      <ellipse cx={-6} cy={-42} rx={30} ry={6} fill={BELLY} opacity={0.55} />
      <path
        d="M-44 -69C-20 -73 8 -72 32 -73"
        fill="none"
        stroke={MANE}
        strokeWidth={3.2}
        strokeLinecap="round"
      />
      <path
        d="M28 -70C37 -87 49 -101 60 -105L73 -96C66 -84 57 -71 47 -55Z"
        fill={COAT}
        stroke={INK}
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
      <path
        d="M57 -107C66 -111 75 -104 81 -92C87 -82 89 -76 85 -71C80 -67 72 -69 68 -75C63 -82 57 -90 55 -99Z"
        fill={COAT}
        stroke={INK}
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
      <path d="M77 -86C85 -82 88 -75 85 -72C81 -68 74 -70 72 -76Z" fill="#4a4037" />
      <path
        d="M59 -103L58 -117L66 -107Z"
        fill={COAT_SHADE}
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path
        d="M26 -71C34 -90 47 -105 60 -110L59 -101C49 -95 40 -83 35 -66Z"
        fill={MANE}
        stroke={INK}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <path d="M60 -108C63 -103 66 -100 70 -100" fill="none" stroke={MANE} strokeWidth={3} />
      <circle cx={70} cy={-93} r={2.4} fill="#1a120c" />
      <circle cx={70.8} cy={-93.8} r={0.8} fill="#fff8e6" />
      <path
        d="M-40 -64C-30 -66-22 -66-14 -64"
        fill="none"
        stroke="#fff7e8"
        strokeWidth={2}
        opacity={0.35}
        strokeLinecap="round"
      />
      <Leg x={-38} phase={0} />
      <Leg x={32} phase={Math.PI} />
    </g>
  )
}
