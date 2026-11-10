import { createRandom } from '@/lib/noise'

export const LANES = 3

export type RiverObstacleKind = 'log' | 'shoal' | 'snag'

export type RiverObstacle = { id: number; pos: number; lane: number; kind: RiverObstacleKind }

const KINDS: readonly RiverObstacleKind[] = ['log', 'shoal', 'snag']
const GAPS = [
  [420, 620],
  [360, 540],
  [320, 480],
] as const
const PAIR_CHANCE = [0, 0.35, 0.55]

export function riverCourse(leg: number, distance: number): RiverObstacle[] {
  const random = createRandom(leg * 31 + 7)
  const [min, max] = GAPS[Math.min(leg, GAPS.length - 1)]
  const pairChance = PAIR_CHANCE[Math.min(leg, PAIR_CHANCE.length - 1)]
  const course: RiverObstacle[] = []
  const add = (pos: number, lane: number) =>
    course.push({ id: course.length, pos, lane, kind: KINDS[Math.floor(random() * KINDS.length)] })
  for (let pos = 600; pos < distance - 300; pos += min + random() * (max - min)) {
    const lane = Math.floor(random() * LANES)
    add(pos, lane)
    if (random() < pairChance) add(pos, (lane + 1 + Math.floor(random() * (LANES - 1))) % LANES)
  }
  return course
}
