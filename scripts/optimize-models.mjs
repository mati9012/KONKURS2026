import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import { basename, join } from 'node:path'

const SOURCE_DIR = 'assets-src/models'
const OUTPUT_DIR = 'public/models'

const BUDGETS = {
  landmark: { triangles: 30000, textureSize: 1024 },
  rock: { triangles: 3000, textureSize: 512 },
  underside: { triangles: 8000, textureSize: 1024 },
  tree: { triangles: 300, textureSize: 256 },
  house: { triangles: 1500, textureSize: 512 },
  prop: { triangles: 2500, textureSize: 512 },
}

const KIND_BY_NAME = {
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

function countTriangles(file) {
  const report = execFileSync(
    'pnpm',
    ['exec', 'gltf-transform', 'inspect', file, '--format', 'csv'],
    {
      encoding: 'utf8',
    },
  )
  const meshSection = report.split('\n').filter((line) => line.includes('TRIANGLES'))
  return meshSection.reduce(
    (total, line) => total + Number(line.split(',')[4]?.replace(/\D/g, '') || 0),
    0,
  )
}

mkdirSync(OUTPUT_DIR, { recursive: true })
const only = process.argv.slice(2)
const files = readdirSync(SOURCE_DIR).filter((file) => file.endsWith('.glb'))

for (const file of files) {
  const name = basename(file, '.glb')
  if (only.length > 0 && !only.includes(name)) continue
  const input = join(SOURCE_DIR, file)
  const output = join(OUTPUT_DIR, file)
  if (only.length === 0 && existsSync(output)) continue
  const budget = BUDGETS[KIND_BY_NAME[name] ?? 'landmark']
  const triangles = countTriangles(input)
  const ratio = Math.min(1, budget.triangles / Math.max(1, triangles))
  execFileSync(
    'pnpm',
    [
      'exec',
      'gltf-transform',
      'optimize',
      input,
      output,
      '--compress',
      'meshopt',
      '--texture-compress',
      'webp',
      '--texture-size',
      String(budget.textureSize),
      '--simplify-ratio',
      String(ratio),
      '--simplify-error',
      '0.01',
    ],
    { stdio: 'inherit' },
  )
  console.warn(`${name}: ${triangles} → ~${Math.round(triangles * ratio)} triangles`)
}
