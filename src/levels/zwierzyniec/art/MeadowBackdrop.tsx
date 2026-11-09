import { useMemo } from 'react'
import { createRandom } from '@/lib/noise'
import { blobPath, ridgePath, scatter } from '@/components/watercolor/paint'
import { PenFence } from '@/levels/zwierzyniec/art/PenFence'
import { TreeLine } from '@/components/watercolor/TreeLine'
import { PAINT, PAINT_SOFT, PAINT_WASH } from '@/components/watercolor/WatercolorDefs'
import type { HerdLayout } from '@/levels/zwierzyniec/herd-layout'

const FAR_FOREST = {
  fir: ['#7e9a9a', '#8aa5a0', '#708d90'],
  beech: ['#9fb19a', '#a9b9a0'],
  trunk: '#6f7f7a',
}
const NEAR_FOREST = {
  fir: ['#3f6a4c', '#355d45', '#4a7652'],
  beech: ['#6c8f4a', '#7c9c52', '#5f8446'],
  trunk: '#5b4632',
}
const FLOWER_COLORS = ['#fff6e0', '#f3d35a', '#b58bd0', '#e98f7c', '#fff6e0']

function Clouds({ width, horizon, seed }: { width: number; horizon: number; seed: number }) {
  const clouds = useMemo(() => {
    const random = createRandom(seed)
    return Array.from({ length: 5 }, (_, index) => ({
      x: (width * (index + 0.3 + random() * 0.4)) / 5,
      y: horizon * (0.22 + random() * 0.4),
      size: 40 + random() * 50,
      seed: Math.floor(random() * 1000),
    }))
  }, [width, horizon, seed])

  return (
    <g filter={PAINT_SOFT} opacity={0.92}>
      {clouds.map((cloud) => (
        <g key={cloud.seed}>
          <path
            d={blobPath(cloud.x, cloud.y, cloud.size * 2.2, cloud.size * 0.55, cloud.seed, 0.25)}
            fill="#fffaf0"
          />
          <path
            d={blobPath(
              cloud.x - cloud.size * 0.4,
              cloud.y - cloud.size * 0.35,
              cloud.size,
              cloud.size * 0.6,
              cloud.seed + 3,
              0.2,
            )}
            fill="#fffdf6"
          />
          <path
            d={blobPath(
              cloud.x + cloud.size * 0.2,
              cloud.y + cloud.size * 0.25,
              cloud.size * 1.8,
              cloud.size * 0.2,
              cloud.seed + 5,
              0.2,
            )}
            fill="#dfe3ec"
            opacity={0.8}
          />
        </g>
      ))}
    </g>
  )
}

function Bush({ x, y, r, seed }: { x: number; y: number; r: number; seed: number }) {
  const berries = useMemo(
    () => scatter(seed, 7, { x: x - r * 0.7, y: y - r * 1.3, width: r * 1.4, height: r * 0.9 }),
    [x, y, r, seed],
  )
  return (
    <g>
      <ellipse cx={x} cy={y + r * 0.1} rx={r * 1.25} ry={r * 0.32} fill="#2c3a1c" opacity={0.25} />
      <g filter={PAINT}>
        <path d={blobPath(x, y - r * 0.55, r * 1.15, r * 0.75, seed, 0.18)} fill="#4d7240" />
        <path
          d={blobPath(x - r * 0.35, y - r * 0.9, r * 0.6, r * 0.45, seed + 1, 0.2)}
          fill="#668c4c"
        />
        <path
          d={blobPath(x + r * 0.4, y - r * 0.75, r * 0.55, r * 0.42, seed + 2, 0.2)}
          fill="#5b8147"
        />
        <path
          d={blobPath(x - r * 0.1, y - r * 1.1, r * 0.35, r * 0.25, seed + 3, 0.2)}
          fill="#88a95f"
          opacity={0.8}
        />
      </g>
      {berries.map((berry) => (
        <circle
          key={`${berry.x}-${berry.y}`}
          cx={berry.x}
          cy={berry.y}
          r={r * 0.06 * berry.size}
          fill="#b8322a"
        />
      ))}
    </g>
  )
}

