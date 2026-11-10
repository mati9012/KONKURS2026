import { useMemo } from 'react'
import { blobPath, ridgePath, scatter } from '@/components/watercolor/paint'
import { TreeLine } from '@/components/watercolor/TreeLine'
import { PAINT, PAINT_SOFT, PAINT_WASH } from '@/components/watercolor/WatercolorDefs'
import type { SceneLayout } from '@/levels/poleski-park-narodowy/scene-layout'

const FOREST = {
  fir: ['#5f7a5a', '#6a8462', '#567052'],
  beech: ['#a8bc8a', '#b4c896'],
  trunk: '#e8e4d8',
}

const MOSS = ['#a8b84a', '#c8b45a', '#b86a4a', '#94a844', '#c8c46a']

export function BogBackdrop({ layout }: { layout: SceneLayout }) {
  const { world, horizon, unit } = layout
  const { width, height } = world
  const hummocks = useMemo(
    () =>
      scatter(77, Math.round((width * (height - horizon)) / 22000), {
        x: -40,
        y: horizon + 20 * unit,
        width: width + 80,
        height: height - horizon,
      }).sort((a, b) => a.y - b.y),
    [width, height, horizon, unit],
  )
  const pools = useMemo(
    () =>
      scatter(13, 5, {
        x: width * 0.05,
        y: horizon + 60 * unit,
        width: width * 0.9,
        height: (height - horizon) * 0.7,
      }),
    [width, height, horizon, unit],
  )

  return (
    <g>
      <defs>
        <linearGradient id="pl-noon-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7ab0d8" />
          <stop offset="1" stopColor="#dcecf0" />
        </linearGradient>
        <linearGradient id="pl-peat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8a85a" />
          <stop offset="1" stopColor="#7a7a3a" />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill="url(#pl-noon-sky)" />
      <rect width={width} height={height} fill="#fff" filter={PAINT_WASH} opacity={0.25} />
      <circle cx={width * 0.5} cy={horizon * 0.22} r={50 * unit} fill="#fff8d8" />
      {[0.2, 0.62, 0.84].map((share, index) => (
        <path
          key={share}
          d={blobPath(
            width * share,
            horizon * (0.3 + index * 0.12),
            110 * unit,
            24 * unit,
            40 + index,
            0.3,
          )}
          fill="#fbfbf8"
          opacity={0.85}
          filter={PAINT_SOFT}
        />
      ))}
      <path
        d={ridgePath(width, horizon - 20 * unit, 20 * unit, 8, height, 0.003)}
        fill="#9aaab0"
        filter={PAINT_SOFT}
        opacity={0.7}
      />
      <TreeLine
        width={width}
        baseY={horizon + 6 * unit}
        height={70 * unit}
        seed={88}
        palette={FOREST}
        density={0.7}
        filter={PAINT_SOFT}
      />
      <rect
        y={horizon}
        width={width}
        height={height - horizon}
        fill="url(#pl-peat)"
        filter={PAINT}
      />
      {pools.map((pool, index) => (
        <path
          key={index}
          d={blobPath(
            pool.x,
            pool.y,
            90 * unit * pool.size,
            18 * unit * pool.size,
            60 + index,
            0.25,
          )}
          fill="#4a6a6a"
          opacity={0.75}
          filter={PAINT}
        />
      ))}
      {hummocks.map((spot, index) => (
        <path
          key={index}
          d={blobPath(
            spot.x,
            spot.y,
            70 * unit * spot.size,
            20 * unit * spot.size,
            90 + index,
            0.25,
          )}
          fill={MOSS[index % MOSS.length]}
          opacity={0.85}
          filter={PAINT_SOFT}
        />
      ))}
    </g>
  )
}
