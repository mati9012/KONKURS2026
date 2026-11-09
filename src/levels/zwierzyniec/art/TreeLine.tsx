import { useMemo } from 'react'
import { createRandom } from '@/lib/noise'
import { blobPath } from '@/levels/zwierzyniec/art/paint'

type Palette = {
  fir: readonly string[]
  beech: readonly string[]
  trunk: string
}

type TreeLineProps = {
  width: number
  baseY: number
  height: number
  seed: number
  palette: Palette
  density?: number
  bleed?: number
  filter?: string
  opacity?: number
}

type Tree = {
  kind: 'fir' | 'beech'
  x: number
  y: number
  size: number
  color: string
  light: string
  seed: number
}

function firPath(x: number, y: number, size: number, seed: number) {
  const random = createRandom(seed)
  const tiers = 4
  const tall = size * 2.6
  let path = ''
  for (let tier = 0; tier < tiers; tier++) {
    const top = y - tall + (tall * tier) / (tiers + 0.6)
    const bottom = top + tall / 2.2
    const half = size * (0.38 + tier * 0.17) * (0.9 + random() * 0.2)
    const sag = half * 0.18
    path += `M${x} ${top}L${x + half} ${bottom}Q${x} ${bottom - sag} ${x - half} ${bottom}Z`
  }
  return path
}

function buildTrees(
  width: number,
  baseY: number,
  height: number,
  seed: number,
  palette: Palette,
  density: number,
  bleed: number,
) {
  const random = createRandom(seed)
  const trees: Tree[] = []
  const spacing = (height * 0.42) / density
  for (let x = -bleed; x < width + bleed; x += spacing * (0.6 + random() * 0.8)) {
    const fir = random() < 0.55
    const size = height * (0.32 + random() * 0.22)
    const colors = fir ? palette.fir : palette.beech
    const index = Math.floor(random() * colors.length)
    trees.push({
      kind: fir ? 'fir' : 'beech',
      x,
      y: baseY + random() * height * 0.12,
      size,
      color: colors[index],
      light: colors[(index + 1) % colors.length],
      seed: Math.floor(random() * 100000),
    })
  }
  return trees.sort((a, b) => a.y - b.y)
}

export function TreeLine({
  width,
  baseY,
  height,
  seed,
  palette,
  density = 1,
  bleed = height,
  filter,
  opacity = 1,
}: TreeLineProps) {
  const trees = useMemo(
    () => buildTrees(width, baseY, height, seed, palette, density, bleed),
    [width, baseY, height, seed, palette, density, bleed],
  )

  return (
    <g filter={filter} opacity={opacity}>
      {trees.map((tree) =>
        tree.kind === 'fir' ? (
          <g key={`${tree.seed}-${tree.x}`}>
            <rect
              x={tree.x - tree.size * 0.05}
              y={tree.y - tree.size * 0.4}
              width={tree.size * 0.1}
              height={tree.size * 0.45}
              fill={palette.trunk}
            />
            <path
              d={firPath(tree.x, tree.y - tree.size * 0.2, tree.size, tree.seed)}
              fill={tree.color}
            />
          </g>
        ) : (
          <g key={`${tree.seed}-${tree.x}`}>
            <path
              d={`M${tree.x - tree.size * 0.06} ${tree.y}L${tree.x - tree.size * 0.03} ${tree.y - tree.size * 1.1}L${tree.x + tree.size * 0.03} ${tree.y - tree.size * 1.1}L${tree.x + tree.size * 0.07} ${tree.y}Z`}
              fill={palette.trunk}
            />
            <path
              d={blobPath(
                tree.x,
                tree.y - tree.size * 1.35,
                tree.size * 0.62,
                tree.size * 0.72,
                tree.seed,
                0.2,
                10,
              )}
              fill={tree.color}
            />
            <path
              d={blobPath(
                tree.x - tree.size * 0.16,
                tree.y - tree.size * 1.55,
                tree.size * 0.32,
                tree.size * 0.3,
                tree.seed + 1,
                0.2,
                8,
              )}
              fill={tree.light}
              opacity={0.7}
            />
          </g>
        ),
      )}
    </g>
  )
}
