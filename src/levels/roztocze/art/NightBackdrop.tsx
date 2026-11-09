import { useMemo } from 'react'
import { createRandom } from '@/lib/noise'
import { ridgePath, scatter } from '@/components/watercolor/paint'
import { TreeLine } from '@/components/watercolor/TreeLine'
import { PAINT, PAINT_SOFT, PAINT_WASH } from '@/components/watercolor/WatercolorDefs'
import type { SceneLayout, Spot } from '@/levels/roztocze/scene-layout'

const FAR_FOREST = {
  fir: ['#23324f', '#1f2c47', '#283857'],
  beech: ['#2a3a58', '#2f4060'],
  trunk: '#18223a',
}

type NightBackdropProps = {
  layout: SceneLayout
  stream: Spot
}

function Trunks({ layout }: { layout: SceneLayout }) {
  const { world, horizon, unit } = layout
  const trunks = useMemo(() => {
    const random = createRandom(57)
    const list = []
    for (let x = -20; x < world.width + 40; x += (140 + random() * 160) * unit) {
      list.push({
        x,
        width: (14 + random() * 22) * unit,
        base: horizon + (30 + random() * 90) * unit,
        tone: random(),
      })
    }
    return list
  }, [world.width, horizon, unit])

  return (
    <g filter={PAINT}>
      {trunks.map((trunk) => (
        <path
          key={trunk.x}
          d={`M${trunk.x - trunk.width / 2} ${trunk.base}L${trunk.x - trunk.width * 0.35} -20L${trunk.x + trunk.width * 0.35} -20L${trunk.x + trunk.width / 2} ${trunk.base}Z`}
          fill={trunk.tone > 0.5 ? '#1b2436' : '#212c40'}
        />
      ))}
    </g>
  )
}

export function NightBackdrop({ layout, stream }: NightBackdropProps) {
  const { world, horizon, unit } = layout
  const { width, height } = world
  const stars = useMemo(
    () => scatter(5, Math.round(width / 14), { x: 0, y: 0, width, height: horizon * 0.8 }),
    [width, horizon],
  )
  const ferns = useMemo(
    () =>
      scatter(61, Math.round((width * height) / 22000), {
        x: 0,
        y: horizon + 30 * unit,
        width,
        height: height - horizon,
      }),
    [width, height, horizon, unit],
  )
  const streamPath = `M${stream.x + 160 * unit} ${horizon + 20 * unit}C${stream.x + 40 * unit} ${stream.y - 60 * unit} ${stream.x + 120 * unit} ${stream.y + 40 * unit} ${stream.x + 30 * unit} ${height + 20}`

  return (
    <g>
      <defs>
        <linearGradient id="rz-night-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d1428" />
          <stop offset="0.7" stopColor="#1c2a4a" />
          <stop offset="1" stopColor="#2b3d5e" />
        </linearGradient>
        <linearGradient id="rz-night-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c3b3a" />
          <stop offset="1" stopColor="#3b4a3c" />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill="url(#rz-night-sky)" />
      <rect width={width} height={height} fill="#fff" filter={PAINT_WASH} opacity={0.12} />
      {stars.map((star) => (
        <circle
          key={`${star.x}-${star.y}`}
          cx={star.x}
          cy={star.y}
          r={1.4 * star.size * unit + 0.4}
          fill="#f4efd6"
          className={star.tone > 0.6 ? 'rz-twinkle' : undefined}
          opacity={0.5 + star.tone * 0.5}
        />
      ))}
      <circle cx={width * 0.82} cy={horizon * 0.32} r={34 * unit} fill="#f6efcf" />
      <circle
        cx={width * 0.82 + 14 * unit}
        cy={horizon * 0.32 - 8 * unit}
        r={30 * unit}
        fill="#14203a"
      />
      <path
        d={ridgePath(width, horizon - 50 * unit, 50 * unit, 6, height, 0.003)}
        fill="#22304c"
        filter={PAINT_SOFT}
      />
      <TreeLine
        width={width}
        baseY={horizon + 10 * unit}
        height={110 * unit}
        seed={44}
        palette={FAR_FOREST}
        filter={PAINT_SOFT}
      />
      <path
        d={ridgePath(width, horizon + 30 * unit, 14 * unit, 2, height, 0.002)}
        fill="url(#rz-night-ground)"
        filter={PAINT}
      />
      <Trunks layout={layout} />
      <path
        d={streamPath}
        fill="none"
        stroke="#3d5f7a"
        strokeWidth={46 * unit}
        strokeLinecap="round"
        filter={PAINT}
      />
      <g className="zw-ripples">
        <path
          d={streamPath}
          fill="none"
          stroke="#7fa3bd"
          strokeWidth={4 * unit}
          strokeDasharray={`${20 * unit} ${36 * unit}`}
          opacity={0.6}
        />
      </g>
      {ferns.map((fern) => (
        <path
          key={`${fern.x}-${fern.y}`}
          d={`M${fern.x} ${fern.y}q${-14 * unit * fern.size} ${-16 * unit} ${-26 * unit * fern.size} ${-12 * unit}M${fern.x} ${fern.y}q${2 * unit} ${-22 * unit} ${4 * unit * fern.size} ${-30 * unit * fern.size}M${fern.x} ${fern.y}q${14 * unit * fern.size} ${-16 * unit} ${26 * unit * fern.size} ${-12 * unit}`}
          stroke={fern.tone > 0.5 ? '#3f5a45' : '#35503f'}
          strokeWidth={3 * unit}
          fill="none"
          strokeLinecap="round"
        />
      ))}
    </g>
  )
}
