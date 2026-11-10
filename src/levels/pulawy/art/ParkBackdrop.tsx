import { useMemo } from 'react'
import { blobPath, ridgePath, scatter } from '@/components/watercolor/paint'
import { TreeLine } from '@/components/watercolor/TreeLine'
import { PAINT, PAINT_SOFT, PAINT_WASH } from '@/components/watercolor/WatercolorDefs'
import type { SceneLayout } from '@/levels/pulawy/scene-layout'

const TREES = {
  fir: ['#5a7e52', '#648a5a'],
  beech: ['#7aa05a', '#88ac64', '#6e9450', '#94b46e'],
  trunk: '#5a4632',
}

export function ParkBackdrop({ layout }: { layout: SceneLayout }) {
  const { world, unit, ground, portrait } = layout
  const { width, height } = world
  const lawn = ground - (portrait ? 330 : 50) * unit
  const horizon = lawn - 210 * unit
  const bushes = useMemo(
    () =>
      scatter(23, Math.round(width / 120), {
        x: 0,
        y: ground + 20 * unit,
        width,
        height: height - ground - 40 * unit,
      }),
    [width, height, ground, unit],
  )

  return (
    <g>
      <defs>
        <linearGradient id="pu-park-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8c8de" />
          <stop offset="1" stopColor="#f6ecd4" />
        </linearGradient>
        <linearGradient id="pu-lawn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a4bc72" />
          <stop offset="1" stopColor="#7e9c52" />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill="url(#pu-park-sky)" />
      <rect width={width} height={height} fill="#fff" filter={PAINT_WASH} opacity={0.3} />
      <g filter={PAINT_SOFT} opacity={0.9}>
        <path
          d={blobPath(width * 0.2, height * 0.12, 140 * unit, 20 * unit, 31, 0.3)}
          fill="#fffaf0"
        />
        <path
          d={blobPath(width * 0.72, height * 0.18, 120 * unit, 18 * unit, 37, 0.3)}
          fill="#fffaf0"
        />
      </g>
      <path
        d={ridgePath(width, horizon, 14 * unit, 12, horizon + 40 * unit, 0.003)}
        fill="#8aa4b4"
        filter={PAINT_SOFT}
        opacity={0.8}
      />
      <path
        d={`M-20 ${horizon + 26 * unit}C${width * 0.3} ${horizon + 14 * unit} ${width * 0.7} ${horizon + 36 * unit} ${width + 20} ${horizon + 22 * unit}`}
        stroke="#d8e8f0"
        strokeWidth={10 * unit}
        fill="none"
        opacity={0.8}
        filter={PAINT_SOFT}
      />
      <TreeLine
        width={width}
        baseY={lawn + 10 * unit}
        height={170 * unit}
        seed={57}
        palette={TREES}
        density={0.9}
        filter={PAINT_SOFT}
        opacity={0.95}
      />
      <rect y={lawn} width={width} height={height} fill="url(#pu-lawn)" filter={PAINT} />
      <path
        d={`M${width * 0.5 - 60 * unit} ${height}C${width * 0.46} ${ground + 60 * unit} ${width * 0.2} ${ground} ${-20} ${ground - 10 * unit}M${width * 0.5 + 60 * unit} ${height}C${width * 0.56} ${ground + 60 * unit} ${width * 0.8} ${ground} ${width + 20} ${ground - 10 * unit}`}
        stroke="#e0d0a8"
        strokeWidth={26 * unit}
        fill="none"
        opacity={0.8}
        filter={PAINT_SOFT}
      />
      {bushes.map((bush, index) => (
        <path
          key={index}
          d={blobPath(
            bush.x,
            bush.y,
            40 * unit * bush.size,
            22 * unit * bush.size,
            index + 70,
            0.25,
          )}
          fill={bush.tone > 0.5 ? '#5f8444' : '#6f9450'}
          filter={PAINT_SOFT}
        />
      ))}
    </g>
  )
}
