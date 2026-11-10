const INK = '#2a1e16'

export function BoatArt({ sacks, capacity }: { sacks: number; capacity: number }) {
  const slots = Array.from({ length: capacity }, (_, index) => index)
  const step = 150 / capacity
  return (
    <g>
      <path
        d="M-120 -20H120L96 18H-96Z"
        fill="#7a5232"
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path d="M-112 -8H112M-104 4H104" stroke="#5a3a22" strokeWidth={2} />
      <path
        d="M-120 -20L-136 -34M120 -20L136 -34"
        stroke="#5a3a22"
        strokeWidth={6}
        strokeLinecap="round"
      />
      <path d="M112 -26L152 -66" stroke="#6a4a2a" strokeWidth={5} strokeLinecap="round" />
      <rect
        x={146}
        y={-74}
        width={10}
        height={20}
        rx={3}
        fill="#8a6a44"
        stroke={INK}
        transform="rotate(45 151 -64)"
      />
      {slots.map((slot) => {
        const x = -75 + step * (slot + 0.5)
        const filled = slot < sacks
        return (
          <g key={slot} transform={`translate(${x} -20)`}>
            {filled ? (
              <g>
                <path
                  d="M-22 0C-26 -24 -20 -40 0 -44C20 -40 26 -24 22 0Z"
                  fill="#d8c08a"
                  stroke={INK}
                  strokeWidth={1.6}
                />
                <path d="M-8 -42L0 -50L8 -42" stroke={INK} strokeWidth={1.6} fill="none" />
              </g>
            ) : (
              <path
                d="M-20 0V-6H20V0"
                stroke="#e8d8b4"
                strokeWidth={2}
                strokeDasharray="4 3"
                fill="none"
              />
            )}
          </g>
        )
      })}
      <g transform="translate(-110 -20)">
        <path d="M-6 0V-34" stroke="#3a4a6a" strokeWidth={10} strokeLinecap="round" />
        <circle cx={-6} cy={-44} r={9} fill="#f0c8a0" stroke={INK} strokeWidth={1.4} />
        <path d="M-17 -48C-12 -58 2 -58 5 -48Z" fill="#6a3a2a" stroke={INK} />
        <path d="M-30 30L20 -40" stroke="#8a6a44" strokeWidth={4} strokeLinecap="round" />
      </g>
    </g>
  )
}
