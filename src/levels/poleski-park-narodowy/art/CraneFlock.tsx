const FLOCK = [
  [0, 0],
  [-60, -30],
  [-60, 30],
  [-120, -60],
  [-120, 60],
  [-180, -90],
  [-180, 90],
] as const

function FlyingCrane() {
  return (
    <g>
      <path d="M-40 0H34" stroke="#2a2a30" strokeWidth={5} strokeLinecap="round" />
      <path d="M34 0L46 -2" stroke="#2a2a30" strokeWidth={3} />
      <path d="M-40 0L-62 4" stroke="#2a2a30" strokeWidth={2} />
      <path
        d="M-10 0C-20 -20 -30 -30 -46 -34C-30 -22 -20 -10 -14 0Z"
        fill="#3a3a44"
        className="pl-wing"
      />
      <path
        d="M-10 0C-20 20 -30 30 -46 34C-30 22 -20 10 -14 0Z"
        fill="#3a3a44"
        className="pl-wing"
      />
    </g>
  )
}

export function CraneFlock({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className="pl-flock">
        {FLOCK.map(([dx, dy]) => (
          <g key={`${dx}-${dy}`} transform={`translate(${dx} ${dy * 0.6})`}>
            <FlyingCrane />
          </g>
        ))}
      </g>
    </g>
  )
}
