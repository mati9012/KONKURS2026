const INK = '#2a2418'

export function HatchlingArt({ hiding, step }: { hiding: boolean; step: number }) {
  const swing = Math.sin(step * 14) * 3
  return (
    <g>
      <ellipse cx={0} cy={2} rx={26} ry={5} fill="#1c2a14" opacity={0.25} />
      {!hiding && (
        <>
          <path
            d={`M14 -4C20 -6 27 -9 30 -6C32 -3 28 1 20 0Z`}
            fill="#6a6a3a"
            stroke={INK}
            strokeWidth={1.4}
          />
          <circle cx={26} cy={-6} r={1.6} fill={INK} />
          <path
            d={`M${-10 + swing} -1L${-13 + swing} 4`}
            stroke="#5a5a30"
            strokeWidth={5}
            strokeLinecap="round"
          />
          <path
            d={`M${10 - swing} -1L${13 - swing} 4`}
            stroke="#5a5a30"
            strokeWidth={5}
            strokeLinecap="round"
          />
          <path d="M-18 -3L-25 -1" stroke="#5a5a30" strokeWidth={3} strokeLinecap="round" />
        </>
      )}
      <path
        d="M-20 -1C-20 -17 -8 -23 0 -23C10 -23 20 -16 20 -1Z"
        fill="#4a4a2a"
        stroke={INK}
        strokeWidth={1.6}
      />
      <path
        d="M-12 -4L-8 -16M0 -4V-21M12 -4L8 -16M-18 -8H18"
        stroke="#262412"
        strokeWidth={1}
        opacity={0.7}
      />
      <circle cx={-6} cy={-12} r={1.4} fill="#e8c84a" />
      <circle cx={5} cy={-15} r={1.4} fill="#e8c84a" />
      <circle cx={9} cy={-8} r={1.2} fill="#e8c84a" />
      <circle cx={-12} cy={-7} r={1.2} fill="#e8c84a" />
      <path d="M-21 -1H21" stroke="#c8b060" strokeWidth={2} />
    </g>
  )
}
