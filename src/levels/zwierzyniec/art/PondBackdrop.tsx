import { useMemo } from 'react'
import { blobPath, ridgePath, scatter } from '@/components/watercolor/paint'
import { ChurchArt } from '@/levels/zwierzyniec/art/ChurchArt'
import { TreeLine } from '@/components/watercolor/TreeLine'
import { PAINT, PAINT_SOFT, PAINT_WASH } from '@/components/watercolor/WatercolorDefs'
import type { BridgeLayout } from '@/levels/zwierzyniec/bridge-layout'

const FAR_FOREST = {
  fir: ['#5d7f72', '#527467', '#6a8a78'],
  beech: ['#86956a', '#7d8f63'],
  trunk: '#4f5b4a',
}
const ISLAND_TREES = {
  fir: ['#3c6448', '#33573f'],
  beech: ['#5f8645', '#6f9550', '#58803f'],
  trunk: '#5b4632',
}

function Reeds({
  x,
  y,
  unit,
  seed,
  count = 7,
}: {
  x: number
  y: number
  unit: number
  seed: number
  count?: number
}) {
  const reeds = useMemo(
    () =>
      scatter(seed, count, {
        x: x - 40 * unit,
        y: y - 6 * unit,
        width: 80 * unit,
        height: 12 * unit,
      }),
    [x, y, unit, seed, count],
  )
  return (
    <g strokeLinecap="round" fill="none">
      {reeds.map((reed) => {
        const height = 46 * unit * reed.size
        const lean = (reed.tone - 0.5) * 16 * unit
        return (
          <g key={`${reed.x}-${reed.y}`}>
            <path
              d={`M${reed.x} ${reed.y}Q${reed.x + lean * 0.3} ${reed.y - height * 0.6} ${reed.x + lean} ${reed.y - height}`}
              stroke="#5d7a3a"
              strokeWidth={2.2 * unit}
            />
            {reed.tone > 0.45 && (
              <path
                d={`M${reed.x + lean * 0.85} ${reed.y - height * 0.86}L${reed.x + lean * 0.95} ${reed.y - height * 0.98}`}
                stroke="#6b4a2c"
                strokeWidth={5 * unit}
              />
            )}
          </g>
        )
      })}
    </g>
  )
}

function Island({
  island,
  seed,
  unit,
  trees,
}: {
  island: BridgeLayout['islands'][number]
  seed: number
  unit: number
  trees: boolean
}) {
  return (
    <g>
      <path
        d={blobPath(
          island.x,
          island.y + island.ry * 0.5,
          island.rx * 1.05,
          island.ry * 0.7,
          seed + 9,
          0.12,
        )}
        fill="#2b4a4c"
        opacity={0.35}
        filter={PAINT_SOFT}
      />
      {trees && (
        <g transform={`translate(${island.x - island.rx * 0.6} 0)`}>
          <TreeLine
            width={island.rx * 1.2}
            baseY={island.y - island.ry * 0.15}
            height={60 * unit}
            seed={seed}
            palette={ISLAND_TREES}
            density={0.8}
            bleed={0}
            filter={PAINT}
          />
        </g>
      )}
      <g filter={PAINT}>
        <path
          d={blobPath(island.x, island.y, island.rx, island.ry, seed, 0.12, 14)}
          fill="#8fa766"
        />
        <path
          d={blobPath(
            island.x,
            island.y + island.ry * 0.45,
            island.rx * 0.96,
            island.ry * 0.4,
            seed + 1,
            0.1,
          )}
          fill="#7a6a4c"
          opacity={0.7}
        />
        <path
          d={blobPath(
            island.x - island.rx * 0.2,
            island.y - island.ry * 0.25,
            island.rx * 0.5,
            island.ry * 0.4,
            seed + 2,
            0.2,
          )}
          fill="#a9bd78"
          opacity={0.7}
        />
      </g>
      <Reeds
        x={island.x - island.rx * 0.8}
        y={island.y + island.ry * 0.5}
        unit={unit}
        seed={seed + 4}
      />
      <Reeds
        x={island.x + island.rx * 0.75}
        y={island.y + island.ry * 0.45}
        unit={unit}
        seed={seed + 5}
        count={5}
      />
    </g>
  )
}

