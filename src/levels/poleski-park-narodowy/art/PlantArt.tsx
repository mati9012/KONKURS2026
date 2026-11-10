import type { PlantId } from '@/content/poleski-park-narodowy'

export type PlantKind = PlantId | 'sedge'

const INK = '#2a2418'

function Sundew({ caught }: { caught: boolean }) {
  return (
    <g>
      {[-60, -25, 15, 55, 95, 140].map((angle, index) => {
        const rad = (angle * Math.PI) / 180
        const x = Math.cos(rad) * 28
        const y = -Math.abs(Math.sin(rad)) * 16 - 6
        return (
          <g key={angle}>
            <path d={`M0 0L${x * 0.7} ${y * 0.7}`} stroke="#9a4a3a" strokeWidth={2} />
            <circle cx={x} cy={y} r={9} fill="#c8504a" stroke={INK} strokeWidth={1.2} />
            {Array.from({ length: 7 }, (_, dot) => {
              const around = (dot / 7) * Math.PI * 2 + index
              return (
                <circle
                  key={dot}
                  cx={x + Math.cos(around) * 11}
                  cy={y + Math.sin(around) * 11}
                  r={2}
                  fill="#f4f0c8"
                  stroke="#c8504a"
                  strokeWidth={0.8}
                />
              )
            })}
          </g>
        )
      })}
      <path d="M2 -4C4 -30 0 -52 6 -70" stroke="#8a3a2a" strokeWidth={2} fill="none" />
      <circle cx={6} cy={-72} r={3.5} fill="#fbfbf4" stroke={INK} strokeWidth={0.8} />
      <circle cx={10} cy={-64} r={3} fill="#fbfbf4" stroke={INK} strokeWidth={0.8} />
      {caught && (
        <g transform="translate(-24 -18)">
          <ellipse cx={0} cy={0} rx={5} ry={3} fill="#2a2a2a" />
          <ellipse cx={-3} cy={-4} rx={4} ry={2.4} fill="#cfe0ec" opacity={0.8} />
          <ellipse cx={3} cy={-4} rx={4} ry={2.4} fill="#cfe0ec" opacity={0.8} />
        </g>
      )}
    </g>
  )
}

function Cranberry() {
  return (
    <g>
      <path
        d="M-60 0C-40 -8 -20 4 0 -4C20 -12 40 2 62 -6"
        stroke="#6a3a2a"
        strokeWidth={2}
        fill="none"
      />
      {[-50, -30, -8, 14, 36, 54].map((x, index) => (
        <ellipse
          key={x}
          cx={x}
          cy={-6 - (index % 2) * 4}
          rx={5}
          ry={2.6}
          fill="#3a6a3a"
          transform={`rotate(${index % 2 ? 24 : -24} ${x} ${-6})`}
        />
      ))}
      {[-38, -16, 8, 30, 46].map((x, index) => (
        <g key={x}>
          <path
            d={`M${x} ${-4}C${x} ${-14} ${x + 4} ${-18} ${x + 6} ${-22}`}
            stroke="#6a3a2a"
            strokeWidth={1.2}
            fill="none"
          />
          <circle
            cx={x + 6}
            cy={-20 + (index % 2) * 6}
            r={7}
            fill="#c8202a"
            stroke={INK}
            strokeWidth={1.2}
          />
          <circle cx={x + 4} cy={-23 + (index % 2) * 6} r={2} fill="#f4a0a0" />
        </g>
      ))}
    </g>
  )
}

function Sphagnum({ drip }: { drip: boolean }) {
  return (
    <g>
      <path d="M-56 4C-56 -30 56 -30 56 4Z" fill="#a8b84a" stroke={INK} strokeWidth={1.4} />
      {Array.from({ length: 13 }, (_, index) => {
        const x = -48 + index * 8
        const y = -14 - Math.sin((index / 12) * Math.PI) * 12
        return (
          <g key={index}>
            <path d={`M${x} 2V${y}`} stroke="#7a8a2a" strokeWidth={2} />
            <circle cx={x} cy={y} r={5} fill={index % 3 === 0 ? '#c86a5a' : '#c8d46a'} />
          </g>
        )
      })}
      {drip &&
        [-30, 0, 28].map((x) => (
          <path
            key={x}
            d={`M${x} 8C${x - 4} 14 ${x - 4} 18 ${x} 20C${x + 4} 18 ${x + 4} 14 ${x} 8Z`}
            fill="#6ab4d8"
            className="pl-drip"
          />
        ))}
    </g>
  )
}

function Birch() {
  return (
    <g>
      {[
        'M0 0C-4 -30 -20 -50 -34 -66',
        'M0 0C2 -36 6 -60 4 -88',
        'M0 0C6 -26 22 -44 38 -58',
        'M-12 -36C-24 -40 -34 -38 -44 -30',
      ].map((d) => (
        <path key={d} d={d} stroke="#5a3a2a" strokeWidth={3} fill="none" strokeLinecap="round" />
      ))}
      {[
        [-34, -66],
        [-26, -52],
        [4, -88],
        [6, -70],
        [-2, -56],
        [38, -58],
        [26, -46],
        [-44, -30],
        [14, -36],
        [-14, -78],
      ].map(([x, y], index) => (
        <circle
          key={index}
          cx={x}
          cy={y}
          r={6}
          fill={index % 2 ? '#7aa04a' : '#8ab456'}
          stroke="#3a5a2a"
          strokeWidth={1}
        />
      ))}
    </g>
  )
}

function Sedge() {
  return (
    <g>
      {[-30, -18, -6, 6, 18, 30].map((x, index) => (
        <path
          key={x}
          d={`M${x * 0.3} 0C${x * 0.6} -30 ${x} -50 ${x * 1.3} ${-70 - (index % 3) * 10}`}
          stroke={index % 2 ? '#7a8a4a' : '#8a9a5a'}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
      ))}
    </g>
  )
}

export function PlantArt({ kind, active = false }: { kind: PlantKind; active?: boolean }) {
  return (
    <g>
      <ellipse cx={0} cy={4} rx={60} ry={10} fill="#3a4a1a" opacity={0.25} />
      {kind === 'sundew' && <Sundew caught={active} />}
      {kind === 'cranberry' && <Cranberry />}
      {kind === 'sphagnum' && <Sphagnum drip={active} />}
      {kind === 'birch' && <Birch />}
      {kind === 'sedge' && <Sedge />}
    </g>
  )
}
