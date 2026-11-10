import type { ColumnKind } from '@/content/kock'

const INK = '#3a2a22'
const STONE = '#f2e8d4'
const SHADE = '#d8c8a8'

function Capital({ kind, w }: { kind: ColumnKind; w: number }) {
  const half = w / 2
  if (kind === 'ionic') {
    return (
      <g>
        <rect
          x={-half * 1.25}
          y={-w * 0.5}
          width={w * 1.25}
          height={w * 0.16}
          fill={STONE}
          stroke={INK}
          strokeWidth={1.4}
        />
        <path
          d={`M${-half * 1.1} ${-w * 0.34}H${half * 1.1}V${-w * 0.16}H${-half * 1.1}Z`}
          fill={STONE}
          stroke={INK}
          strokeWidth={1.4}
        />
        {[-1, 1].map((side) => (
          <g key={side} transform={`translate(${side * half * 1.05} ${-w * 0.2})`}>
            <circle cx={0} cy={0} r={w * 0.2} fill={STONE} stroke={INK} strokeWidth={1.4} />
            <path
              d={`M0 0m${-w * 0.12} 0a${w * 0.12} ${w * 0.12} 0 1 1 ${w * 0.12} ${w * 0.12}a${w * 0.07} ${w * 0.07} 0 1 1 ${-w * 0.05} ${-w * 0.08}`}
              fill="none"
              stroke={INK}
              strokeWidth={1.2}
            />
          </g>
        ))}
      </g>
    )
  }
  if (kind === 'corinthian') {
    return (
      <g>
        <rect
          x={-half * 1.2}
          y={-w * 0.95}
          width={w * 1.2}
          height={w * 0.14}
          fill={STONE}
          stroke={INK}
          strokeWidth={1.4}
        />
        <path
          d={`M${-half} 0L${-half * 1.1} ${-w * 0.8}H${half * 1.1}L${half} 0Z`}
          fill={STONE}
          stroke={INK}
          strokeWidth={1.4}
        />
        {[-0.7, -0.25, 0.25, 0.7].map((share) => (
          <path
            key={share}
            d={`M${share * half} 0C${share * half - w * 0.18} ${-w * 0.2} ${share * half - w * 0.12} ${-w * 0.42} ${share * half} ${-w * 0.5}C${share * half + w * 0.12} ${-w * 0.42} ${share * half + w * 0.18} ${-w * 0.2} ${share * half} 0Z`}
            fill="#c8d0a0"
            stroke={INK}
            strokeWidth={1.2}
          />
        ))}
        {[-0.45, 0, 0.45].map((share) => (
          <path
            key={share}
            d={`M${share * half} ${-w * 0.36}C${share * half - w * 0.16} ${-w * 0.52} ${share * half - w * 0.1} ${-w * 0.72} ${share * half} ${-w * 0.8}C${share * half + w * 0.1} ${-w * 0.72} ${share * half + w * 0.16} ${-w * 0.52} ${share * half} ${-w * 0.36}Z`}
            fill="#b4c08a"
            stroke={INK}
            strokeWidth={1.2}
          />
        ))}
        {[-1, 1].map((side) => (
          <circle
            key={side}
            cx={side * half * 1.02}
            cy={-w * 0.82}
            r={w * 0.08}
            fill={STONE}
            stroke={INK}
            strokeWidth={1.2}
          />
        ))}
      </g>
    )
  }
  return (
    <g>
      <rect
        x={-half * 1.2}
        y={-w * 0.42}
        width={w * 1.2}
        height={w * 0.16}
        fill={STONE}
        stroke={INK}
        strokeWidth={1.4}
      />
      <path
        d={`M${-half} 0Q${-half * 1.2} ${-w * 0.14} ${-half * 1.12} ${-w * 0.26}H${half * 1.12}Q${half * 1.2} ${-w * 0.14} ${half} 0Z`}
        fill={STONE}
        stroke={INK}
        strokeWidth={1.4}
      />
    </g>
  )
}

export function ColumnArt({ kind, height }: { kind: ColumnKind; height: number }) {
  const w = height * 0.14
  const half = w / 2
  const hasBase = kind !== 'doric'
  const fluted = kind !== 'tuscan'
  const base = hasBase ? w * 0.28 : 0
  const capital = kind === 'corinthian' ? w * 0.95 : kind === 'ionic' ? w * 0.5 : w * 0.42
  const shaftTop = -height + capital
  const shaftBottom = -base

  return (
    <g>
      {hasBase && (
        <g>
          <rect
            x={-half * 1.25}
            y={-base * 0.45}
            width={w * 1.25}
            height={base * 0.45}
            fill={STONE}
            stroke={INK}
            strokeWidth={1.4}
          />
          <rect
            x={-half * 1.1}
            y={-base}
            width={w * 1.1}
            height={base * 0.55}
            rx={base * 0.25}
            fill={STONE}
            stroke={INK}
            strokeWidth={1.4}
          />
        </g>
      )}
      <path
        d={`M${-half} ${shaftBottom}L${-half * 0.86} ${shaftTop}H${half * 0.86}L${half} ${shaftBottom}Z`}
        fill={STONE}
        stroke={INK}
        strokeWidth={1.4}
      />
      <path
        d={`M${half * 0.35} ${shaftBottom}L${half * 0.3} ${shaftTop}H${half * 0.86}L${half} ${shaftBottom}Z`}
        fill={SHADE}
      />
      {fluted &&
        [-0.6, -0.2, 0.2, 0.6].map((share) => (
          <path
            key={share}
            d={`M${share * half} ${shaftBottom - 4}L${share * half * 0.88} ${shaftTop + 4}`}
            stroke="#b8a888"
            strokeWidth={1.3}
          />
        ))}
      <g transform={`translate(0 ${shaftTop})`}>
        <Capital kind={kind} w={w} />
      </g>
    </g>
  )
}