function Meadow({ layout }: { layout: HerdLayout }) {
  const { world, horizon, unit } = layout
  const flowers = useMemo(
    () =>
      scatter(41, Math.round((world.width * world.height) / 9000), {
        x: 0,
        y: layout.field.top - 20 * unit,
        width: world.width,
        height: world.height - layout.field.top,
      }),
    [world, layout.field.top, unit],
  )
  const tufts = useMemo(
    () =>
      scatter(77, Math.round((world.width * world.height) / 7000), {
        x: 0,
        y: horizon + 20 * unit,
        width: world.width,
        height: world.height - horizon,
      }),
    [world, horizon, unit],
  )
  const patches = useMemo(
    () =>
      scatter(19, 9, {
        x: 0,
        y: horizon + 40 * unit,
        width: world.width,
        height: world.height - horizon,
      }),
    [world, horizon, unit],
  )

  return (
    <g>
      <g filter={PAINT}>
        <path
          d={ridgePath(world.width, horizon + 18 * unit, 14 * unit, 5, world.height + 40)}
          fill="url(#zw-meadow)"
        />
        {patches.map((patch, index) => (
          <path
            key={index}
            d={blobPath(
              patch.x,
              patch.y,
              160 * unit * patch.size,
              40 * unit * patch.size,
              index + 60,
              0.3,
            )}
            fill={patch.tone > 0.5 ? '#c7cf86' : '#86a35c'}
            opacity={0.45}
          />
        ))}
      </g>
      <g stroke="#5f7d3e" strokeWidth={1.6 * unit} strokeLinecap="round" fill="none" opacity={0.7}>
        {tufts.map((tuft) => {
          const size =
            9 * unit * tuft.size * (0.6 + ((tuft.y - horizon) / (world.height - horizon)) * 0.8)
          return (
            <path
              key={`${tuft.x}-${tuft.y}`}
              d={`M${tuft.x - size * 0.6} ${tuft.y - size}Q${tuft.x - size * 0.2} ${tuft.y - size * 0.3} ${tuft.x} ${tuft.y}Q${tuft.x + size * 0.1} ${tuft.y - size * 0.7} ${tuft.x + size * 0.2} ${tuft.y - size * 1.3}M${tuft.x} ${tuft.y}Q${tuft.x + size * 0.4} ${tuft.y - size * 0.4} ${tuft.x + size * 0.8} ${tuft.y - size * 0.9}`}
            />
          )
        })}
      </g>
      {flowers.map((flower, index) => (
        <circle
          key={`${flower.x}-${flower.y}`}
          cx={flower.x}
          cy={flower.y}
          r={2.6 * unit * flower.size}
          fill={FLOWER_COLORS[index % FLOWER_COLORS.length]}
          opacity={0.9}
        />
      ))}
    </g>
  )
}

function Trail({ layout }: { layout: HerdLayout }) {
  const { pen, world, unit } = layout
  const gateX = (pen.gateLeft + pen.gateRight) / 2
  const startX = world.width < world.height ? world.width * 0.5 : world.width * 0.22
  const path = `M${startX - 70 * unit} ${world.height + 20}C${startX - 40 * unit} ${world.height * 0.8} ${gateX - 260 * unit} ${pen.bottom + 140 * unit} ${gateX - 50 * unit} ${pen.bottom + 6 * unit}L${gateX + 50 * unit} ${pen.bottom + 6 * unit}C${gateX - 160 * unit} ${pen.bottom + 160 * unit} ${startX + 60 * unit} ${world.height * 0.82} ${startX + 80 * unit} ${world.height + 20}Z`
  return (
    <g filter={PAINT}>
      <path d={path} fill="#d9c395" opacity={0.8} />
      <path d={path} fill="none" stroke="#b39566" strokeWidth={3 * unit} opacity={0.4} />
    </g>
  )
}

