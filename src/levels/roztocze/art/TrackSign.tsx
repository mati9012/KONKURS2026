import type { AnimalId } from '@/content/roztocze'

export type SignKind = AnimalId | 'devil'

const INK = '#2a1e16'
const MUD = '#4a3826'

function Paw({ x, y, angle }: { x: number; y: number; angle: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`} fill={MUD}>
      <ellipse cx={0} cy={4} rx={7} ry={6} />
      <ellipse cx={-6} cy={-5} rx={2.6} ry={3.4} />
      <ellipse cx={-2} cy={-9} rx={2.6} ry={3.4} />
      <ellipse cx={3} cy={-9} rx={2.6} ry={3.4} />
      <ellipse cx={7} cy={-5} rx={2.6} ry={3.4} />
    </g>
  )
}

function Hoof({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-7 6C-9 -2 -6 -9 -2 -9L-1 6Z" fill="#3a1414" />
      <path d="M7 6C9 -2 6 -9 2 -9L1 6Z" fill="#3a1414" />
      <path d="M-5 2L-2 -4M5 2L2 -4" stroke="#ff5a3a" strokeWidth={1.4} className="zw-pulse" />
    </g>
  )
}

function WolfLine() {
  return (
    <g>
      {[0, 1, 2, 3, 4].map((step) => (
        <Paw key={step} x={-60 + step * 30} y={10 - step * 6} angle={70} />
      ))}
    </g>
  )
}

function RubbedTree() {
  return (
    <g>
      <path d="M-16 6L-12 -170L12 -170L16 6Z" fill="#4b3a2c" stroke={INK} strokeWidth={2} />
      <path d="M-11 -110C-6 -118 6 -116 10 -108L11 -60C4 -54 -6 -56 -11 -62Z" fill="#d8c09a" />
      <path
        d="M-8 -100L-3 -70M0 -104L3 -66M6 -100L7 -70"
        stroke="#9c7a52"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <path d="M12 -64L22 -50M-12 -66L-20 -54" stroke="#d8c09a" strokeWidth={2} />
    </g>
  )
}

function DugSoil() {
  return (
    <g>
      <path
        d="M-60 6C-58 -14 -30 -20 -6 -16C20 -24 52 -14 58 4C40 14 -40 16 -60 6Z"
        fill="#3c2a1a"
        stroke={INK}
        strokeWidth={2}
      />
      {[
        [-40, -6],
        [-14, -14],
        [10, -8],
        [34, -12],
        [-24, 4],
        [22, 4],
      ].map(([x, y]) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx={9} ry={5} fill="#5c4228" />
      ))}
      <path d="M-50 -4L-46 -12M44 -6L48 -14" stroke="#6b8a4a" strokeWidth={2} />
    </g>
  )
}

function BeaverStump() {
  return (
    <g>
      <path
        d="M-14 6L-14 -26L-4 -36L-8 -22L4 -38L2 -24L14 -32L14 6Z"
        fill="#c9a06a"
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path d="M-14 -10L14 -10" stroke="#9c7442" strokeWidth={1.6} />
      {[
        [-30, 4],
        [24, 2],
        [32, 8],
        [-22, 10],
      ].map(([x, y]) => (
        <path
          key={`${x}-${y}`}
          d={`M${x - 5} ${y}L${x + 5} ${y - 3}L${x + 4} ${y + 2}Z`}
          fill="#e3c08a"
        />
      ))}
      <g transform="translate(70 18)">
        <path d="M-40 8C-36 -24 36 -24 40 8Z" fill="#5a4432" stroke={INK} strokeWidth={2} />
        <path
          d="M-30 0L28 -14M-24 -10L30 2M-14 -18L20 -4M-34 6L36 -2"
          stroke="#8a6a48"
          strokeWidth={3}
          strokeLinecap="round"
        />
      </g>
    </g>
  )
}

function OwlPellet() {
  return (
    <g>
      <path d="M-70 6L-64 -190L-40 -190L-36 6Z" fill="#3e3226" stroke={INK} strokeWidth={2} />
      <ellipse cx={-52} cy={-150} rx={8} ry={12} fill="#120c08" />
      <ellipse cx={0} cy={0} rx={18} ry={9} fill="#9a9184" stroke={INK} strokeWidth={1.6} />
      <path
        d="M-10 -2L-2 2M4 -4L10 0M-4 4L6 4"
        stroke="#f1ecdf"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M24 2C30 -8 38 -8 40 -2C36 2 30 4 24 2Z"
        fill="#c9a77a"
        stroke={INK}
        strokeWidth={1}
      />
      <text x={-30} y={-200} fontSize={18} fontStyle="italic" fill="#f4efd6" opacity={0.8}>
        hu hu…
      </text>
    </g>
  )
}

function DevilHooves() {
  return (
    <g>
      <Hoof x={-40} y={6} />
      <Hoof x={-14} y={-6} />
      <Hoof x={14} y={4} />
      <Hoof x={40} y={-8} />
    </g>
  )
}

export function TrackSign({ kind }: { kind: SignKind }) {
  if (kind === 'wolf') return <WolfLine />
  if (kind === 'deer') return <RubbedTree />
  if (kind === 'boar') return <DugSoil />
  if (kind === 'beaver') return <BeaverStump />
  if (kind === 'owl') return <OwlPellet />
  return <DevilHooves />
}
