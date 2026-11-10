import { createRandom } from '@/lib/noise'

export type ObstacleKind = 'log' | 'fence' | 'hay'

export type Obstacle = { id: number; pos: number; kind: ObstacleKind }

export const OBSTACLE_HEIGHT: Record<ObstacleKind, number> = { log: 38, fence: 64, hay: 52 }

const KINDS: readonly ObstacleKind[] = ['log', 'fence', 'hay']
const GAPS = [
  [480, 760],
  [420, 680],
  [380, 600],
] as const

export function rideCourse(leg: number, distance: number): Obstacle[] {
  const random = createRandom(leg * 17 + 3)
  const [min, max] = GAPS[Math.min(leg, GAPS.length - 1)]
  const course: Obstacle[] = []
  for (let pos = 700; pos < distance - 250; pos += min + random() * (max - min)) {
    course.push({ id: course.length, pos, kind: KINDS[Math.floor(random() * KINDS.length)] })
  }
  return course
}