function PenGround({ layout }: { layout: HerdLayout }) {
  const { pen, unit } = layout
  const cx = (pen.left + pen.right) / 2
  const cy = (pen.top + pen.bottom) / 2
  const hayX = pen.right - 70 * unit
  const hayY = pen.top + 30 * unit
  return (
    <g>
      <g filter={PAINT}>
        <path
          d={blobPath(
            cx,
            cy + 6 * unit,
            (pen.right - pen.left) * 0.47,
            (pen.bottom - pen.top) * 0.5,
            88,
            0.08,
            14,
          )}
          fill="#cdb886"
          opacity={0.75}
        />
        <path d={blobPath(hayX, hayY, 46 * unit, 22 * unit, 12, 0.15)} fill="#e6c467" />
        <path
          d={blobPath(hayX - 8 * unit, hayY - 12 * unit, 30 * unit, 16 * unit, 13, 0.2)}
          fill="#f2d685"
        />
      </g>
      <g stroke="#a7802d" strokeWidth={1.2 * unit} opacity={0.8}>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <path
            key={index}
            d={`M${hayX - 36 * unit + index * 13 * unit} ${hayY + 8 * unit}l${8 * unit} ${-22 * unit}`}
          />
        ))}
      </g>
      <g>
        <path
          d={`M${pen.left + 40 * unit} ${pen.top + 26 * unit}h${90 * unit}l${-8 * unit} ${22 * unit}h${-74 * unit}Z`}
          fill="#8a5f36"
          stroke="#3a2614"
          strokeWidth={2 * unit}
          strokeLinejoin="round"
        />
        <path
          d={`M${pen.left + 44 * unit} ${pen.top + 30 * unit}h${82 * unit}`}
          stroke="#7fb0c8"
          strokeWidth={5 * unit}
          strokeLinecap="round"
        />
      </g>
    </g>
  )
}

export function MeadowBackdrop({ layout }: { layout: HerdLayout }) {
  const { world, horizon, unit } = layout

  return (
    <g>
      <defs>
        <linearGradient id="zw-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9ec3dc" />
          <stop offset="70%" stopColor="#d9e6e4" />
          <stop offset="100%" stopColor="#f6e8c6" />
        </linearGradient>
        <radialGradient id="zw-sun">
          <stop offset="0%" stopColor="#fff6d8" stopOpacity="1" />
          <stop offset="18%" stopColor="#fff1c4" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffe9b0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="zw-meadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a9bd73" />
          <stop offset="45%" stopColor="#9db66a" />
          <stop offset="100%" stopColor="#7d9e55" />
        </linearGradient>
      </defs>
      <rect x={-60} y={-60} width={world.width + 120} height={horizon + 120} fill="url(#zw-sky)" />
      <rect
        x={-60}
        y={-60}
        width={world.width + 120}
        height={horizon + 120}
        filter={PAINT_WASH}
        opacity={0.6}
      />
      <circle cx={world.width * 0.78} cy={horizon * 0.32} r={150 * unit} fill="url(#zw-sun)" />
      <Clouds width={world.width} horizon={horizon} seed={3} />
      <g filter={PAINT_SOFT}>
        <path
          d={ridgePath(world.width, horizon - 70 * unit, 60 * unit, 1, horizon + 40, 0.0025)}
          fill="#b3c2cc"
        />
        <path
          d={ridgePath(world.width, horizon - 36 * unit, 44 * unit, 2, horizon + 40, 0.0035)}
          fill="#9fb3b5"
        />
      </g>
      <TreeLine
        width={world.width}
        baseY={horizon - 4 * unit}
        height={70 * unit}
        seed={8}
        palette={FAR_FOREST}
        density={1.6}
        filter={PAINT_SOFT}
        opacity={0.85}
      />
      <TreeLine
        width={world.width}
        baseY={horizon + 22 * unit}
        height={120 * unit}
        seed={21}
        palette={NEAR_FOREST}
        density={1.3}
        filter={PAINT}
      />
      <Meadow layout={layout} />
      <Trail layout={layout} />
      <PenGround layout={layout} />
      <PenFence layout={layout} side="back" />
      {layout.bushes.map((bush, index) => (
        <Bush key={index} x={bush.x} y={bush.y} r={bush.r} seed={index * 17 + 5} />
      ))}
    </g>
  )
}
