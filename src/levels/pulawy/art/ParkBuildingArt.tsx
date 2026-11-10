import type { ParkBuildingId } from '@/content/pulawy'

const INK = '#2a1e16'
const STONE = '#efe6d2'
const SHADE = '#d4c6a8'

function columns(xs: readonly number[], top: number, bottom: number, width: number) {
  return xs.map((x) => (
    <g key={x}>
      <rect
        x={x - width / 2}
        y={top}
        width={width}
        height={bottom - top}
        fill={STONE}
        stroke={INK}
        strokeWidth={1.6}
      />
      <path
        d={`M${x - width / 2 - 2} ${top}h${width + 4}M${x - width / 2 - 2} ${bottom}h${width + 4}`}
        stroke={INK}
        strokeWidth={2.4}
      />
    </g>
  ))
}

function Sybilla() {
  return (
    <g>
      <path d="M-104 0H104V-16H-104Z" fill={SHADE} stroke={INK} strokeWidth={2} />
      <path d="M-92 -16H92V-28H-92Z" fill={STONE} stroke={INK} strokeWidth={2} />
      <rect
        x={-60}
        y={-150}
        width={120}
        height={122}
        fill="#c8b48a"
        stroke={INK}
        strokeWidth={1.6}
      />
      <path
        d="M-14 -28V-80C-14 -96 14 -96 14 -80V-28Z"
        fill="#5a4030"
        stroke={INK}
        strokeWidth={1.6}
      />
      {columns([-84, -60, -36, 36, 60, 84], -150, -28, 12)}
      <path d="M-96 -150H96V-170H-96Z" fill={STONE} stroke={INK} strokeWidth={2} />
      <path d="M-90 -170C-90 -232 90 -232 90 -170Z" fill="#8a9a8a" stroke={INK} strokeWidth={2} />
      <path d="M-60 -190C-30 -210 30 -210 60 -190" stroke="#b8c8b8" strokeWidth={3} fill="none" />
      <text
        y={-157}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill="#6a5a40"
        letterSpacing={1}
      >
        PRZESZŁOŚĆ PRZYSZŁOŚCI
      </text>
    </g>
  )
}

function Gothic() {
  const wall = '#c8a888'
  return (
    <g>
      <rect x={-80} y={-130} width={110} height={130} fill={wall} stroke={INK} strokeWidth={2} />
      <path d="M-86 -130L-25 -176L36 -130Z" fill="#6a4a3a" stroke={INK} strokeWidth={2} />
      <rect x={30} y={-200} width={54} height={200} fill="#b89878" stroke={INK} strokeWidth={2} />
      {[36, 46, 56, 66, 76].map((x) => (
        <path key={x} d={`M${x} -200v-12h8v12`} fill="#b89878" stroke={INK} strokeWidth={1.4} />
      ))}
      {[
        [-56, -60],
        [-8, -60],
        [57, -110],
        [57, -160],
      ].map(([x, y]) => (
        <path
          key={`${x}-${y}`}
          d={`M${x - 10} ${y + 30}V${y}L${x} ${y - 18}L${x + 10} ${y}V${y + 30}Z`}
          fill="#4a5a7a"
          stroke={INK}
          strokeWidth={1.4}
        />
      ))}
      <path d="M44 0V-36L57 -56L70 -36V0Z" fill="#5a3a24" stroke={INK} strokeWidth={1.6} />
      <circle cx={-32} cy={-108} r={12} fill="#8a6a8a" stroke={INK} strokeWidth={1.4} />
      <path d="M-32 -120V-96M-44 -108H-20" stroke={INK} strokeWidth={1.2} />
    </g>
  )
}

function Greek() {
  return (
    <g>
      <rect x={-110} y={-96} width={220} height={96} fill="#f2e8d2" stroke={INK} strokeWidth={2} />
      {[-86, -60, 60, 86].map((x) => (
        <path
          key={x}
          d={`M${x - 10} -20V-66H${x + 10}V-20Z`}
          fill="#7a9aaa"
          stroke={INK}
          strokeWidth={1.4}
        />
      ))}
      {columns([-36, -12, 12, 36], -112, 0, 10)}
      <path d="M-50 -112H50L0 -146Z" fill={STONE} stroke={INK} strokeWidth={2} />
      <path d="M-116 -96H116V-104H-116Z" fill={SHADE} stroke={INK} strokeWidth={1.6} />
      <circle cx={0} cy={-124} r={6} fill={SHADE} stroke={INK} />
    </g>
  )
}

