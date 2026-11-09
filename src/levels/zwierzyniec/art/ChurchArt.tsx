const INK = '#3a2a1e'
const WALL = '#f4ece0'
const WALL_SHADE = '#ddd0bf'
const ROOF = '#6e5546'
const ROOF_DARK = '#58423a'
const WOOD = '#6b4a30'
const WOOD_DARK = '#4e3522'

function ArchedWindow({
  x,
  y,
  width,
  height,
  lit,
}: {
  x: number
  y: number
  width: number
  height: number
  lit: boolean
}) {
  const radius = width / 2
  return (
    <path
      d={`M${x - radius} ${y}V${y - height + radius}A${radius} ${radius} 0 0 1 ${x + radius} ${y - height + radius}V${y}Z`}
      fill={lit ? '#ffd36e' : '#5d6b78'}
      stroke={INK}
      strokeWidth={1.6}
    />
  )
}

function Belfry() {
  return (
    <g transform="translate(-118 0)">
      <path d="M-22 0V-78H22V0Z" fill={WOOD} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      {[-14, -6, 2, 10].map((x) => (
        <path key={x} d={`M${x} -4V-74`} stroke={WOOD_DARK} strokeWidth={1.2} />
      ))}
      <path
        d="M-26 -78H26L22 -84H-22Z"
        fill={WOOD_DARK}
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path d="M-20 -84V-108H20V-84Z" fill={WOOD} stroke={INK} strokeWidth={2} />
      <path d="M-12 -88V-104H12V-88Z" fill="#2c1f16" />
      <path d="M-6 -90C-6 -97 6 -97 6 -90V-88H-6Z" fill="#c99a3e" stroke={INK} strokeWidth={1} />
      <path
        d="M-28 -106L0 -150L28 -106Z"
        fill={ROOF_DARK}
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path d="M0 -150V-162M-4 -158H4" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
    </g>
  )
}

export function ChurchArt({ lit }: { lit: boolean }) {
  return (
    <g>
      <Belfry />
      <path
        d="M-70 -78L-48 -128H48L70 -78Z"
        fill={ROOF}
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path d="M-40 -118H40M-54 -100H54M-62 -88H62" stroke={ROOF_DARK} strokeWidth={1.4} />
      <g transform="translate(26 -128)">
        <path d="M-9 0V-22H9V0Z" fill={WALL} stroke={INK} strokeWidth={1.6} />
        <path d="M-5 -6V-16H5V-6Z" fill={lit ? '#ffd36e' : '#5d6b78'} />
        <path d="M-12 -22C-12 -36 12 -36 12 -22Z" fill={ROOF_DARK} stroke={INK} strokeWidth={1.6} />
        <path d="M-4 -33C-4 -41 4 -41 4 -33Z" fill={ROOF_DARK} stroke={INK} strokeWidth={1.4} />
        <path d="M0 -40V-54M-5 -49H5" stroke="#c99a3e" strokeWidth={2} strokeLinecap="round" />
      </g>
      <path
        d="M-64 0V-80H64V0Z"
        fill={WALL}
        stroke={INK}
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
      <path d="M40 0V-80H64V0Z" fill={WALL_SHADE} />
      <path d="M-64 -80H64" stroke={INK} strokeWidth={2.4} />
      <path d="M-58 -80V0M58 -80V0M-30 -80V0M30 -80V0" stroke={WALL_SHADE} strokeWidth={4} />
      <path
        d="M-46 -80C-46 -92-36 -96-30 -98L0 -128L30 -98C36 -96 46 -92 46 -80Z"
        fill={WALL}
        stroke={INK}
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
      <path d="M-24 -96L0 -118L24 -96Z" fill="none" stroke={WALL_SHADE} strokeWidth={2.4} />
      <circle
        cx={0}
        cy={-104}
        r={5}
        fill={lit ? '#ffd36e' : '#7d8895'}
        stroke={INK}
        strokeWidth={1.4}
      />
      <path d="M0 -128V-142M-5 -137H5" stroke={INK} strokeWidth={2} strokeLinecap="round" />
      <path
        d="M-26 -72H-12V-58C-12 -52-19 -50-19 -50C-19 -50-26 -52-26 -58Z"
        fill="#c8402f"
        stroke={INK}
        strokeWidth={1.4}
      />
      <path d="M-22 -66H-16M-19 -69V-56" stroke="#f4ece0" strokeWidth={1.4} />
      <path
        d="M12 -72H26V-58C26 -52 19 -50 19 -50C19 -50 12 -52 12 -58Z"
        fill="#c8402f"
        stroke={INK}
        strokeWidth={1.4}
      />
      <path d="M15 -64L23 -60M15 -60L23 -64" stroke="#f4ece0" strokeWidth={1.2} />
      <ArchedWindow x={-44} y={-24} width={14} height={34} lit={lit} />
      <ArchedWindow x={44} y={-24} width={14} height={34} lit={lit} />
      <path d="M-14 0V-30A14 14 0 0 1 14 -30V0Z" fill="#5a3b26" stroke={INK} strokeWidth={2} />
      <path d="M0 -42V0" stroke="#3e2818" strokeWidth={1.4} />
      <path
        d="M-20 0H20L24 6H-24Z"
        fill="#cbbca8"
        stroke={INK}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </g>
  )
}
