import { createRandom, valueNoise } from '@/lib/noise'
import { insidePen } from '@/levels/zwierzyniec/herd-layout'
import type { HerdLayout, Rect } from '@/levels/zwierzyniec/herd-layout'

export type Mover = {
  x: number
  y: number
  vx: number
  vy: number
  facing: 1 | -1
  gait: number
}

export type Horse = Mover & {
  id: number
  penned: boolean
  scared: number
  calm: number
  seed: number
}

export type HerdState = {
  horses: Horse[]
  goat: Mover
  target: { x: number; y: number } | null
  keys: { x: number; y: number }
  time: number
}

export type HerdEvent = 'penned' | 'scared'

const GOAT_SPEED = 360
const FLEE_RADIUS = 230
const FLEE_PUSH = 950
const SCARE_RADIUS = 125
const SCARE_SPEED = 0.85
const SCARE_COOLDOWN = 3
const SEPARATION_RADIUS = 72
const HORSE_SPEED = 250
const PANIC_SPEED = 340
const PEN_SPEED = 45

export function spawnHorses(layout: HerdLayout, count: number, seed: number, firstId: number) {
  const random = createRandom(seed)
  const { spawn } = layout
  return Array.from({ length: count }, (_, index): Horse => {
    const lane = (index + 0.5) / count
    return {
      id: firstId + index,
      x: spawn.left + (spawn.right - spawn.left) * (lane * 0.8 + random() * 0.2),
      y: spawn.top + (spawn.bottom - spawn.top) * random(),
      vx: 0,
      vy: 0,
      facing: random() < 0.5 ? -1 : 1,
      gait: random() * 6,
      penned: false,
      scared: 0,
      calm: 0,
      seed: random() * 100,
    }
  })
}

function clampTo(mover: Mover, rect: Rect) {
  if (mover.x < rect.left) {
    mover.x = rect.left
    mover.vx = Math.abs(mover.vx) * 0.3
  }
  if (mover.x > rect.right) {
    mover.x = rect.right
    mover.vx = -Math.abs(mover.vx) * 0.3
  }
  if (mover.y < rect.top) {
    mover.y = rect.top
    mover.vy = Math.abs(mover.vy) * 0.3
  }
  if (mover.y > rect.bottom) {
    mover.y = rect.bottom
    mover.vy = -Math.abs(mover.vy) * 0.3
  }
}

function pushOutOfBushes(mover: Mover, layout: HerdLayout, padding: number) {
  for (const bush of layout.bushes) {
    const dx = mover.x - bush.x
    const dy = (mover.y - bush.y) * 1.6
    const distance = Math.hypot(dx, dy)
    const reach = bush.r + padding
    if (distance < reach && distance > 0.001) {
      mover.x = bush.x + (dx / distance) * reach
      mover.y = bush.y + (dy / distance / 1.6) * reach
    }
  }
}

function crossesGate(layout: HerdLayout, fromY: number, x: number) {
  const { pen } = layout
  const margin = 18 * layout.unit
  return fromY >= pen.bottom && x > pen.gateLeft + margin && x < pen.gateRight - margin
}

function keepOutsidePen(
  mover: Mover,
  layout: HerdLayout,
  previousX: number,
  previousY: number,
  throughGate: boolean,
) {
  const margin = 10 * layout.unit
  if (!insidePen(layout.pen, mover.x, mover.y, margin)) return
  if (throughGate && mover.y >= layout.pen.bottom && crossesGate(layout, previousY, mover.x)) return
  if (!insidePen(layout.pen, previousX, mover.y, margin)) {
    mover.x = previousX
    mover.vx *= -0.2
    return
  }
  if (!insidePen(layout.pen, mover.x, previousY, margin)) {
    mover.y = previousY
    mover.vy *= -0.2
    return
  }
  mover.x = previousX
  mover.y = previousY
}

function limitSpeed(mover: Mover, max: number) {
  const speed = Math.hypot(mover.vx, mover.vy)
  if (speed > max) {
    mover.vx = (mover.vx / speed) * max
    mover.vy = (mover.vy / speed) * max
  }
  return Math.min(speed, max)
}

