import type { World } from '@/components/watercolor/useWorld'
import type { BuildingId } from '@/content/zamosc'

export type Point = { x: number; y: number }

export type PlanPoint = readonly [number, number]

export type CityLayout = {
  world: World
  scale: number
  tilt: number
  upright: boolean
  center: Point
  walls: PlanPoint[]
  bastions: PlanPoint[][]
  quarters: PlanPoint[]
}

export const SPOTS: Record<BuildingId, PlanPoint> = {
  palace: [-0.76, 0],
  grodzka: [0.1, 0],
  market: [0.42, 0],
  townhall: [0.42, -0.13],
  houses: [0.42, 0],
  collegiate: [-0.24, 0.25],
  academy: [-0.24, -0.25],
  fortress: [0, 0],
}

export const MARKET_HALF = 0.19
export const STREET = { from: -0.62, to: 0.92, half: 0.035 }

const WALL_RADIUS: PlanPoint = [1.08, 0.64]
const WALL_CORNERS = 7
const HALF_WIDTH = 1.24
const HALF_DEPTH = 0.78
const SKYLINE = 0.34
const PANEL_SPACE = 0.24
const TRAY_SPACE = 0.18
const SIDE_SPACE = 0.03

function wallCorners(): PlanPoint[] {
  return Array.from({ length: WALL_CORNERS }, (_, index) => {
    const angle = Math.PI + (index / WALL_CORNERS) * Math.PI * 2
    const wobble = index % 2 === 0 ? 1 : 0.93
    return [Math.cos(angle) * WALL_RADIUS[0] * wobble, Math.sin(angle) * WALL_RADIUS[1] * wobble]
  })
}

function bastion([x, y]: PlanPoint): PlanPoint[] {
  const length = Math.hypot(x, y)
  const [dx, dy] = [x / length, y / length]
  const [tx, ty] = [-dy, dx]
  const at = (out: number, side: number): PlanPoint => [
    x + dx * out + tx * side,
    y + dy * out + ty * side,
  ]
  return [at(-0.05, -0.07), at(0.04, -0.12), at(0.15, 0), at(0.04, 0.12), at(-0.05, 0.07)]
}

export function insidePolygon(polygon: readonly PlanPoint[], [x, y]: PlanPoint) {
  let inside = false
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const [ax, ay] = polygon[index]
    const [bx, by] = polygon[previous]
    if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) inside = !inside
  }
  return inside
}

function reserved([x, y]: PlanPoint) {
  const nearMarket = Math.abs(x - SPOTS.market[0]) < MARKET_HALF + 0.12 && Math.abs(y) < 0.32
  const nearPalace = x < SPOTS.palace[0] + 0.24 && Math.abs(y) < 0.24
  const nearStreet = Math.abs(y) < 0.1
  const nearChurch = Math.abs(x - SPOTS.collegiate[0]) < 0.2 && Math.abs(y - 0.25) < 0.14
  const nearSchool = Math.abs(x - SPOTS.academy[0]) < 0.2 && Math.abs(y + 0.25) < 0.14
  return nearMarket || nearPalace || nearStreet || nearChurch || nearSchool
}

function quarterBlocks(walls: readonly PlanPoint[]) {
  const inner = walls.map(([x, y]): PlanPoint => [x * 0.84, y * 0.8])
  const blocks: PlanPoint[] = []
  for (let y = -0.48; y <= 0.49; y += 0.16) {
    for (let x = -0.84; x <= 0.96; x += 0.15) {
      const point: PlanPoint = [x, y]
      if (insidePolygon(inner, point) && !reserved(point)) blocks.push(point)
    }
  }
  return blocks
}

export function cityLayout(world: World): CityLayout {
  const { width, height } = world
  const upright = width < height * 0.9
  const tilt = upright ? 0.56 : 0.6
  const [halfWidth, halfDepth] = upright ? [HALF_DEPTH, HALF_WIDTH] : [HALF_WIDTH, HALF_DEPTH]
  const area = {
    left: width * SIDE_SPACE,
    right: width * (1 - SIDE_SPACE),
    top: height * PANEL_SPACE,
    bottom: height * (1 - TRAY_SPACE),
  }
  const planHeight = 2 * halfDepth * tilt + SKYLINE
  const scale = Math.min(
    (area.right - area.left) / (2 * halfWidth),
    (area.bottom - area.top) / planHeight,
  )
  const spare = area.bottom - area.top - planHeight * scale
  const walls = wallCorners()

  return {
    world,
    scale,
    tilt,
    upright,
    center: {
      x: width / 2,
      y: area.top + spare / 2 + (SKYLINE + halfDepth * tilt) * scale,
    },
    walls,
    bastions: walls.map(bastion),
    quarters: quarterBlocks(walls),
  }
}

export function project(layout: CityLayout, [x, y]: PlanPoint): Point {
  const [across, along] = layout.upright ? [y, -x] : [x, y]
  return {
    x: layout.center.x + across * layout.scale,
    y: layout.center.y + along * layout.scale * layout.tilt,
  }
}

export function unproject(layout: CityLayout, { x, y }: Point): PlanPoint {
  const across = (x - layout.center.x) / layout.scale
  const along = (y - layout.center.y) / (layout.scale * layout.tilt)
  return layout.upright ? [-along, across] : [across, along]
}

export function polygonPath(layout: CityLayout, points: readonly PlanPoint[], lift = 0) {
  return `${points
    .map((point, index) => {
      const { x, y } = project(layout, point)
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${(y - lift).toFixed(1)}`
    })
    .join('')}Z`
}
