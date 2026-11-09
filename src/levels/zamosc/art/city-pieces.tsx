import type { ReactNode } from 'react'
import { scatter } from '@/components/watercolor/paint'
import type { BuildingId } from '@/content/zamosc'
import { blockPiece, INK } from '@/levels/zamosc/art/block-shapes'
import type { Block, Piece } from '@/levels/zamosc/art/block-shapes'
import { MARKET_HALF, polygonPath, project, SPOTS, STREET } from '@/levels/zamosc/city-layout'
import type { CityLayout, PlanPoint } from '@/levels/zamosc/city-layout'

export type BuildingArt = {
  ground?: { body: ReactNode; ink: ReactNode }
  pieces: Piece[]
}

const HOUSE_COLORS = ['#d8714f', '#e8b84a', '#6fa3a0', '#c4566b', '#8fae62', '#e59a61', '#7f8fc4']
const QUARTER_ROOFS = ['#b4553c', '#c46a45', '#9c4a36', '#b8603f']
const QUARTER_WALLS = ['#efe2c6', '#f2dcc0', '#e9dcc4', '#f1e6cf']

function blockAt(
  layout: CityLayout,
  spot: PlanPoint,
  size: { w: number; d: number; h: number },
  style: Omit<Block, 'x' | 'y' | 'w' | 'd' | 'h'>,
): Block {
  const { x, y } = project(layout, spot)
  const { scale, tilt, upright } = layout
  const [across, along] = upright ? [size.d, size.w] : [size.w, size.d]
  return { x, y, w: across * scale, d: along * scale * tilt, h: size.h * scale, ...style }
}

function palace(layout: CityLayout): BuildingArt {
  const block = blockAt(
    layout,
    SPOTS.palace,
    { w: 0.26, d: 0.22, h: 0.11 },
    { wall: '#f0e2c4', roof: '#b4553c', kind: 'hip', windows: 7, floors: 2 },
  )
  const gate = project(layout, [SPOTS.palace[0], SPOTS.palace[1] + 0.11])
  const door = layout.scale * 0.03
  const main = blockPiece('palace', block)
  return {
    pieces: [
      {
        ...main,
        ink: (
          <>
            {main.ink}
            <path
              d={`M${gate.x - door / 2} ${gate.y}v${-door}a${door / 2} ${door / 2} 0 0 1 ${door} 0v${door}Z`}
              fill="#5a3a22"
            />
          </>
        ),
      },
    ],
  }
}

function grodzka(layout: CityLayout): BuildingArt {
  const corners: PlanPoint[] = [
    [STREET.from, -STREET.half],
    [STREET.to, -STREET.half],
    [STREET.to, STREET.half],
    [STREET.from, STREET.half],
  ]
  const stones = scatter(41, 90, {
    x: STREET.from,
    y: -STREET.half * 0.8,
    width: STREET.to - STREET.from,
    height: STREET.half * 1.6,
  }).map((stone) => ({ ...project(layout, [stone.x, stone.y]), size: stone.size }))
  return {
    ground: {
      body: <path d={polygonPath(layout, corners)} fill="#d9c398" />,
      ink: (
        <g fill={INK} opacity={0.22}>
          {stones.map((stone, index) => (
            <ellipse
              key={index}
              cx={stone.x}
              cy={stone.y}
              rx={2.4 * stone.size}
              ry={1.4 * stone.size}
            />
          ))}
        </g>
      ),
    },
    pieces: [],
  }
}

function marketCorners(grow = 0): PlanPoint[] {
  const [mx] = SPOTS.market
  const half = MARKET_HALF + grow
  return [
    [mx - half, -half],
    [mx + half, -half],
    [mx + half, half],
    [mx - half, half],
  ]
}

function market(layout: CityLayout): BuildingArt {
  const [mx] = SPOTS.market
  const lines: ReactNode[] = []
  for (let step = -MARKET_HALF + 0.038; step < MARKET_HALF; step += 0.038) {
    const a = project(layout, [mx + step, -MARKET_HALF])
    const b = project(layout, [mx + step, MARKET_HALF])
    const c = project(layout, [mx - MARKET_HALF, step])
    const e = project(layout, [mx + MARKET_HALF, step])
    lines.push(<path key={`v${step}`} d={`M${a.x} ${a.y}L${b.x} ${b.y}`} />)
    lines.push(<path key={`h${step}`} d={`M${c.x} ${c.y}L${e.x} ${e.y}`} />)
  }
  const well = project(layout, [mx, 0.09])
  const r = layout.scale * 0.022
  return {
    ground: {
      body: (
        <>
          <path d={polygonPath(layout, marketCorners())} fill="#e6d2a2" />
          <ellipse cx={well.x} cy={well.y} rx={r * 1.3} ry={r * 0.9} fill="#a99f8e" />
        </>
      ),
      ink: (
        <>
          <g stroke="#fff6dc" strokeWidth={1.2} opacity={0.55}>
            {lines}
          </g>
          <ellipse cx={well.x} cy={well.y - r * 0.15} rx={r * 0.7} ry={r * 0.45} fill="#4d6a78" />
          <path
            d={polygonPath(layout, marketCorners())}
            fill="none"
            stroke={INK}
            strokeWidth={1}
            opacity={0.35}
          />
        </>
      ),
    },
    pieces: [],
  }
}

