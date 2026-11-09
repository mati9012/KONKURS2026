import type { World } from '@/levels/zwierzyniec/herd-layout'

export const PLANK_LENGTHS = ['short', 'medium', 'long'] as const

export type PlankLength = (typeof PLANK_LENGTHS)[number]

export const PLANK_SPAN: Record<PlankLength, number> = { short: 80, medium: 115, long: 155 }

export const PLANK_NAMES: Record<PlankLength, string> = {
  short: 'krótka',
  medium: 'średnia',
  long: 'długa',
}

export const GAP_NAMES: Record<PlankLength, string> = {
  short: 'wąska',
  medium: 'średnia',
  long: 'szeroka',
}

type Step = readonly [PlankLength, number]

const SECTION_STEPS: readonly (readonly Step[])[] = [
  [
    ['medium', -30],
    ['short', -10],
    ['long', -40],
  ],
  [
    ['short', 25],
    ['long', 50],
    ['medium', 20],
  ],
  [
    ['long', -55],
    ['medium', -10],
  ],
]

export const SECTION_SPARES: readonly (readonly PlankLength[])[] = [
  ['long'],
  ['short', 'medium'],
  ['short', 'long'],
]

export const SECTION_ROTTEN: readonly PlankLength[] = ['medium', 'long', 'medium']

export type Node = { x: number; y: number; land: boolean }

export type Gap = {
  id: string
  section: number
  index: number
  length: PlankLength
  from: number
  to: number
}

export type BridgeLayout = {
  world: World
  unit: number
  horizon: number
  nodes: Node[]
  gaps: Gap[]
  islands: { x: number; y: number; rx: number; ry: number }[]
  church: { x: number; y: number }
}

const LANDSCAPE_TURN = 68
const CHURCH_ISLAND = { rx: 200, ry: 62 }
const CHURCH_HEIGHT = 200
const SHORE_DEPTH = 50
const PANEL_SPACE = 0.26
const TRAY_SPACE = 0.13
const SIDE_SPACE = 0.05

function tracePath(turn: number) {
  const points: [number, number][] = [[0, 0]]
  let [x, y] = [0, 0]
  for (const steps of SECTION_STEPS) {
    for (const [length, degrees] of steps) {
      const angle = ((degrees + turn) * Math.PI) / 180
      x += Math.sin(angle) * PLANK_SPAN[length]
      y -= Math.cos(angle) * PLANK_SPAN[length]
      points.push([x, y])
    }
  }
  return points
}

function bounds(points: readonly [number, number][]) {
  const [lastX, lastY] = points[points.length - 1]
  const xs = [...points.map(([x]) => x), lastX - CHURCH_ISLAND.rx, lastX + CHURCH_ISLAND.rx]
  const ys = [...points.map(([, y]) => y), lastY - CHURCH_HEIGHT, points[0][1] + SHORE_DEPTH]
  return {
    left: Math.min(...xs),
    right: Math.max(...xs),
    top: Math.min(...ys),
    bottom: Math.max(...ys),
  }
}

export function bridgeLayout(world: World): BridgeLayout {
  const turn = world.width > world.height * 1.2 ? LANDSCAPE_TURN : 0
  const points = tracePath(turn)
  const box = bounds(points)
  const area = {
    left: world.width * SIDE_SPACE,
    right: world.width * (1 - SIDE_SPACE),
    top: world.height * PANEL_SPACE,
    bottom: world.height * (1 - TRAY_SPACE),
  }
  const unit = Math.min(
    (area.right - area.left) / (box.right - box.left),
    (area.bottom - area.top) / (box.bottom - box.top),
  )
  const originX = (area.left + area.right) / 2 - ((box.left + box.right) / 2) * unit
  const originY = (area.top + area.bottom) / 2 - ((box.top + box.bottom) / 2) * unit

  const nodes: Node[] = points.map(([x, y], position) => ({
    x: originX + x * unit,
    y: originY + y * unit,
    land: position === 0,
  }))

  const gaps: Gap[] = []
  let from = 0
  SECTION_STEPS.forEach((steps, sectionIndex) => {
    steps.forEach(([length], stepIndex) => {
      nodes[from + 1].land = stepIndex === steps.length - 1
      gaps.push({
        id: `gap-${sectionIndex}-${stepIndex}`,
        section: sectionIndex,
        index: stepIndex,
        length,
        from,
        to: from + 1,
      })
      from++
    })
  })

  const landings = nodes.filter((node) => node.land)
  const last = landings[landings.length - 1]
  const islands = [
    { x: landings[1].x, y: landings[1].y + 8 * unit, rx: 78 * unit, ry: 34 * unit },
    { x: landings[2].x + 10 * unit, y: landings[2].y + 8 * unit, rx: 84 * unit, ry: 36 * unit },
    {
      x: last.x + 20 * unit,
      y: last.y - 26 * unit,
      rx: CHURCH_ISLAND.rx * unit,
      ry: CHURCH_ISLAND.ry * unit,
    },
  ]

  return {
    world,
    unit,
    horizon: Math.max(world.height * 0.08, last.y - 110 * unit),
    nodes,
    gaps,
    islands,
    church: { x: last.x + 30 * unit, y: last.y - 36 * unit },
  }
}
