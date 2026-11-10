const INK = '#2a1e16'

export function KayakArt({ stroke, wobble }: { stroke: number; wobble: boolean }) {
  const angle = Math.sin(stroke) * 28
  return (
    <g className={wobble ? 'wl-wobble' : undefined}>
      <ellipse cx={0} cy={6} rx={26} ry={80} fill="#1e3a4a" opacity={0.25} />
      <path
        d="M0 -84C22 -50 24 40 0 80C-24 40 -22 -50 0 -84Z"
        fill="#e8b02a"
        stroke={INK}
        strokeWidth={2}
      />
      <path d="M0 -80C10 -50 12 30 0 74" stroke="#c8402f" strokeWidth={5} fill="none" />
      <ellipse cx={0} cy={4} rx={13} ry={22} fill="#3a2a22" stroke={INK} strokeWidth={1.6} />
      <g transform={`rotate(${angle})`}>
        <path d="M-70 0H70" stroke="#6a4a2a" strokeWidth={4} strokeLinecap="round" />
        <ellipse cx={-70} cy={0} rx={8} ry={14} fill="#c8402f" stroke={INK} strokeWidth={1.4} />
        <ellipse cx={70} cy={0} rx={8} ry={14} fill="#c8402f" stroke={INK} strokeWidth={1.4} />
      </g>
      <circle cx={0} cy={-2} r={11} fill="#c8402f" stroke={INK} strokeWidth={1.6} />
      <circle cx={0} cy={-4} r={6} fill="#f0c8a0" />
    </g>
  )
}
