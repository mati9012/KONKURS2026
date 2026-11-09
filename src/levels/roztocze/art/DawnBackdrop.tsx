import { useMemo } from 'react'
import { blobPath, ridgePath, scatter } from '@/components/watercolor/paint'
import { TreeLine } from '@/components/watercolor/TreeLine'
import { PAINT, PAINT_SOFT, PAINT_WASH } from '@/components/watercolor/WatercolorDefs'
import { CzartyDance } from '@/levels/roztocze/art/CzartyDance'
import type { SceneLayout } from '@/levels/roztocze/scene-layout'

const FAR_FOREST = {
  fir: ['#5d7a7a', '#68827e', '#557274'],
  beech: ['#7f967a', '#8a9f80'],
  trunk: '#4f605a',
}

type DawnBackdropProps = {
  layout: SceneLayout
  progress: number
  hill: number
}

export function DawnBackdrop({ layout, progress, hill }: DawnBackdropProps) {
  const { world, horizon, unit } = layout
  const { width, height } = world
  const meadow = useMemo(
    () =>
      scatter(29, Math.round((width * (height - hill)) / 9000), {
        x: 0,
        y: hill + 40 * unit,
        width,
        height: height - hill - 40 * unit,
      }),
    [width, height, hill, unit],
  )
  const sunY = horizon + 40 * unit - progress * horizon * 0.62
  const hillPath = `M-40 ${height}L-40 ${hill + 120 * unit}C${width * 0.18} ${hill - 40 * unit} ${width * 0.38} ${hill - 90 * unit} ${width * 0.55} ${hill - 80 * unit}C${width * 0.75} ${hill - 70 * unit} ${width * 0.9} ${hill - 10 * unit} ${width + 40} ${hill + 60 * unit}L${width + 40} ${height}Z`

  return (
    <g>
      <defs>
        <linearGradient id="rz-dawn-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2f58" />
          <stop offset="1" stopColor="#8a6a8a" />
        </linearGradient>
        <linearGradient id="rz-dawn-day" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fbcd8" />
          <stop offset="0.7" stopColor="#f6d6a6" />
          <stop offset="1" stopColor="#ffc88a" />
        </linearGradient>
        <radialGradient id="rz-dawn-sun">
          <stop offset="0" stopColor="#fff6d0" />
          <stop offset="0.45" stopColor="#ffd890" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffb070" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="rz-dawn-hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7d9a5a" />
          <stop offset="1" stopColor="#5b7a44" />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill="url(#rz-dawn-night)" />
      <rect
        width={width}
        height={height}
        fill="url(#rz-dawn-day)"
        style={{ opacity: progress, transition: 'opacity 1.4s' }}
      />
      <rect width={width} height={height} fill="#fff" filter={PAINT_WASH} opacity={0.3} />
      <g style={{ transform: `translateY(${sunY}px)`, transition: 'transform 1.6s ease-out' }}>
        <circle cx={width * 0.7} cy={0} r={180 * unit} fill="url(#rz-dawn-sun)" />
        <circle cx={width * 0.7} cy={0} r={46 * unit} fill="#fff0b8" />
      </g>
      <path
        d={ridgePath(width, horizon - 40 * unit, 50 * unit, 15, height, 0.003)}
        fill="#7a8aa0"
        filter={PAINT_SOFT}
        opacity={0.8}
      />
      <TreeLine
        width={width}
        baseY={horizon + 10 * unit}
        height={90 * unit}
        seed={71}
        palette={FAR_FOREST}
        filter={PAINT_SOFT}
        opacity={0.9}
      />
      <g style={{ opacity: 1 - progress, transition: 'opacity 1.4s' }}>
        <CzartyDance x={width * 0.16} y={horizon + 14 * unit} scale={unit * 1.6} />
      </g>
      <path d={hillPath} fill="url(#rz-dawn-hill)" filter={PAINT} />
      {meadow.map((spot) =>
        spot.tone > 0.82 ? (
          <circle
            key={`${spot.x}-${spot.y}`}
            cx={spot.x}
            cy={spot.y}
            r={4 * unit * spot.size}
            fill={spot.tone > 0.91 ? '#f3d35a' : '#fff6e0'}
          />
        ) : (
          <path
            key={`${spot.x}-${spot.y}`}
            d={`M${spot.x - 7 * unit} ${spot.y}l${-3 * unit} ${-14 * unit * spot.size}M${spot.x} ${spot.y}l${1 * unit} ${-19 * unit * spot.size}M${spot.x + 7 * unit} ${spot.y}l${4 * unit} ${-13 * unit * spot.size}`}
            stroke={spot.tone > 0.4 ? '#4f7038' : '#66884a'}
            strokeWidth={3 * unit}
            strokeLinecap="round"
          />
        ),
      )}
      <g filter={PAINT_SOFT} style={{ opacity: 0.7 - progress * 0.4, transition: 'opacity 1.4s' }}>
        <path
          d={blobPath(width * 0.3, horizon + 30 * unit, width * 0.3, 18 * unit, 8, 0.3)}
          fill="#f4ecf4"
        />
        <path
          d={blobPath(width * 0.75, horizon + 50 * unit, width * 0.25, 14 * unit, 9, 0.3)}
          fill="#f4ecf4"
        />
      </g>
    </g>
  )
}
