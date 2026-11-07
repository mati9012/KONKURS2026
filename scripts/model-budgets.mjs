import { execFileSync } from 'node:child_process'

export const BUDGETS = {
  landmark: { triangles: 30000, textureSize: 1024 },
  rock: { triangles: 3000, textureSize: 512 },
  underside: { triangles: 8000, textureSize: 1024 },
  tree: { triangles: 300, textureSize: 256 },
  house: { triangles: 1500, textureSize: 512 },
  prop: { triangles: 2500, textureSize: 512 },
}

export const KIND_BY_NAME = {
  'cliff-a': 'rock',
  'cliff-b': 'rock',
  'cliff-c': 'rock',
  'cliff-waterfall': 'rock',
  'island-underside': 'underside',
  pine: 'tree',
  oak: 'tree',
  birch: 'tree',
  'village-house': 'house',
  windmill: 'prop',
  horse: 'prop',
  deer: 'prop',
  eagle: 'prop',
  balloon: 'prop',
}

export const ISLAND_MODELS = [
  'cliff-a',
  'cliff-b',
  'cliff-c',
  'cliff-waterfall',
  'island-underside',
  'pine',
  'oak',
  'birch',
  'village-house',
  'windmill',
  'horse',
  'deer',
]

export function budgetFor(name) {
  return BUDGETS[KIND_BY_NAME[name] ?? 'landmark']
}

export function countTriangles(file) {
  const report = execFileSync(
    'pnpm',
    ['exec', 'gltf-transform', 'inspect', file, '--format', 'csv'],
    { encoding: 'utf8' },
  )
  return report
    .split('\n')
    .filter((line) => line.includes('TRIANGLES'))
    .reduce((total, line) => total + Number(line.split(',')[4]?.replace(/\D/g, '') || 0), 0)
}
