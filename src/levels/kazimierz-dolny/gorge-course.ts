import { createRandom } from '@/lib/noise'

export type GorgeObstacleKind = 'root' | 'branch'

export type GorgeObstacle = { id: number; pos: number; kind: GorgeObstacleKind }

export const ROOT_HEIGHT = 44

const GAPS = [
  [520, 780],
  [460, 700],
  [400, 620],
] as const

export function gorgeCourse(leg: number, distance: number): GorgeObstacle[] {
  const random = createRandom(leg * 41 + 11)
  const [min, max] = GAPS[Math.min(leg, GAPS.length - 1)]
  const course: GorgeObstacle[] = []
  for (let pos = 700; pos < distance - 250; pos += min + random() * (max - min)) {
    course.push({ id: course.length, pos, kind: random() < 0.5 ? 'root' : 'branch' })
  }
  return course
}
