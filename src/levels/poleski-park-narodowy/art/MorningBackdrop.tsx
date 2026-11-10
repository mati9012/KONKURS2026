import { useMemo } from 'react'
import { blobPath, ridgePath, scatter } from '@/components/watercolor/paint'
import { TreeLine } from '@/components/watercolor/TreeLine'
import { PAINT, PAINT_SOFT, PAINT_WASH } from '@/components/watercolor/WatercolorDefs'
import type { SceneLayout } from '@/levels/poleski-park-narodowy/scene-layout'
import type { TurtlePath } from '@/levels/poleski-park-narodowy/turtle-path'

const FOREST = {
  fir: ['#6f8a7c', '#7a9484', '#66806f'],
  beech: ['#9aae88', '#a6b892'],
  trunk: '#5a6a5c',
}

function trail(path: TurtlePath) {
  const points = Array.from({ length: 24 }, (_, index) => path.at(index / 23))
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join('')
}

export function MorningBackdrop({ layout, path }: { layout: SceneLayout; path: TurtlePath }) {
  const { world, horizon, unit } = layout
  const { width, height } = world
  const grass = useMemo(
    () =>
      scatter(41, Math.round((width * (height - horizon)) / 7000), {
        x: 0,
        y: horizon + 30 * unit,
        width,
        height: height - horizon - 30 * unit,
      }),
    [width, height, horizon, unit],
  )
  const { pond, nest } = path

  return (
    <g>
      <defs>
        <linearGradient id="pl-morning-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c4d6e0" />
          <stop offset="0.7" stopColor="#f2e6d2" />
          <stop offset="1" stopColor="#f8e2c0" />
        </linearGradient>
        <linearGradient id="pl-meadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9db07a" />
          <stop offset="1" stopColor="#6f8f4e" />
        </linearGradient>
        <radialGradient id="pl-pond">
          <stop offset="0" stopColor="#8ab4c4" />
          <stop offset="1" stopColor="#4a7a8a" />
        </radialGradient>
      </defs>
      <rect width={width} height={height} fill="url(#pl-morning-sky)" />
      <rect width={width} height={height} fill="#fff" filter={PAINT_WASH} opacity={0.3} />
      <circle cx={width * 0.22} cy={horizon * 0.5} r={60 * unit} fill="#fff4d8" opacity={0.8} />
      <path
        d={ridgePath(width, horizon - 30 * unit, 30 * unit, 4, height, 0.003)}
        fill="#a9b8b4"
        filter={PAINT_SOFT}
        opacity={0.8}
      />
      <TreeLine
        width={width}
        baseY={horizon + 8 * unit}
        height={80 * unit}
        seed={53}
        palette={FOREST}
        filter={PAINT_SOFT}
        opacity={0.85}
      />
      <rect
        y={horizon}
        width={width}
        height={height - horizon}
        fill="url(#pl-meadow)"
        filter={PAINT}
      />
      <path
        d={trail(path)}
        fill="none"
        stroke="#c8b488"
        strokeWidth={46 * unit}
        strokeLinecap="round"
        opacity={0.55}
        filter={PAINT_SOFT}
      />
      <path
        d={blobPath(pond.x, pond.y, pond.rx, pond.ry, 12, 0.12)}
        fill="url(#pl-pond)"
        stroke="#3a5a5a"
        strokeWidth={3}
        filter={PAINT}
      />
      <path
        d={`M${pond.x - pond.rx * 0.5} ${pond.y - pond.ry * 0.2}h${pond.rx * 0.4}M${pond.x + pond.rx * 0.1} ${pond.y + pond.ry * 0.3}h${pond.rx * 0.5}`}
        stroke="#e8f2f4"
        strokeWidth={3 * unit}
        strokeLinecap="round"
        opacity={0.6}
      />
      {[-0.9, -0.75, 0.7, 0.85, 0.95].map((share) => (
        <path
          key={share}
          d={`M${pond.x + pond.rx * share} ${pond.y - pond.ry * 0.3}l${-6 * unit} ${-70 * unit}M${pond.x + pond.rx * share + 8 * unit} ${pond.y - pond.ry * 0.3}l${4 * unit} ${-58 * unit}`}
          stroke="#4f6a34"
          strokeWidth={4 * unit}
          strokeLinecap="round"
        />
      ))}
      <path
        d={blobPath(nest.x, nest.y, 60 * unit, 26 * unit, 3, 0.2)}
        fill="#d8b878"
        stroke="#8a6a3a"
        strokeWidth={2}
        filter={PAINT}
      />
      <ellipse cx={nest.x} cy={nest.y - 4 * unit} rx={18 * unit} ry={7 * unit} fill="#6a4a2a" />
      {[-10, 2, 12].map((offset) => (
        <ellipse
          key={offset}
          cx={nest.x + offset * unit}
          cy={nest.y - 2 * unit}
          rx={5 * unit}
          ry={4 * unit}
          fill="#f4ecdc"
          stroke="#8a7a5a"
          strokeWidth={1}
        />
      ))}
      {grass.map((spot) => (
        <path
          key={`${spot.x}-${spot.y}`}
          d={`M${spot.x - 6 * unit} ${spot.y}l${-3 * unit} ${-14 * unit * spot.size}M${spot.x} ${spot.y}l${1 * unit} ${-18 * unit * spot.size}M${spot.x + 6 * unit} ${spot.y}l${4 * unit} ${-12 * unit * spot.size}`}
          stroke={spot.tone > 0.5 ? '#4f7038' : '#5f8044'}
          strokeWidth={3 * unit}
          strokeLinecap="round"
        />
      ))}
      {path.bushes.map((bush, index) => (
        <g key={index} filter={PAINT}>
          <path
            d={blobPath(bush.x, bush.y - 30 * unit, 80 * unit, 46 * unit, 20 + index, 0.22)}
            fill="#4f6e3a"
          />
          <path
            d={blobPath(
              bush.x - 20 * unit,
              bush.y - 46 * unit,
              44 * unit,
              28 * unit,
              30 + index,
              0.2,
            )}
            fill="#6a8a4a"
          />
        </g>
      ))}
      <g filter={PAINT_SOFT} className="pl-mist">
        <path
          d={blobPath(width * 0.3, horizon + 14 * unit, width * 0.34, 12 * unit, 5, 0.3)}
          fill="#fbf8f4"
          opacity={0.4}
        />
        <path
          d={blobPath(width * 0.78, horizon - 10 * unit, width * 0.26, 10 * unit, 6, 0.3)}
          fill="#fbf8f4"
          opacity={0.35}
        />
      </g>
    </g>
  )
}