function LilyPads({ layout }: { layout: BridgeLayout }) {
  const { world, horizon, unit } = layout
  const pads = useMemo(
    () =>
      scatter(63, 16, {
        x: 0,
        y: horizon + 120 * unit,
        width: world.width,
        height: layout.nodes[0].y - horizon - 160 * unit,
      }),
    [world, horizon, unit, layout.nodes],
  )
  return (
    <g>
      {pads.map((pad, index) => {
        const r = 16 * unit * pad.size
        return (
          <g key={index}>
            <path
              d={`M${pad.x} ${pad.y}L${pad.x + r} ${pad.y - r * 0.12}A${r} ${r * 0.42} 0 1 1 ${pad.x + r * 0.7} ${pad.y + r * 0.3}Z`}
              fill={pad.tone > 0.5 ? '#6f9a4e' : '#5d8842'}
              stroke="#3c5a2c"
              strokeWidth={1.2 * unit}
            />
            {index % 4 === 0 && (
              <circle
                cx={pad.x - r * 0.3}
                cy={pad.y - r * 0.15}
                r={r * 0.28}
                fill="#fbe7ef"
                stroke="#c98aa4"
                strokeWidth={unit}
              />
            )}
          </g>
        )
      })}
    </g>
  )
}

export function PondBackdrop({ layout, lit }: { layout: BridgeLayout; lit: boolean }) {
  const { world, horizon, unit, islands, church } = layout
  const shoreY = layout.nodes[0].y

  return (
    <g>
      <defs>
        <linearGradient id="zw-dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8fa3c9" />
          <stop offset="60%" stopColor="#e9b98f" />
          <stop offset="100%" stopColor="#f7dcae" />
        </linearGradient>
        <linearGradient id="zw-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c9c3a8" />
          <stop offset="18%" stopColor="#7fa2a4" />
          <stop offset="70%" stopColor="#4e7c86" />
          <stop offset="100%" stopColor="#365f6c" />
        </linearGradient>
        <radialGradient id="zw-glow">
          <stop offset="0%" stopColor="#ffd36e" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffd36e" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x={-60} y={-60} width={world.width + 120} height={horizon + 120} fill="url(#zw-dusk)" />
      <g filter={PAINT_SOFT}>
        <path
          d={ridgePath(world.width, horizon - 46 * unit, 30 * unit, 4, horizon + 30, 0.003)}
          fill="#8a8fa8"
          opacity={0.8}
        />
      </g>
      <TreeLine
        width={world.width}
        baseY={horizon + 10 * unit}
        height={64 * unit}
        seed={14}
        palette={FAR_FOREST}
        density={1.5}
        filter={PAINT_SOFT}
      />
      <g filter={PAINT}>
        <rect
          x={-60}
          y={horizon + 6 * unit}
          width={world.width + 120}
          height={world.height - horizon + 60}
          fill="url(#zw-water)"
        />
      </g>
      <rect
        x={-60}
        y={horizon}
        width={world.width + 120}
        height={world.height - horizon + 60}
        filter={PAINT_WASH}
        opacity={0.35}
      />
      <g transform={`translate(0 ${2 * (horizon + 10 * unit)}) scale(1 -1)`} opacity={0.22}>
        <TreeLine
          width={world.width}
          baseY={horizon + 10 * unit}
          height={64 * unit}
          seed={14}
          palette={FAR_FOREST}
          density={1.5}
          filter={PAINT_SOFT}
        />
      </g>
      <g stroke="#e9f1ee" strokeLinecap="round" opacity={0.55} className="zw-ripples">
        {scatter(5, 26, {
          x: 0,
          y: horizon + 40 * unit,
          width: world.width,
          height: world.height - horizon,
        }).map((ripple, index) => (
          <path
            key={index}
            d={`M${ripple.x} ${ripple.y}h${(30 + ripple.tone * 70) * unit}`}
            strokeWidth={(1.4 + ripple.size) * unit}
            style={{ animationDelay: `${-index * 0.37}s` }}
          />
        ))}
      </g>
      <LilyPads layout={layout} />
      {islands.map((island, index) => (
        <Island key={index} island={island} seed={index * 31 + 7} unit={unit} trees={index < 2} />
      ))}
      <g
        transform={`translate(${church.x} ${church.y + 40 * unit}) scale(${unit} ${-unit * 0.8})`}
        opacity={0.25}
      >
        <ChurchArt lit={lit} />
      </g>
      {lit && (
        <ellipse
          cx={church.x}
          cy={church.y - 50 * unit}
          rx={170 * unit}
          ry={110 * unit}
          fill="url(#zw-glow)"
        />
      )}
      <g transform={`translate(${church.x} ${church.y}) scale(${unit})`}>
        <ChurchArt lit={lit} />
      </g>
      <g filter={PAINT}>
        <path
          d={ridgePath(world.width, shoreY + 20 * unit, 14 * unit, 9, world.height + 60, 0.006)}
          fill="#7f9c58"
        />
        <path
          d={ridgePath(world.width, shoreY + 42 * unit, 10 * unit, 10, world.height + 60, 0.008)}
          fill="#6d8a4a"
        />
      </g>
      <Reeds x={world.width * 0.12} y={shoreY + 30 * unit} unit={unit} seed={91} count={10} />
      <Reeds x={world.width * 0.82} y={shoreY + 28 * unit} unit={unit} seed={92} count={9} />
    </g>
  )
}
