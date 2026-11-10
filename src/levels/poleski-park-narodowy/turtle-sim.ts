import { PREDATOR_IDS } from '@/content/poleski-park-narodowy'
import type { PredatorId } from '@/content/poleski-park-narodowy'
import type { Spot } from '@/levels/poleski-park-narodowy/scene-layout'
import type { TurtlePath } from '@/levels/poleski-park-narodowy/turtle-path'

const WALK_MS = 9000
const HATCH_EVERY_MS = 1700
const HIDE_MS = 1600
const SETBACK = 0.3
const FLEE_MS = 700
const MAX_HUNTERS = 2

export type Hatchling = { id: number; progress: number; hiding: number }

export type Predator = Spot & {
  id: number
  kind: PredatorId
  fleeing: number
  facing: 1 | -1
  vx: number
  vy: number
}

export type TurtleSim = {
  time: number
  spawned: number
  saved: number
  nextHatch: number
  nextPredator: number
  nextId: number
  hatchlings: Hatchling[]
  predators: Predator[]
}

export type TurtleWave = { hatchlings: number; predatorEveryMs: number; speed: number }

export type StepResult = { sim: TurtleSim; caught: boolean }

export function startSim(): TurtleSim {
  return {
    time: 0,
    spawned: 0,
    saved: 0,
    nextHatch: 400,
    nextPredator: 1800,
    nextId: 0,
    hatchlings: [],
    predators: [],
  }
}

function nearest(point: Spot, hatchlings: Hatchling[], path: TurtlePath) {
  let best: { hatchling: Hatchling; spot: Spot; distance: number } | null = null
  for (const hatchling of hatchlings) {
    if (hatchling.hiding > 0) continue
    const spot = path.at(hatchling.progress)
    const distance = Math.hypot(spot.x - point.x, spot.y - point.y)
    if (!best || distance < best.distance) best = { hatchling, spot, distance }
  }
  return best
}

function spawnPredator(sim: TurtleSim, path: TurtlePath, random: () => number): Predator {
  const bush = path.bushes[Math.floor(random() * path.bushes.length)]
  const kind = PREDATOR_IDS[Math.floor(random() * PREDATOR_IDS.length)]
  return { ...bush, id: sim.nextId, kind, fleeing: 0, facing: 1, vx: 0, vy: 0 }
}

export function scare(sim: TurtleSim, id: number, unit: number): TurtleSim {
  return {
    ...sim,
    predators: sim.predators.map((predator) => {
      if (predator.id !== id || predator.fleeing > 0) return predator
      const away = predator.facing === 1 ? -1 : 1
      return { ...predator, fleeing: FLEE_MS, facing: away, vx: away * 900 * unit, vy: 260 * unit }
    }),
  }
}

export function stepSim(
  sim: TurtleSim,
  dt: number,
  wave: TurtleWave,
  path: TurtlePath,
  unit: number,
  random: () => number,
): StepResult {
  const time = sim.time + dt
  let { spawned, saved, nextHatch, nextPredator, nextId } = sim
  let caught = false
  let hatchlings = sim.hatchlings.map((hatchling) =>
    hatchling.hiding > 0
      ? { ...hatchling, hiding: Math.max(0, hatchling.hiding - dt) }
      : { ...hatchling, progress: hatchling.progress + dt / WALK_MS },
  )
  saved += hatchlings.filter((hatchling) => hatchling.progress >= 1).length
  hatchlings = hatchlings.filter((hatchling) => hatchling.progress < 1)
  if (spawned < wave.hatchlings && time >= nextHatch) {
    hatchlings = [...hatchlings, { id: nextId, progress: 0, hiding: 0 }]
    spawned += 1
    nextId += 1
    nextHatch = time + HATCH_EVERY_MS
  }

  let predators: Predator[] = []
  for (const predator of sim.predators) {
    if (predator.fleeing > 0) {
      const fleeing = predator.fleeing - dt
      if (fleeing <= 0) continue
      predators.push({
        ...predator,
        fleeing,
        x: predator.x + (predator.vx * dt) / 1000,
        y: predator.y + (predator.vy * dt) / 1000,
      })
      continue
    }
    const prey = nearest(predator, hatchlings, path)
    if (!prey) {
      predators.push(predator)
      continue
    }
    if (prey.distance < 34 * unit) {
      caught = true
      hatchlings = hatchlings.map((hatchling) =>
        hatchling.id === prey.hatchling.id
          ? {
              ...hatchling,
              hiding: HIDE_MS,
              progress: Math.max(0, hatchling.progress - SETBACK),
            }
          : hatchling,
      )
      const away = predator.facing === 1 ? -1 : 1
      predators.push({
        ...predator,
        fleeing: FLEE_MS * 1.6,
        facing: away,
        vx: away * 420 * unit,
        vy: 120 * unit,
      })
      continue
    }
    const step = (wave.speed * unit * dt) / 1000
    const dx = prey.spot.x - predator.x
    const dy = prey.spot.y - predator.y
    predators.push({
      ...predator,
      x: predator.x + (dx / prey.distance) * step,
      y: predator.y + (dy / prey.distance) * step,
      facing: dx >= 0 ? 1 : -1,
    })
  }

  const hunters = predators.filter((predator) => predator.fleeing === 0).length
  if (time >= nextPredator && hunters < MAX_HUNTERS && hatchlings.length > 0) {
    predators = [...predators, spawnPredator({ ...sim, nextId }, path, random)]
    nextId += 1
    nextPredator = time + wave.predatorEveryMs
  }

  return {
    sim: { time, spawned, saved, nextHatch, nextPredator, nextId, hatchlings, predators },
    caught,
  }
}
