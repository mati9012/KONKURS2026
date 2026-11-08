import { execFileSync } from 'node:child_process'
import { rmSync } from 'node:fs'

const BLENDER = process.env.BLENDER ?? '/Applications/Blender.app/Contents/MacOS/Blender'
const SOURCE = 'assets-src/zamosc'

function blender(script, ...args) {
  execFileSync(BLENDER, ['-b', '--factory-startup', '-P', script, '--', ...args], {
    stdio: 'inherit',
  })
}

function gltfTransform(...args) {
  execFileSync('pnpm', ['exec', 'gltf-transform', ...args], { stdio: 'inherit' })
}

function publish(raw, output) {
  const deduped = raw.replace('-raw.glb', '-dedup.glb')
  const textured = raw.replace('-raw.glb', '-webp.glb')
  gltfTransform('dedup', raw, deduped)
  gltfTransform('webp', deduped, textured, '--quality', '85')
  gltfTransform('meshopt', textured, output, '--level', 'medium')
  for (const file of [deduped, textured]) rmSync(file)
}

blender('scripts/blender/build-zamosc.py', `out=${SOURCE}/zamosc-city-raw.glb`)
publish(`${SOURCE}/zamosc-city-raw.glb`, 'public/models/zamosc-city.glb')

blender(
  'scripts/blender/prepare-devil.py',
  `source=${SOURCE}/models/zamosc-devil.glb`,
  `out=${SOURCE}/zamosc-devil-raw.glb`,
)
publish(`${SOURCE}/zamosc-devil-raw.glb`, 'public/models/devil.glb')