function RomanGate() {
  const stone = '#d8c8a4'
  return (
    <g>
      <path
        d="M-90 0V-150H-70L-62 -164L-48 -150H40L56 -170L64 -150H90V0H40V-80C40 -118 -40 -118 -40 -80V0Z"
        fill={stone}
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path d="M-90 -126H90M-90 -110H90" stroke={INK} strokeWidth={1.6} />
      {[-66, 66].map((x) => (
        <path key={x} d={`M${x} -110V0`} stroke="#b8a884" strokeWidth={8} />
      ))}
      <path d="M-30 -136h60" stroke="#8a7a5a" strokeWidth={3} />
      <path
        d="M-90 -40l14 -6l10 10M70 -150l8 18l-6 14"
        stroke="#6a8a4a"
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
      <path d="M-70 -150C-60 -140 -52 -150 -48 -150" stroke="#5a7a3a" strokeWidth={5} fill="none" />
      <path d="M-14 6L-24 -4H24L14 6Z" fill="#a8987a" />
    </g>
  )
}

function Chinese() {
  return (
    <g>
      <path d="M-70 0H70V-10H-70Z" fill={SHADE} stroke={INK} strokeWidth={1.6} />
      {[-54, -18, 18, 54].map((x) => (
        <path key={x} d={`M${x} -10V-96`} stroke="#a83a2a" strokeWidth={6} />
      ))}
      <path d="M-54 -40H54" stroke="#a83a2a" strokeWidth={3} strokeDasharray="6 4" />
      <path
        d="M-96 -96C-80 -100 -66 -110 -56 -128H56C66 -110 80 -100 96 -96L100 -104C84 -108 72 -118 64 -132H-64C-72 -118 -84 -108 -100 -104Z"
        fill="#3a6a5a"
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path d="M-56 -128C-40 -150 40 -150 56 -128Z" fill="#4a7a6a" stroke={INK} strokeWidth={2} />
      <path d="M0 -146V-170" stroke="#d8a83a" strokeWidth={4} strokeLinecap="round" />
      <circle cx={0} cy={-172} r={5} fill="#d8a83a" stroke={INK} />
      {[-96, 96].map((x) => (
        <path key={x} d={`M${x} -96v10`} stroke="#d8a83a" strokeWidth={3} />
      ))}
    </g>
  )
}

function Marynka() {
  return (
    <g>
      <rect
        x={-120}
        y={-110}
        width={240}
        height={110}
        fill="#f4ecd4"
        stroke={INK}
        strokeWidth={2}
      />
      <path d="M-126 -110H126L110 -132H-110Z" fill="#8a7a6a" stroke={INK} strokeWidth={2} />
      {[-96, -70, 70, 96].map((x) => (
        <path
          key={x}
          d={`M${x - 9} -24V-74H${x + 9}V-24Z`}
          fill="#7a9aaa"
          stroke={INK}
          strokeWidth={1.4}
        />
      ))}
      {columns([-42, -14, 14, 42], -110, 0, 12)}
      <path d="M-56 -110H56L0 -144Z" fill={STONE} stroke={INK} strokeWidth={2} />
      <path d="M-12 0V-40H12V0Z" fill="#5a4030" stroke={INK} strokeWidth={1.4} />
    </g>
  )
}

export function ParkBuildingArt({ building }: { building: ParkBuildingId }) {
  return (
    <g>
      {building === 'sybilla' && <Sybilla />}
      {building === 'gothic' && <Gothic />}
      {building === 'greek' && <Greek />}
      {building === 'roman-gate' && <RomanGate />}
      {building === 'chinese' && <Chinese />}
      {building === 'marynka' && <Marynka />}
    </g>
  )
}
