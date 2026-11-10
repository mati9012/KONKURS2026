import type { StationId } from '@/content/pulawy'

const INK = '#2a1e16'
const WOOD = '#8a5a34'

function Easel() {
  return (
    <g>
      <path
        d="M-40 0L-10 -170M40 0L10 -170M0 -170V0"
        stroke={WOOD}
        strokeWidth={8}
        strokeLinecap="round"
      />
      <path d="M-46 -60H46" stroke={WOOD} strokeWidth={7} />
      <rect x={-52} y={-160} width={104} height={96} fill="#f6efe0" stroke={INK} strokeWidth={2} />
      <path d="M-44 -80C-24 -110 -4 -96 10 -120C22 -138 36 -126 44 -140V-72H-44Z" fill="#8ab06a" />
      <circle cx={24} cy={-138} r={10} fill="#f4c45a" />
      <ellipse cx={70} cy={-40} rx={28} ry={18} fill="#d8b47a" stroke={INK} strokeWidth={1.6} />
      {[
        [58, -44, '#c8402f'],
        [70, -48, '#3a6aaa'],
        [82, -42, '#f4c45a'],
        [68, -34, '#3a8a4a'],
      ].map(([x, y, fill]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={4} fill={fill as string} />
      ))}
    </g>
  )
}

function Desk() {
  return (
    <g>
      <path d="M-70 -70H70V-58H-70Z" fill={WOOD} stroke={INK} strokeWidth={2} />
      <path d="M-62 -58V0M62 -58V0" stroke={WOOD} strokeWidth={8} />
      <path d="M-44 -70L-38 -86H20L14 -70Z" fill="#f6efe0" stroke={INK} strokeWidth={1.4} />
      <path d="M-34 -80H8M-36 -76H6" stroke="#8a7a5a" strokeWidth={1} />
      <rect x={30} y={-90} width={16} height={20} rx={3} fill="#2a2a3a" stroke={INK} />
      <path
        d="M38 -90C44 -120 64 -140 70 -150C60 -130 46 -110 40 -90Z"
        fill="#f4ecd8"
        stroke={INK}
        strokeWidth={1.2}
      />
      {[-60, -48, -36].map((x, index) => (
        <rect
          key={x}
          x={x}
          y={-104 + index * 2}
          width={10}
          height={34 - index * 2}
          fill={['#7a3a3a', '#3a5a7a', '#5a6a3a'][index]}
          stroke={INK}
        />
      ))}
    </g>
  )
}

function PlanTable() {
  return (
    <g>
      <path d="M-80 -64H80V-54H-80Z" fill={WOOD} stroke={INK} strokeWidth={2} />
      <path d="M-70 -54L-60 0M70 -54L60 0" stroke={WOOD} strokeWidth={8} />
      <path d="M-66 -64L-50 -84H60L70 -64Z" fill="#dce8f0" stroke={INK} strokeWidth={1.4} />
      <path
        d="M-40 -70L-30 -80H20L26 -70ZM-8 -80V-70"
        stroke="#2a5a8a"
        strokeWidth={1.4}
        fill="none"
      />
      <path
        d="M30 -100L48 -66M30 -100L16 -66"
        stroke="#6a6a6a"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <circle cx={30} cy={-100} r={3} fill="#6a6a6a" />
      <path
        d="M-74 -84C-74 -96 -54 -96 -54 -84L-58 -66H-70Z"
        fill="#f4ecd8"
        stroke={INK}
        strokeWidth={1.2}
      />
      <rect x={-20} y={-120} width={40} height={30} fill="#efe4cc" stroke={INK} strokeWidth={1.2} />
      <path d="M-14 -96V-110L0 -118L14 -110V-96" stroke="#5a4a3a" strokeWidth={1.6} fill="none" />
    </g>
  )
}

function Piano() {
  return (
    <g>
      <path d="M-80 -90H70C90 -90 96 -70 84 -60H-80Z" fill="#3a2a22" stroke={INK} strokeWidth={2} />
      <rect x={-80} y={-60} width={150} height={14} fill="#f6efe0" stroke={INK} strokeWidth={1.4} />
      {Array.from({ length: 14 }, (_, index) => (
        <path key={index} d={`M${-76 + index * 10.5} -60V-46`} stroke={INK} strokeWidth={0.8} />
      ))}
      {[-70, -59, -38, -27, -16, 5, 16].map((x) => (
        <rect key={x} x={x} y={-60} width={5} height={8} fill="#1a1a1a" />
      ))}
      <path d="M-72 -46V0M62 -46V0" stroke="#3a2a22" strokeWidth={7} />
      <path d="M-30 -90L-30 -118H20L24 -90" fill="#f6efe0" stroke={INK} strokeWidth={1.4} />
      <path d="M-24 -112H16M-24 -106H16M-24 -100H16" stroke="#5a4a3a" strokeWidth={0.8} />
      <circle cx={-14} cy={-106} r={2} fill={INK} />
      <circle cx={2} cy={-100} r={2} fill={INK} />
    </g>
  )
}

export function StationArt({ station }: { station: StationId }) {
  return (
    <g>
      {station === 'painter' && <Easel />}
      {station === 'writer' && <Desk />}
      {station === 'architect' && <PlanTable />}
      {station === 'musician' && <Piano />}
    </g>
  )
}
