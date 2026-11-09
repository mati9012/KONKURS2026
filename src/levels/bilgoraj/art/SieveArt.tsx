import { useId } from 'react'

const INK = '#3a2614'

type SieveArtProps = {
  rx: number
  gap: number
  wire?: boolean
}

export function SieveArt({ rx, gap, wire = false }: SieveArtProps) {
  const clip = useId()
  const ry = rx * 0.38
  const band = rx * 0.28
  const lines = []
  for (let offset = -rx; offset <= rx; offset += gap) lines.push(offset)
  const mesh = wire ? '#8a8a8a' : '#d8c8a4'

  return (
    <g>
      <defs>
        <clipPath id={clip}>
          <ellipse cx={0} cy={0} rx={rx * 0.94} ry={ry * 0.9} />
        </clipPath>
      </defs>
      <path
        d={`M${-rx} 0V${band}A${rx} ${ry} 0 0 0 ${rx} ${band}V0Z`}
        fill="#c99a62"
        stroke={INK}
        strokeWidth={2}
      />
      <path
        d={`M${-rx * 0.96} ${band * 0.55}A${rx} ${ry} 0 0 0 ${rx * 0.96} ${band * 0.55}`}
        fill="none"
        stroke="#a87a48"
        strokeWidth={2}
      />
      <ellipse cx={0} cy={0} rx={rx} ry={ry} fill="#6b4a2e" stroke={INK} strokeWidth={2} />
      <g clipPath={`url(#${clip})`}>
        <ellipse cx={0} cy={0} rx={rx} ry={ry} fill="#4a3220" opacity={0.6} />
        {lines.map((offset) => (
          <g key={offset}>
            <path d={`M${offset} ${-ry}V${ry}`} stroke={mesh} strokeWidth={1.4} />
            <path d={`M${-rx} ${offset * 0.38}H${rx}`} stroke={mesh} strokeWidth={1.4} />
          </g>
        ))}
      </g>
      <ellipse cx={0} cy={0} rx={rx} ry={ry} fill="none" stroke="#e2b882" strokeWidth={rx * 0.06} />
      <ellipse cx={0} cy={0} rx={rx} ry={ry} fill="none" stroke={INK} strokeWidth={1.6} />
    </g>
  )
}
