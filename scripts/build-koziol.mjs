import { execFileSync } from 'node:child_process'
import { rmSync } from 'node:fs'

const BLENDER = process.env.BLENDER ?? '/Applications/Blender.app/Contents/MacOS/Blender'
const RAW = 'assets-src/koziol/koziol-raw.glb'
const RESIZED = 'assets-src/koziol/koziol-resized.glb'
const TEXTURED = 'assets-src/koziol/koziol-webp.glb'
const OUTPUT = 'public/models/koziol.glb'

function gltfTransform(...args) {
  execFileSync('pnpm', ['exec', 'gltf-transform', ...args], { stdio: 'inherit' })
}

execFileSync(
  BLENDER,
  ['-b', '--factory-startup', '-P', 'scripts/blender/rig-koziol.py', '--', `out=${RAW}`],
  { stdio: 'inherit' },
)
gltfTransform('resize', RAW, RESIZED, '--width', '1024', '--height', '1024')
gltfTransform('webp', RESIZED, TEXTURED, '--quality', '85')
gltfTransform('meshopt', TEXTURED, OUTPUT, '--level', 'medium')
for (const file of [RESIZED, TEXTURED]) rmSync(file)