function townhall(layout: CityLayout): BuildingArt {
  const block = blockAt(
    layout,
    SPOTS.townhall,
    { w: 0.2, d: 0.08, h: 0.1 },
    { wall: '#efc2a6', roof: '#6d7d78', kind: 'hip', windows: 5, floors: 2 },
  )
  const { scale } = layout
  const body = blockPiece('townhall', block)
  const towerWidth = scale * 0.045
  const front = block.y + block.d / 2
  const towerBase = front - block.h
  const towerTop = towerBase - scale * 0.2
  const tx = block.x - towerWidth / 2
  const stairsTop = front
  const stairsBottom = front + scale * layout.tilt * 0.05
  const clock = towerTop + towerWidth * 0.7
  return {
    pieces: [
      {
        key: 'townhall',
        depth: body.depth,
        body: (
          <>
            {body.body}
            <polygon
              points={`${block.x - block.w * 0.18},${stairsTop} ${block.x + block.w * 0.18},${stairsTop} ${block.x + block.w * 0.34},${stairsBottom} ${block.x - block.w * 0.34},${stairsBottom}`}
              fill="#dcc6a2"
            />
            <rect
              x={tx}
              y={towerTop}
              width={towerWidth}
              height={towerBase - towerTop}
              fill="#f2cdb3"
            />
            <path
              d={`M${tx - towerWidth * 0.1} ${towerTop}h${towerWidth * 1.2}l${-towerWidth * 0.2} ${-towerWidth * 0.5}h${-towerWidth * 0.8}Z`}
              fill="#5f6f6a"
            />
            <ellipse
              cx={block.x}
              cy={towerTop - towerWidth * 0.75}
              rx={towerWidth * 0.36}
              ry={towerWidth * 0.42}
              fill="#5f6f6a"
            />
            <path
              d={`M${block.x - towerWidth * 0.12} ${towerTop - towerWidth}L${block.x} ${towerTop - towerWidth * 2.2}L${block.x + towerWidth * 0.12} ${towerTop - towerWidth}Z`}
              fill="#4f5d58"
            />
          </>
        ),
        ink: (
          <>
            {body.ink}
            <g stroke={INK} strokeWidth={0.8} opacity={0.4}>
              {[0.3, 0.55, 0.8].map((step) => (
                <path
                  key={step}
                  d={`M${block.x - block.w * (0.18 + 0.16 * step)} ${stairsTop + (stairsBottom - stairsTop) * step}H${block.x + block.w * (0.18 + 0.16 * step)}`}
                />
              ))}
            </g>
            <circle
              cx={block.x}
              cy={clock}
              r={towerWidth * 0.26}
              fill="#fff4d8"
              stroke={INK}
              strokeWidth={0.8}
            />
            <path
              d={`M${block.x} ${clock}v${-towerWidth * 0.18}M${block.x} ${clock}h${towerWidth * 0.12}`}
              stroke={INK}
              strokeWidth={0.8}
            />
            <rect
              x={block.x - towerWidth * 0.14}
              y={clock + towerWidth * 0.5}
              width={towerWidth * 0.28}
              height={towerWidth * 0.5}
              rx={towerWidth * 0.14}
              fill={INK}
              opacity={0.55}
            />
            <path
              d={`M${block.x} ${towerTop - towerWidth * 2.2}v${-towerWidth * 0.5}`}
              stroke={INK}
              strokeWidth={1}
            />
          </>
        ),
      },
    ],
  }
}

function houseRow(
  layout: CityLayout,
  key: string,
  spots: readonly PlanPoint[],
  size: { w: number; d: number; h: number },
  offset: number,
) {
  return spots.map((spot, index) =>
    blockPiece(
      `${key}-${index}`,
      blockAt(layout, spot, size, {
        wall: HOUSE_COLORS[(index + offset) % HOUSE_COLORS.length],
        roof: '#c9a77c',
        kind: 'attic',
        windows: 2,
        floors: 2,
        arcade: true,
      }),
    ),
  )
}

