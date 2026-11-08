import { execFileSync } from 'node:child_process'

const BLENDER = process.env.BLENDER ?? '/Applications/Blender.app/Contents/MacOS/Blender'
const RAW = 'assets-src/zamosc/zamosc-city-raw.glb'
const OUTPUT = 'public/models/zamosc-city.glb'

execFileSync(
  BLENDER,
  ['-b', '--factory-startup', '-P', 'scripts/blender/build-zamosc.py', '--', `out=${RAW}`],
  { stdio: 'inherit' },
)
execFileSync('pnpm', ['exec', 'gltf-transform', 'meshopt', RAW, OUTPUT, '--level', 'medium'], {
  stdio: 'inherit',
})
