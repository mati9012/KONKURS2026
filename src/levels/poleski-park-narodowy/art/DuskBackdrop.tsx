import { useMemo } from 'react'
import { ridgePath, scatter } from '@/components/watercolor/paint'
import { TreeLine } from '@/components/watercolor/TreeLine'
import { PAINT, PAINT_SOFT, PAINT_WASH } from '@/components/watercolor/WatercolorDefs'
import type { SceneLayout } from '@/levels/poleski-park-narodowy/scene-layout'
import { lakeLine } from '@/levels/poleski-park-narodowy/voice-perches'

const FOREST = {
  fir: ['#3a3a52', '#42425a', '#36364c'],
  beech: ['#4a4a62', '#52526a'],
  trunk: '#2a2a3a',
}

export function DuskBackdrop({ layout }: { layout: SceneLayout }) {
  const { world, horizon, unit } = layout
  const { width, height } = world
  const shore = lakeLine(layout)
  const reeds = useMemo(
    () =>
      scatter(19, Math.round(width / 5), {
        x: -20,
        y: shore + 4 * unit,
        width: width + 40,
        height: height - shore,
      }).sort((a, b) => a.y - b.y),
    [width, height, shore, unit],
  )

  return (
    <g>
      <defs>
        <linearGradient id="pl-dusk-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3a6a" />
          <stop offset="0.55" stopColor="#b86a6a" />
          <stop offset="1" stopColor="#f4b46a" />
        </linearGradient>
        <linearGradient id="pl-dusk-lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8a46a" />
          <stop offset="1" stopColor="#5a4a6a" />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill="url(#pl-dusk-sky)" />
      <rect width={width} height={height} fill="#fff" filter={PAINT_WASH} opacity={0.15} />
      <circle cx={width * 0.68} cy={horizon - 10 * unit} r={54 * unit} fill="#ffd89a" />
      <path
        d={ridgePath(width, horizon - 10 * unit, 18 * unit, 21, height, 0.003)}
        fill="#5a4a6a"
        filter={PAINT_SOFT}
      />
      <TreeLine
        width={width}
        baseY={horizon + 20 * unit}
        height={64 * unit}
        seed={64}
        palette={FOREST}
        filter={PAINT_SOFT}
      />
      <rect
        y={horizon + 20 * unit}
        width={width}
        height={height}
        fill="url(#pl-dusk-lake)"
        filter={PAINT}
      />
      <path
        d={`M${width * 0.6} ${horizon + 40 * unit}h${width * 0.16}M${width * 0.62} ${horizon + 60 * unit}h${width * 0.1}`}
        stroke="#ffe0a8"
        strokeWidth={4 * unit}
        strokeLinecap="round"
        opacity={0.7}
      />
      <path
        d={ridgePath(width, shore, 18 * unit, 33, height, 0.006)}
        fill="#3a4a2a"
        filter={PAINT}
      />
      {reeds.map((reed, index) => (
        <g key={index} opacity={0.6 + reed.tone * 0.4}>
          <path
            d={`M${reed.x} ${reed.y}C${reed.x + 4 * unit} ${reed.y - 50 * unit} ${reed.x - 2 * unit} ${reed.y - 90 * unit} ${reed.x + 6 * unit} ${reed.y - 130 * unit * reed.size}`}
            stroke={reed.tone > 0.5 ? '#2a3420' : '#3a4628'}
            strokeWidth={4.5 * unit}
            fill="none"
          />
          {reed.tone > 0.6 && (
            <ellipse
              cx={reed.x + 6 * unit}
              cy={reed.y - 130 * unit * reed.size}
              rx={4 * unit}
              ry={14 * unit}
              fill="#5a3a22"
            />
          )}
        </g>
      ))}
    </g>
  )
}
