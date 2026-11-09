const INK = '#3a2a22'

type PieceProps = {
  length: number
  thickness: number
  seed: number
}

export function PetrifiedPiece({ length, thickness, seed }: PieceProps) {
  const half = length / 2
  const r = thickness / 2
  const tilt = ((seed % 3) - 1) * 0.06 * thickness
  const body = `M${-half} ${-r + tilt}L${half} ${-r}L${half} ${r}L${-half} ${r + tilt}Z`
  const grain = [0.3, 0, -0.3].map((share) => share * r)
  return (
    <g>
      <path d={body} fill="#a99583" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      <path
        d={`M${-half} ${-r + tilt}L${half} ${-r}L${half} ${-r * 0.45}L${-half} ${-r * 0.4}Z`}
        fill="#c8b8a2"
        opacity={0.7}
      />
      {grain.map((offset, index) => (
        <path
          key={offset}
          d={`M${-half + 6} ${offset + tilt / 2}Q${(index - 1) * 12} ${offset + 4} ${half - 6} ${offset}`}
          fill="none"
          stroke="#7e6b5b"
          strokeWidth={1.4}
          strokeLinecap="round"
        />
      ))}
      <ellipse cx={half} cy={0} rx={r * 0.32} ry={r} fill="#d6c4a8" stroke={INK} strokeWidth={2} />
      {[0.75, 0.5, 0.25].map((share) => (
        <ellipse
          key={share}
          cx={half}
          cy={0}
          rx={r * 0.32 * share}
          ry={r * share}
          fill="none"
          stroke="#8b745f"
          strokeWidth={1.2}
        />
      ))}
    </g>
  )
}
