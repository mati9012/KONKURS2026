import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { budgetFor, countTriangles, ISLAND_MODELS } from './model-budgets.mjs'

const SOURCE_DIR = 'assets-src/models'
const OUTPUT_DIR = 'assets-src/island/models'

function gltfTransform(...args) {
  execFileSync('pnpm', ['exec', 'gltf-transform', ...args], { stdio: 'ignore' })
}

mkdirSync(OUTPUT_DIR, { recursive: true })
for (const name of ISLAND_MODELS) {
  const input = join(SOURCE_DIR, `${name}.glb`)
  const simplified = join(OUTPUT_DIR, `${name}.simplified.glb`)
  const output = join(OUTPUT_DIR, `${name}.glb`)
  const budget = budgetFor(name)
  const ratio = Math.min(1, budget.triangles / Math.max(1, countTriangles(input)))
  gltfTransform('simplify', input, simplified, '--ratio', String(ratio), '--error', '0.01')
  gltfTransform(
    'resize',
    simplified,
    output,
    '--width',
    String(budget.textureSize),
    '--height',
    String(budget.textureSize),
  )
  rmSync(simplified)
  console.warn(`${name}: ratio ${ratio.toFixed(4)}`)
}
