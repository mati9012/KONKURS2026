const IMPS = [
  { dx: -34, delay: 0 },
  { dx: 0, delay: 0.25 },
  { dx: 34, delay: 0.5 },
] as const

type CzartyDanceProps = {
  x: number
  y: number
  scale: number
  opacity?: number
}

export function CzartyDance({ x, y, scale, opacity = 1 }: CzartyDanceProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <ellipse cx={0} cy={-6} rx={70} ry={26} fill="#ffb35a" opacity={0.3} />
      <ellipse cx={0} cy={2} rx={40} ry={6} fill="#ffcf6a" opacity={0.45} />
      <path d="M-6 0Q0 -22 6 0Z" fill="#ffcf6a" className="rz-flicker" />
      <path d="M-3 0Q0 -12 3 0Z" fill="#fff1b8" className="rz-flicker" />
      {IMPS.map((imp) => (
        <g key={imp.dx} transform={`translate(${imp.dx} 0)`}>
          <g className="rz-hop" style={{ animationDelay: `${imp.delay}s` }}>
            <path
              d="M-5 0L-3 -8C-6 -10 -6 -15 -3 -17L-5 -21L-1 -18L1 -18L5 -21L3 -17C6 -15 6 -10 3 -8L5 0L1 -5L-1 -5Z"
              fill="#2a1a24"
            />
            <path
              d="M3 -8C9 -8 9 -14 12 -14"
              fill="none"
              stroke="#2a1a24"
              strokeWidth={1.2}
              strokeLinecap="round"
            />
          </g>
        </g>
      ))}
    </g>
  )
}
