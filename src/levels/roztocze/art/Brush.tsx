const INK = '#3a2a22'

export function Brush({ size }: { size: number }) {
  return (
    <g transform={`scale(${size / 40}) rotate(-35)`}>
      <rect
        x={-4}
        y={-46}
        width={8}
        height={30}
        rx={3}
        fill="#a0643a"
        stroke={INK}
        strokeWidth={1.6}
      />
      <rect x={-7} y={-18} width={14} height={7} fill="#c9c2b4" stroke={INK} strokeWidth={1.4} />
      <path
        d="M-8 -11L-10 6L10 6L8 -11Z"
        fill="#e8cf8c"
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </g>
  )
}
