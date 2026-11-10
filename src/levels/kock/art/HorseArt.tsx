const INK = '#2a1e16'
const COAT = '#8a5a34'
const COAT_DARK = '#6a4226'
const MANE = '#2e2018'

type HorseArtProps = {
  airborne: boolean
  stumbling: boolean
}

function Leg({
  x,
  y,
  front,
  delay,
  airborne,
}: {
  x: number
  y: number
  front: boolean
  delay: number
  airborne: boolean
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g
        className={airborne ? undefined : 'kk-gallop'}
        style={{
          animationDelay: `${delay}s`,
          transformBox: 'fill-box',
          transformOrigin: '50% 0',
          transform: airborne ? `rotate(${front ? -50 : 40}deg)` : undefined,
        }}
      >
        <path
          d="M-5 0L-4 22L-6 40L2 40L4 22L5 0Z"
          fill={front ? COAT : COAT_DARK}
          stroke={INK}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
        <rect x={-6} y={38} width={9} height={6} rx={1.5} fill="#2a1e16" />
      </g>
    </g>
  )
}

export function HorseArt({ airborne, stumbling }: HorseArtProps) {
  return (
    <g transform={stumbling ? 'rotate(8)' : undefined}>
      <ellipse cx={0} cy={4} rx={60} ry={8} fill="#000" opacity={airborne ? 0.08 : 0.2} />
      <Leg x={-34} y={-42} front={false} delay={0.1} airborne={airborne} />
      <Leg x={28} y={-42} front={false} delay={0.3} airborne={airborne} />
      <path
        d="M-50 -66C-66 -64 -74 -52 -76 -36C-70 -44 -64 -50 -56 -52Z"
        fill={MANE}
        stroke={INK}
        strokeWidth={1.4}
      />
      <path
        d="M-52 -62C-50 -80 -20 -84 10 -82C30 -82 42 -78 46 -66C48 -54 42 -42 26 -40L-36 -40C-50 -42 -54 -50 -52 -62Z"
        fill={COAT}
        stroke={INK}
        strokeWidth={2}
      />
      <path
        d="M36 -76C44 -94 54 -108 64 -114L80 -104C74 -90 64 -76 52 -64Z"
        fill={COAT}
        stroke={INK}
        strokeWidth={2}
      />
      <path d="M38 -78C44 -94 54 -106 62 -112L58 -96C52 -88 46 -80 42 -72Z" fill={MANE} />
      <path
        d="M62 -116C68 -122 80 -122 86 -116L102 -100C106 -96 104 -90 98 -90L82 -94C74 -92 66 -98 62 -104Z"
        fill={COAT}
        stroke={INK}
        strokeWidth={2}
      />
      <path d="M66 -118L64 -130L72 -120Z" fill={COAT_DARK} stroke={INK} strokeWidth={1.4} />
      <circle cx={78} cy={-110} r={2.4} fill={INK} />
      <path d="M96 -98L102 -100" stroke={INK} strokeWidth={1.6} />
      <path d="M80 -96L50 -78" stroke="#4a2a14" strokeWidth={1.6} />
      <path
        d="M-14 -82C-14 -92 12 -92 14 -82L14 -76H-14Z"
        fill="#7a2a24"
        stroke={INK}
        strokeWidth={1.6}
      />
      <rect
        x={-20}
        y={-78}
        width={40}
        height={14}
        rx={3}
        fill="#c8402f"
        stroke={INK}
        strokeWidth={1.6}
      />
      <rect
        x={-10}
        y={-62}
        width={18}
        height={14}
        rx={2}
        fill="#d9b070"
        stroke={INK}
        strokeWidth={1.4}
      />
      <path d="M-10 -62L-1 -55L8 -62" fill="none" stroke={INK} strokeWidth={1.2} />
      <circle cx={-1} cy={-55} r={2} fill="#c8402f" />
      <Leg x={-40} y={-44} front delay={0} airborne={airborne} />
      <Leg x={34} y={-44} front delay={0.2} airborne={airborne} />
    </g>
  )
}
