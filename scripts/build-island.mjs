import { execFileSync } from 'node:child_process'
import { existsSync, rmSync, statSync } from 'node:fs'
import { join } from 'node:path'

const BLENDER = process.env.BLENDER ?? '/Applications/Blender.app/Contents/MacOS/Blender'
const WORK_DIR = 'assets-src/island'
const OUTPUT_DIR = 'public/models'
const VARIANTS = [
  { name: 'island', detail: 'high', texture: 4096 },
  { name: 'island-low', detail: 'low', texture: 2048 },
]

function run(command, args) {
  execFileSync(command, args, { stdio: 'inherit' })
}

function gltfTransform(...args) {
  run('pnpm', ['exec', 'gltf-transform', ...args])
}

run('pnpm', ['exec', 'tsx', 'scripts/export-island-base.ts'])
if (!existsSync(join(WORK_DIR, 'models'))) run('node', ['scripts/prepare-island-assets.mjs'])

for (const variant of VARIANTS) {
  const raw = join(WORK_DIR, `${variant.name}-raw.glb`)
  const instanced = join(WORK_DIR, `${variant.name}-instanced.glb`)
  const textured = join(WORK_DIR, `${variant.name}-webp.glb`)
  const output = join(OUTPUT_DIR, `${variant.name}.glb`)
  run(BLENDER, [
    '-b',
    '--factory-startup',
    '-P',
    'scripts/blender/build-island.py',
    '--',
    `detail=${variant.detail}`,
    `texture=${variant.texture}`,
    `out=${raw}`,
  ])
  gltfTransform('instance', raw, instanced)
  gltfTransform('webp', instanced, textured, '--quality', '82')
  gltfTransform('meshopt', textured, output, '--level', 'medium')
  for (const file of [instanced, textured]) rmSync(file)
  console.warn(`${output}: ${(statSync(output).size / 1e6).toFixed(2)} MB`)
}