function stepGoat(state: HerdState, layout: HerdLayout, dt: number) {
  const { goat, target, keys } = state
  const max = GOAT_SPEED * layout.unit
  let wantX = 0
  let wantY = 0
  if (keys.x !== 0 || keys.y !== 0) {
    const length = Math.hypot(keys.x, keys.y)
    wantX = (keys.x / length) * max
    wantY = (keys.y / length) * max
  } else if (target) {
    const dx = target.x - goat.x
    const dy = target.y - goat.y
    const distance = Math.hypot(dx, dy)
    if (distance > 4) {
      const speed = Math.min(max, distance * 4)
      wantX = (dx / distance) * speed
      wantY = (dy / distance) * speed
    }
  }
  const blend = Math.min(1, dt * 9)
  goat.vx += (wantX - goat.vx) * blend
  goat.vy += (wantY - goat.vy) * blend
  const previousX = goat.x
  const previousY = goat.y
  goat.x += goat.vx * dt
  goat.y += goat.vy * dt
  keepOutsidePen(goat, layout, previousX, previousY, false)
  pushOutOfBushes(goat, layout, 20 * layout.unit)
  clampTo(goat, layout.field)
  const speed = Math.hypot(goat.vx, goat.vy)
  if (Math.abs(goat.vx) > 12) goat.facing = goat.vx > 0 ? 1 : -1
  goat.gait += speed * dt * 0.07
}

const FUNNEL_DEPTH = 170
const FUNNEL_WIDTH = 150
const FUNNEL_PULL = 260

function gateFunnel(horse: Horse, layout: HerdLayout) {
  const { pen, unit } = layout
  const gateX = (pen.gateLeft + pen.gateRight) / 2
  const below = horse.y - pen.bottom
  if (below < 0 || below > FUNNEL_DEPTH * unit) return [0, 0] as const
  if (Math.abs(horse.x - gateX) > FUNNEL_WIDTH * unit) return [0, 0] as const
  const dx = gateX - horse.x
  const dy = pen.bottom - 30 * unit - horse.y
  const distance = Math.hypot(dx, dy) || 1
  const strength = FUNNEL_PULL * unit * (1 - below / (FUNNEL_DEPTH * unit))
  return [(dx / distance) * strength, (dy / distance) * strength] as const
}

function meadowTop(layout: HerdLayout) {
  return layout.pen.bottom - 50 * layout.unit
}

function separate(horse: Horse, horses: readonly Horse[], radius: number, push: number) {
  let ax = 0
  let ay = 0
  for (const other of horses) {
    if (other === horse || other.penned !== horse.penned) continue
    const dx = horse.x - other.x
    const dy = (horse.y - other.y) * 1.5
    const distance = Math.hypot(dx, dy)
    if (distance < radius && distance > 0.001) {
      const strength = push * (1 - distance / radius)
      ax += (dx / distance) * strength
      ay += (dy / distance) * strength
    }
  }
  return [ax, ay] as const
}

const PEN_COLUMNS = 3

function penSpot(layout: HerdLayout, horse: Horse) {
  const { pen, unit } = layout
  const inset = 50 * unit
  const column = horse.id % PEN_COLUMNS
  const row = Math.floor(horse.id / PEN_COLUMNS) % PEN_COLUMNS
  const jitter = (valueNoise(horse.seed, 1) - 0.5) * 30 * unit
  return {
    x:
      pen.left +
      inset +
      ((column + 0.5) / PEN_COLUMNS) * (pen.right - pen.left - inset * 2) +
      jitter,
    y: pen.top + inset * 0.5 + ((row + 0.5) / PEN_COLUMNS) * (pen.bottom - pen.top - inset),
  }
}

function stepPennedHorse(horse: Horse, state: HerdState, layout: HerdLayout, dt: number) {
  const { unit, pen } = layout
  const spot = penSpot(layout, horse)
  const dx = spot.x - horse.x
  const dy = spot.y - horse.y
  const distance = Math.hypot(dx, dy)
  const [sx, sy] = separate(horse, state.horses, SEPARATION_RADIUS * unit * 0.7, 300 * unit)
  const pull = distance > 6 * unit ? 160 * unit : 0
  horse.vx += ((distance > 0.001 ? (dx / distance) * pull : 0) + sx) * dt
  horse.vy += ((distance > 0.001 ? (dy / distance) * pull : 0) + sy) * dt
  const drag = Math.exp(-3 * dt)
  horse.vx *= drag
  horse.vy *= drag
  limitSpeed(horse, PEN_SPEED * unit * (distance > 40 * unit ? 2 : 1))
  horse.x += horse.vx * dt
  horse.y += horse.vy * dt
  const inset = 34 * unit
  clampTo(horse, {
    left: pen.left + inset,
    right: pen.right - inset,
    top: pen.top + inset * 0.6,
    bottom: pen.bottom - inset * 0.6,
  })
}

