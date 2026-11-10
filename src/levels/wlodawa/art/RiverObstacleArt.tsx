import type { RiverObstacleKind } from '@/levels/wlodawa/river-course'

const INK = '#2a1e16'

export function RiverObstacleArt({ kind }: { kind: RiverObstacleKind }) {
  if (kind === 'log') {
    return (
      <g>
        <path d="M-70 -14H66C74 -14 74 14 66 14H-70Z" fill="#7a5232" stroke={INK} strokeWidth={2} />
        <ellipse cx={-70} cy={0} rx={9} ry={14} fill="#c8a070" stroke={INK} strokeWidth={1.6} />
        <ellipse cx={-70} cy={0} rx={4} ry={7} fill="none" stroke="#8a6a44" strokeWidth={1.2} />
        <path d="M-50 -6H-10M0 4H40M-30 8H-4" stroke="#5a3a22" strokeWidth={2} />
        <path
          d="M20 -14l12 -16M-20 14l-8 14"
          stroke="#5a3a22"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <path
          d="M-84 -18C-90 -6 -90 6 -84 18M80 -20C86 -8 86 8 80 20"
          stroke="#e8f4f8"
          strokeWidth={3}
          fill="none"
          opacity={0.8}
        />
      </g>
    )
  }
  if (kind === 'shoal') {
    return (
      <g>
        <path
          d="M-62 6C-66 -18 -30 -32 4 -28C40 -26 70 -12 62 10C54 30 -10 32 -40 26C-54 22 -60 16 -62 6Z"
          fill="#e4cc94"
          stroke="#a8884a"
          strokeWidth={2}
        />
        <path d="M-36 -4C-16 -14 16 -14 36 -2" stroke="#f4e4b8" strokeWidth={4} fill="none" />
        {[
          [-30, 10],
          [8, 12],
          [30, -10],
        ].map(([x, y]) => (
          <ellipse
            key={x}
            cx={x}
            cy={y}
            rx={6}
            ry={4}
            fill="#a8a090"
            stroke={INK}
            strokeWidth={1}
          />
        ))}
        <path
          d="M-72 10C-70 30 -40 40 0 38"
          stroke="#e8f4f8"
          strokeWidth={3}
          fill="none"
          opacity={0.7}
        />
      </g>
    )
  }
  return (
    <g>
      <path
        d="M-56 20C-30 6 -10 -4 10 -24M-20 4C-30 -10 -34 -22 -30 -34M6 -10C22 -10 36 -4 46 6M10 -24C16 -34 26 -40 36 -40"
        stroke="#4a3220"
        strokeWidth={8}
        strokeLinecap="round"
        fill="none"
      />
      {[
        [-30, -34],
        [46, 6],
        [36, -40],
        [-56, 20],
      ].map(([x, y]) => (
        <ellipse key={x} cx={x} cy={y} rx={12} ry={7} fill="#5a7a3a" opacity={0.85} />
      ))}
      <circle cx={-6} cy={0} r={34} fill="none" stroke="#e8f4f8" strokeWidth={2.4} opacity={0.6} />
    </g>
  )
}
