import type { BuildingId } from '@/content/zamosc'

const INK = '#3a2614'
const LINE = { stroke: INK, strokeWidth: 1.6, strokeLinejoin: 'round' as const }

function Glyph({ id }: { id: BuildingId }) {
  switch (id) {
    case 'palace':
      return (
        <>
          <path d="M5 22L11 14H37L43 22Z" fill="#b4553c" {...LINE} />
          <rect x={5} y={22} width={38} height={18} fill="#f0e2c4" {...LINE} />
          <path d="M21 40V33A3 3 0 0 1 27 33V40Z" fill="#5a3a22" />
          {[9, 14, 31, 36].map((x) => (
            <rect key={x} x={x} y={26} width={3} height={4} fill={INK} opacity={0.6} />
          ))}
        </>
      )
    case 'grodzka':
      return (
        <>
          <path d="M20 8H28L42 42H6Z" fill="#d9c398" {...LINE} />
          {[
            [22, 14],
            [26, 18],
            [21, 23],
            [27, 28],
            [18, 33],
            [30, 36],
            [23, 38],
          ].map(([x, y]) => (
            <ellipse key={`${x}-${y}`} cx={x} cy={y} rx={2.2} ry={1.2} fill={INK} opacity={0.3} />
          ))}
          <path d="M24 10V40" stroke="#fff6dc" strokeWidth={1.2} strokeDasharray="3 3" />
        </>
      )
    case 'market':
      return (
        <>
          <path d="M4 34L12 14H36L44 34Z" fill="#e6d2a2" {...LINE} />
          <path
            d="M10 19H38M8 24H40M6 29H42M18 14L16 34M24 14V34M30 14L32 34"
            stroke="#fff6dc"
            strokeWidth={1.1}
          />
          <ellipse cx={24} cy={27} rx={4} ry={2.4} fill="#a99f8e" stroke={INK} strokeWidth={1.2} />
          <ellipse cx={24} cy={26.6} rx={2.2} ry={1.2} fill="#4d6a78" />
        </>
      )
    case 'townhall':
      return (
        <>
          <rect x={20} y={10} width={8} height={18} fill="#f2cdb3" {...LINE} />
          <path d="M19 10H29L27 6H21Z" fill="#5f6f6a" {...LINE} />
          <path d="M24 6V1" stroke={INK} strokeWidth={1.4} />
          <circle cx={24} cy={15} r={2.4} fill="#fff4d8" stroke={INK} strokeWidth={1} />
          <path d="M6 30L10 25H38L42 30Z" fill="#6d7d78" {...LINE} />
          <rect x={6} y={30} width={36} height={11} fill="#efc2a6" {...LINE} />
          <path d="M18 41L20 37H28L30 41Z" fill="#dcc6a2" stroke={INK} strokeWidth={1} />
        </>
      )
    case 'houses':
      return (
        <>
          {[
            { x: 4, color: '#d8714f' },
            { x: 17, color: '#e8b84a' },
            { x: 30, color: '#6fa3a0' },
          ].map(({ x, color }) => (
            <g key={x}>
              <path
                d={`M${x} 18Q${x + 3.5} 12 ${x + 7} 18Q${x + 10.5} 12 ${x + 14} 18V42H${x}Z`}
                fill={color}
                {...LINE}
              />
              <path
                d={`M${x + 2} 42V37A2.5 2.5 0 0 1 ${x + 7} 37V42M${x + 8} 42V37A2.5 2.5 0 0 1 ${x + 13} 37V42`}
                fill={INK}
                opacity={0.55}
              />
              <rect x={x + 3} y={23} width={3} height={4} fill={INK} opacity={0.55} />
              <rect x={x + 8.5} y={23} width={3} height={4} fill={INK} opacity={0.55} />
            </g>
          ))}
        </>
      )
    case 'collegiate':
      return (
        <>
          <rect x={18} y={20} width={24} height={20} fill="#f4e8d0" {...LINE} />
          <path d="M16 20L22 13H40L44 20Z" fill="#8d5a3e" {...LINE} />
          <rect x={6} y={14} width={11} height={26} fill="#f6ecd8" {...LINE} />
          <path d="M5 14Q11.5 3 18 14Z" fill="#5f7a6a" {...LINE} />
          <path d="M11.5 6V1M9 3H14" stroke={INK} strokeWidth={1.4} />
          <path d="M9 40V33A2.5 2.5 0 0 1 14 33V40Z" fill="#5a3a22" />
          {[22, 29, 36].map((x) => (
            <path
              key={x}
              d={`M${x} 32V26A1.6 1.6 0 0 1 ${x + 3.2} 26V32Z`}
              fill={INK}
              opacity={0.55}
            />
          ))}
        </>
      )
    case 'academy':
      return (
        <>
          <rect x={4} y={16} width={40} height={16} fill="#ead7b6" {...LINE} />
          <path d="M4 16L8 10H40L44 16Z" fill="#a8543c" {...LINE} />
          {[8, 14, 20, 26, 32, 38].map((x) => (
            <rect key={x} x={x} y={20} width={3} height={4} fill={INK} opacity={0.55} />
          ))}
          <path
            d="M10 44Q17 38 24 42Q31 38 38 44V36Q31 31 24 35Q17 31 10 36Z"
            fill="#fff4d8"
            {...LINE}
          />
          <path d="M24 35V42" stroke={INK} strokeWidth={1.2} />
        </>
      )
    case 'fortress':
      return (
        <>
          <path
            d="M24 3L30 11L41 9L39 20L46 28L36 32L33 43L24 37L15 43L12 32L2 28L9 20L7 9L18 11Z"
            fill="#9fb06f"
            {...LINE}
          />
          <path
            d="M24 11L33 15L37 25L31 34H17L11 25L15 15Z"
            fill="#cdd29a"
            stroke="#b8674b"
            strokeWidth={2.6}
          />
        </>
      )
  }
}

export function BuildingIcon({ id, className }: { id: BuildingId; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <Glyph id={id} />
    </svg>
  )
}