function houses(layout: CityLayout): BuildingArt {
  const [mx] = SPOTS.market
  const edge = MARKET_HALF + 0.045
  const row = (v: number): PlanPoint[] =>
    Array.from({ length: 6 }, (_, index) => [mx - MARKET_HALF + 0.032 + index * 0.0652, v])
  const side = (u: number): PlanPoint[] => [
    [u, -0.13],
    [u, -0.07],
    [u, 0.07],
    [u, 0.13],
  ]
  const front = { w: 0.062, d: 0.07, h: 0.075 }
  const flank = { w: 0.07, d: 0.055, h: 0.07 }
  return {
    pieces: [
      ...houseRow(layout, 'north', row(-edge), front, 0),
      ...houseRow(layout, 'south', row(edge), front, 3),
      ...houseRow(layout, 'west', side(mx - edge), flank, 5),
      ...houseRow(layout, 'east', side(mx + edge), flank, 1),
    ],
  }
}

function collegiate(layout: CityLayout): BuildingArt {
  const [cx, cy] = SPOTS.collegiate
  const nave = blockAt(
    layout,
    [cx + 0.03, cy],
    { w: 0.2, d: 0.08, h: 0.09 },
    { wall: '#f4e8d0', roof: '#8d5a3e', kind: 'hip', windows: 4, floors: 1 },
  )
  const tower = blockAt(
    layout,
    [cx - 0.09, cy + 0.005],
    { w: 0.05, d: 0.06, h: 0.2 },
    { wall: '#f6ecd8', roof: '#5f6f6a', kind: 'flat', windows: 1, floors: 3 },
  )
  const towerPiece = blockPiece('collegiate-tower', tower)
  const domeBase = tower.y + tower.d / 2 - tower.h
  const dome = (
    <>
      <path
        d={`M${tower.x - tower.w * 0.5} ${domeBase}Q${tower.x} ${domeBase - tower.w * 1.25} ${tower.x + tower.w * 0.5} ${domeBase}Z`}
        fill="#5f7a6a"
      />
      <rect
        x={tower.x - tower.w * 0.08}
        y={domeBase - tower.w * 1.05}
        width={tower.w * 0.16}
        height={tower.w * 0.3}
        fill="#5f7a6a"
      />
    </>
  )
  return {
    pieces: [
      blockPiece('collegiate-nave', nave),
      {
        ...towerPiece,
        depth: towerPiece.depth + 0.5,
        body: (
          <>
            {towerPiece.body}
            {dome}
          </>
        ),
        ink: (
          <>
            {towerPiece.ink}
            <path
              d={`M${tower.x} ${domeBase - tower.w * 1.05}v${-tower.w * 0.45}M${tower.x - tower.w * 0.14} ${domeBase - tower.w * 1.3}h${tower.w * 0.28}`}
              stroke={INK}
              strokeWidth={1.1}
            />
          </>
        ),
      },
    ],
  }
}

function academy(layout: CityLayout): BuildingArt {
  const block = blockAt(
    layout,
    SPOTS.academy,
    { w: 0.28, d: 0.16, h: 0.1 },
    { wall: '#ead7b6', roof: '#a8543c', kind: 'flat', windows: 8, floors: 2 },
  )
  const piece = blockPiece('academy', block)
  const top = block.y + block.d / 2 - block.h
  const back = block.y - block.d / 2 - block.h
  const yard = { x: block.x - block.w * 0.3, y: back + (top - back) * 0.3 }
  return {
    pieces: [
      {
        ...piece,
        body: (
          <>
            {piece.body}
            <rect
              x={yard.x}
              y={yard.y}
              width={block.w * 0.6}
              height={(top - back) * 0.45}
              fill="#c8c08a"
            />
          </>
        ),
      },
    ],
  }
}

function lift(layout: CityLayout) {
  return layout.scale * 0.045
}

