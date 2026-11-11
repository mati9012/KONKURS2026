const INK = '#2a2216'

export function CrownArt() {
  return (
    <g strokeLinejoin="round">
      <path
        d="M-90 0L-100 -60L-60 -30L-30 -72L0 -36L30 -72L60 -30L100 -60L90 0Z"
        fill="#e8c04a"
        stroke={INK}
        strokeWidth={3}
      />
      <rect
        x={-92}
        y={-6}
        width={184}
        height={18}
        rx={4}
        fill="#d4a634"
        stroke={INK}
        strokeWidth={3}
      />
      {[-50, 0, 50].map((x) => (
        <circle key={x} cx={x} cy={3} r={5} fill="#b8322a" stroke={INK} strokeWidth={1.5} />
      ))}
      <path d="M-6 -40V-92M-18 -78H6" stroke={INK} strokeWidth={10} strokeLinecap="round" />
      <path d="M-6 -40V-92M-18 -78H6" stroke="#e8c04a" strokeWidth={5} strokeLinecap="round" />
    </g>
  )
}
