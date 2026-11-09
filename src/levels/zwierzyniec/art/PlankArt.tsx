const INK = '#3a2614'

export function PlankArt({ span, rotten }: { span: number; rotten: boolean }) {
  const half = 8
  const wood = rotten ? '#4a3d33' : '#d8a86b'
  const grain = rotten ? '#2c241e' : '#a8763f'
  return (
    <g>
      <path
        d={`M0 ${-half}L${span} ${-half + 1}L${span} ${half}L0 ${half - 1}Z`}
        fill={wood}
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path
        d={`M6 ${-3}C${span * 0.3} ${-5} ${span * 0.6} ${-1} ${span - 6} ${-3}M10 ${3}C${span * 0.35} ${5} ${span * 0.7} ${1} ${span - 10} ${3}`}
        fill="none"
        stroke={grain}
        strokeWidth={1.2}
      />
      {!rotten && (
        <path d={`M4 ${-half + 2}H${span - 4}`} stroke="#f2cf98" strokeWidth={1.4} opacity={0.8} />
      )}
      {rotten && (
        <>
          <path
            d={`M${span * 0.42} ${-half}L${span * 0.47} ${-1}L${span * 0.4} ${2}L${span * 0.46} ${half}`}
            fill="none"
            stroke="#1a1410"
            strokeWidth={1.8}
          />
          <circle cx={span * 0.75} cy={1} r={2.6} fill="#2a5a2a" opacity={0.8} />
          <circle cx={span * 0.2} cy={-2} r={2} fill="#2a5a2a" opacity={0.7} />
        </>
      )}
      <circle cx={5} cy={0} r={1.6} fill={INK} />
      <circle cx={span - 5} cy={0} r={1.6} fill={INK} />
    </g>
  )
}