function stepFreeHorse(
  horse: Horse,
  state: HerdState,
  layout: HerdLayout,
  dt: number,
  events: HerdEvent[],
) {
  const { unit } = layout
  const { goat } = state
  horse.scared = Math.max(0, horse.scared - dt)
  horse.calm = Math.max(0, horse.calm - dt)
  let ax = 0
  let ay = 0

  const dx = horse.x - goat.x
  const dy = horse.y - goat.y
  const distance = Math.hypot(dx, dy * 1.3)
  const flee = FLEE_RADIUS * unit
  if (distance < flee && distance > 0.001) {
    const strength = FLEE_PUSH * unit * (1 - distance / flee) ** 0.7
    ax += (dx / distance) * strength
    ay += (dy / distance) * strength
  }

  const goatSpeed = Math.hypot(goat.vx, goat.vy)
  const approach =
    distance > 0.001 ? (goat.vx * dx + goat.vy * dy) / (goatSpeed * distance || 1) : 0
  if (
    horse.calm === 0 &&
    distance < SCARE_RADIUS * unit &&
    goatSpeed > GOAT_SPEED * unit * SCARE_SPEED &&
    approach > 0.8
  ) {
    const side = valueNoise(state.time * 3, horse.seed) > 0.5 ? 1 : -1
    horse.vx += (-dy / distance) * side * 420 * unit
    horse.vy += (dx / distance) * side * 420 * unit
    horse.scared = 1.2
    horse.calm = SCARE_COOLDOWN
    events.push('scared')
  }

  const [sx, sy] = separate(horse, state.horses, SEPARATION_RADIUS * unit, 700 * unit)
  ax += sx
  ay += sy

  const free = state.horses.filter((other) => !other.penned)
  const centerX = free.reduce((sum, other) => sum + other.x, 0) / free.length
  const centerY = free.reduce((sum, other) => sum + other.y, 0) / free.length
  const toCenter = Math.hypot(centerX - horse.x, centerY - horse.y)
  if (toCenter > 150 * unit) {
    ax += ((centerX - horse.x) / toCenter) * 70 * unit
    ay += ((centerY - horse.y) / toCenter) * 70 * unit
  }

  const angle = valueNoise(state.time * 0.3 + horse.seed, horse.seed * 2) * Math.PI * 4
  ax += Math.cos(angle) * 45 * unit
  ay += Math.sin(angle) * 30 * unit

  const edge = 60 * unit
  const { field } = layout
  if (horse.x < field.left + edge) ax += 300 * unit
  if (horse.x > field.right - edge) ax -= 300 * unit
  if (horse.y > field.bottom - edge) ay -= 300 * unit
  const [fx, fy] = gateFunnel(horse, layout)
  ax += fx
  ay += fy

  const nearGate = horse.x > layout.pen.gateLeft && horse.x < layout.pen.gateRight
  if (!nearGate && horse.y < meadowTop(layout) + edge) ay += 300 * unit

  horse.vx += ax * dt
  horse.vy += ay * dt
  const drag = Math.exp(-2 * dt)
  horse.vx *= drag
  horse.vy *= drag
  limitSpeed(horse, (horse.scared > 0 ? PANIC_SPEED : HORSE_SPEED) * unit)

  const previousX = horse.x
  const previousY = horse.y
  horse.x += horse.vx * dt
  horse.y += horse.vy * dt
  if (insidePen(layout.pen, horse.x, horse.y) && crossesGate(layout, previousY, previousX)) {
    horse.penned = true
    horse.scared = 0
    horse.vy = -Math.abs(horse.vy) - 30 * unit
    events.push('penned')
    return
  }
  keepOutsidePen(horse, layout, previousX, previousY, true)
  pushOutOfBushes(horse, layout, 24 * unit)
  clampTo(horse, { ...layout.field, top: meadowTop(layout) })
}

export function scatterFrom(state: HerdState, layout: HerdLayout, x: number, y: number) {
  const { unit } = layout
  for (const horse of state.horses) {
    if (horse.penned) continue
    const dx = horse.x - x
    const dy = horse.y - y
    const distance = Math.hypot(dx, dy)
    if (distance > 380 * unit || distance < 0.001) continue
    horse.vx += (dx / distance) * 380 * unit
    horse.vy += (dy / distance) * 300 * unit
    horse.scared = 1.4
  }
}

export function stepHerd(state: HerdState, layout: HerdLayout, dt: number, events: HerdEvent[]) {
  state.time += dt
  stepGoat(state, layout, dt)
  for (const horse of state.horses) {
    if (horse.penned) stepPennedHorse(horse, state, layout, dt)
    else stepFreeHorse(horse, state, layout, dt, events)
    const speed = Math.hypot(horse.vx, horse.vy)
    if (Math.abs(horse.vx) > 10) horse.facing = horse.vx > 0 ? 1 : -1
    horse.gait += speed * dt * 0.06
  }
}