function fortress(layout: CityLayout): BuildingArt {
  const { walls, bastions } = layout
  const height = lift(layout)
  const glacis = walls.map(([x, y]): PlanPoint => [x * 1.16, y * 1.2])
  const pieces: Piece[] = []
  walls.forEach((start, index) => {
    const end = walls[(index + 1) % walls.length]
    const a = project(layout, start)
    const b = project(layout, end)
    const face = `M${a.x} ${a.y}L${b.x} ${b.y}L${b.x} ${b.y - height}L${a.x} ${a.y - height}Z`
    const crown = `M${a.x} ${a.y - height}L${b.x} ${b.y - height}`
    pieces.push({
      key: `wall-${index}`,
      depth: Math.max(a.y, b.y) - 2,
      body: (
        <>
          <path d={face} fill="#b8674b" />
          <path
            d={crown}
            stroke="#d99a6c"
            strokeWidth={layout.scale * 0.022}
            strokeLinecap="round"
          />
        </>
      ),
      ink: <path d={face} fill="none" stroke={INK} strokeWidth={0.9} opacity={0.4} />,
    })
  })
  bastions.forEach((shape, index) => {
    const projected = shape.map((point) => project(layout, point))
    const sides = projected.map((a, side) => {
      const b = projected[(side + 1) % projected.length]
      return `M${a.x} ${a.y}L${b.x} ${b.y}L${b.x} ${b.y - height}L${a.x} ${a.y - height}Z`
    })
    pieces.push({
      key: `bastion-${index}`,
      depth: Math.max(...projected.map((point) => point.y)),
      body: (
        <>
          {sides.map((side) => (
            <path key={side} d={side} fill="#a85c43" />
          ))}
          <path d={polygonPath(layout, shape, height)} fill="#9fb06f" />
        </>
      ),
      ink: (
        <path
          d={polygonPath(layout, shape, height)}
          fill="none"
          stroke={INK}
          strokeWidth={0.9}
          opacity={0.45}
        />
      ),
    })
  })
  return {
    ground: {
      body: (
        <>
          <path d={polygonPath(layout, glacis)} fill="#a9b978" />
          <path
            d={polygonPath(
              layout,
              walls.map(([x, y]): PlanPoint => [x * 1.07, y * 1.09]),
            )}
            fill="#7fa7b4"
          />
          <path d={polygonPath(layout, walls)} fill="#cdd29a" />
        </>
      ),
      ink: null,
    },
    pieces,
  }
}

const BUILDERS: Record<BuildingId, (layout: CityLayout) => BuildingArt> = {
  palace,
  grodzka,
  market,
  townhall,
  houses,
  collegiate,
  academy,
  fortress,
}

export function buildingArt(layout: CityLayout, id: BuildingId) {
  return BUILDERS[id](layout)
}

export function quarterPieces(layout: CityLayout) {
  return layout.quarters.map((spot, index) =>
    blockPiece(
      `quarter-${index}`,
      blockAt(
        layout,
        spot,
        { w: 0.11, d: 0.1, h: 0.05 },
        {
          wall: QUARTER_WALLS[index % QUARTER_WALLS.length],
          roof: QUARTER_ROOFS[(index * 3) % QUARTER_ROOFS.length],
          kind: 'hip',
          windows: 3,
          floors: 1,
        },
      ),
    ),
  )
}

export function quarterBlocks(layout: CityLayout) {
  return layout.quarters.map((spot) =>
    blockAt(layout, spot, { w: 0.11, d: 0.1, h: 0.05 }, { wall: '', roof: '', kind: 'hip' }),
  )
}

export function socketShape(layout: CityLayout, id: BuildingId) {
  const rect = (spot: PlanPoint, w: number, d: number): PlanPoint[] => [
    [spot[0] - w / 2, spot[1] - d / 2],
    [spot[0] + w / 2, spot[1] - d / 2],
    [spot[0] + w / 2, spot[1] + d / 2],
    [spot[0] - w / 2, spot[1] + d / 2],
  ]
  switch (id) {
    case 'palace':
      return { path: polygonPath(layout, rect(SPOTS.palace, 0.28, 0.26)), ring: false }
    case 'grodzka':
      return {
        path: polygonPath(
          layout,
          rect([(STREET.from + STREET.to) / 2, 0], STREET.to - STREET.from, 0.08),
        ),
        ring: false,
      }
    case 'market':
      return { path: polygonPath(layout, marketCorners()), ring: false }
    case 'townhall':
      return { path: polygonPath(layout, rect(SPOTS.townhall, 0.22, 0.1)), ring: false }
    case 'houses':
      return { path: polygonPath(layout, marketCorners(0.045)), ring: true }
    case 'collegiate':
      return { path: polygonPath(layout, rect(SPOTS.collegiate, 0.27, 0.12)), ring: false }
    case 'academy':
      return { path: polygonPath(layout, rect(SPOTS.academy, 0.3, 0.18)), ring: false }
    case 'fortress':
      return { path: polygonPath(layout, layout.walls), ring: true }
  }
}
