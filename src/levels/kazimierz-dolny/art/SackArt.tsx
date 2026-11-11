const INK = '#2a1e16'

export function SackArt({ splash }: { splash: boolean }) {
  if (splash) {
    return (
      <g stroke="#e8f4f8" strokeWidth={4} strokeLinecap="round" fill="none">
        <path d="M-30 0C-20 -24 -10 -30 -4 -10M30 0C20 -24 10 -30 4 -10M0 -6V-34" />
        <ellipse cx={0} cy={4} rx={40} ry={8} />
      </g>
    )
  }
  return (
    <g>
      <path
        d="M-24 0C-28 -26 -22 -44 0 -48C22 -44 28 -26 24 0Z"
        fill="#d8c08a"
        stroke={INK}
        strokeWidth={1.8}
      />
      <path d="M-10 -46L0 -56L10 -46" stroke={INK} strokeWidth={1.8} fill="none" />
      <path d="M-12 -20H12M-10 -12H10" stroke="#a8884a" strokeWidth={1.6} />
    </g>
  )
}
