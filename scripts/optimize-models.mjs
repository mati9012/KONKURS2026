import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import { basename, join } from 'node:path'
import { budgetFor, countTriangles, ISLAND_MODELS } from './model-budgets.mjs'

const SOURCE_DIR = 'assets-src/models'
const OUTPUT_DIR = 'public/models'

mkdirSync(OUTPUT_DIR, { recursive: true })
const only = process.argv.slice(2)
const files = readdirSync(SOURCE_DIR).filter(
  (file) => file.endsWith('.glb') && !ISLAND_MODELS.includes(basename(file, '.glb')),
)

for (const file of files) {
  const name = basename(file, '.glb')
  if (only.length > 0 && !only.includes(name)) continue
  const input = join(SOURCE_DIR, file)
  const output = join(OUTPUT_DIR, file)
  if (only.length === 0 && existsSync(output)) continue
  const budget = budgetFor(name)
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
