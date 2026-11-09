import { useMemo } from 'react'
import { scatter } from '@/components/watercolor/paint'
import { PAINT } from '@/components/watercolor/WatercolorDefs'

type WinterWindowProps = {
  x: number
  y: number
  width: number
  height: number
  spring?: boolean
}

export function WinterWindow({ x, y, width, height, spring = false }: WinterWindowProps) {
  const flakes = useMemo(() => scatter(3, 26, { x, y, width, height }), [x, y, width, height])
  const ground = y + height * 0.72
  return (
    <g>
      <rect
        x={x - width * 0.08}
        y={y - height * 0.08}
        width={width * 1.16}
        height={height * 1.2}
        rx={6}
        fill="#5e3e24"
        filter={PAINT}
      />
      <rect x={x} y={y} width={width} height={height} fill={spring ? '#bcd8e8' : '#c9d4e2'} />
      <path
        d={`M${x} ${ground}Q${x + width * 0.3} ${ground - height * 0.08} ${x + width * 0.6} ${ground - height * 0.02}T${x + width} ${ground - height * 0.06}V${y + height}H${x}Z`}
        fill={spring ? '#9cbf6e' : '#f4f6fb'}
      />
      {[0.2, 0.62].map((share) => (
        <g key={share}>
          <path
            d={`M${x + width * share} ${ground - height * 0.02}v${-height * 0.18}h${width * 0.22}v${height * 0.18}Z`}
            fill="#9a7a5a"
          />
          <path
            d={`M${x + width * (share - 0.03)} ${ground - height * 0.2}L${x + width * (share + 0.11)} ${ground - height * 0.36}L${x + width * (share + 0.25)} ${ground - height * 0.2}Z`}
            fill={spring ? '#6a5040' : '#f8fafc'}
            stroke="#7a6a5a"
            strokeWidth={1}
          />
          <rect
            x={x + width * (share + 0.08)}
            y={ground - height * 0.14}
            width={width * 0.05}
            height={height * 0.06}
            fill="#ffd27a"
          />
        </g>
      ))}
      {!spring &&
        flakes.map((flake) => (
          <circle
            key={`${flake.x}-${flake.y}`}
            cx={flake.x}
            cy={flake.y}
            r={1.6 * flake.size}
            fill="#fff"
            opacity={0.85}
          />
        ))}
      <path
        d={`M${x + width / 2} ${y}V${y + height}M${x} ${y + height / 2}H${x + width}`}
        stroke="#5e3e24"
        strokeWidth={Math.max(4, width * 0.04)}
      />
      <rect
        x={x - width * 0.1}
        y={y + height * 1.04}
        width={width * 1.2}
        height={height * 0.08}
        fill="#4e3420"
      />
    </g>
  )
}
