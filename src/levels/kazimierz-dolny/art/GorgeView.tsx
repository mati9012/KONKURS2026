import { blobPath } from '@/components/watercolor/paint'
import { PAINT, PAINT_SOFT } from '@/components/watercolor/WatercolorDefs'
import type { SceneLayout } from '@/levels/kazimierz-dolny/scene-layout'
import { createRandom } from '@/lib/noise'

const INK = '#2a1e16'
const ROOTS = ['#5a3a22', '#6a4a2a', '#7a5a34', '#4a3020']

export type GorgeGeometry = {
  backTop: number
  backBottom: number
  backLeft: number
  backRight: number
  openings: { x: number; width: number; top: number }[]
}

export function gorgeGeometry(layout: SceneLayout, count: number): GorgeGeometry {
  const { world, unit, ground, portrait } = layout
  const backLeft = world.width * (portrait ? 0.08 : 0.2)
  const backRight = world.width * (portrait ? 0.92 : 0.8)
  const backBottom = ground - 40 * unit
  const backTop = backBottom - (portrait ? 420 : 300) * unit
  const span = backRight - backLeft
  const width = Math.min(span / count - 24 * unit, 170 * unit)
  return {
    backTop,
    backBottom,
    backLeft,
    backRight,
    openings: Array.from({ length: count }, (_, index) => ({
      x: backLeft + (span * (index + 0.5)) / count,
      width,
      top: backBottom - (portrait ? 220 : 180) * unit,
    })),
  }
}

function hangingRoots(
  seed: number,
  x0: number,
  x1: number,
  top: number,
  length: number,
  unit: number,
) {
  const random = createRandom(seed)
  const count = Math.round((x1 - x0) / (16 * unit))
  return Array.from({ length: count }, (_, index) => {
    const x = x0 + ((x1 - x0) * (index + random())) / count
    const reach = length * (0.35 + random() * 0.65)
    const sway = (random() - 0.5) * 40 * unit
    const width = (1.5 + random() * 4.5) * unit
    return {
      key: index,
      d: `M${x} ${top}C${x + sway} ${top + reach * 0.35} ${x - sway} ${top + reach * 0.7} ${x + sway * 0.5} ${top + reach}`,
      width,
      color: ROOTS[Math.floor(random() * ROOTS.length)],
    }
  })
}

export function GorgeView({ layout, geometry }: { layout: SceneLayout; geometry: GorgeGeometry }) {
  const { world, unit, ground } = layout
  const { width, height } = world
  const { backTop, backBottom, backLeft, backRight, openings } = geometry
  const wallTop = backTop - 120 * unit
  const leftWall = `M-20 ${height}L-20 -20L${backLeft - 60 * unit} -20L${backLeft} ${backTop}L${backLeft} ${backBottom}L${width * 0.12} ${height}Z`
  const rightWall = `M${width + 20} ${height}L${width + 20} -20L${backRight + 60 * unit} -20L${backRight} ${backTop}L${backRight} ${backBottom}L${width * 0.88} ${height}Z`
  const frontRoots = [
    ...hangingRoots(5, -20, backLeft, -10, ground * 0.75, unit),
    ...hangingRoots(9, backRight, width + 20, -10, ground * 0.75, unit),
  ]
  const backRoots = hangingRoots(
    13,
    backLeft,
    backRight,
    backTop,
    (backBottom - backTop) * 0.55,
    unit,
  )
  const crowns = createRandom(21)

  return (
    <g>
      <defs>
        <linearGradient id="kd-gorge-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8f0d8" />
          <stop offset="1" stopColor="#c8d8a0" />
        </linearGradient>
        <linearGradient id="kd-loess-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6cc8a" />
          <stop offset="1" stopColor="#c8a462" />
        </linearGradient>
        <linearGradient id="kd-loess-left" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a8844a" />
          <stop offset="1" stopColor="#d8b874" />
        </linearGradient>
        <linearGradient id="kd-loess-right" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#9a7840" />
          <stop offset="1" stopColor="#d0b06a" />
        </linearGradient>
        <linearGradient id="kd-opening" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2c1c" />
          <stop offset="1" stopColor="#6a5232" />
        </linearGradient>
        <radialGradient id="kd-light" cx="0.5" cy="0" r="0.8">
          <stop offset="0" stopColor="#fffbe0" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fffbe0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={width} height={height} fill="url(#kd-gorge-sky)" />
      <rect
        x={backLeft - 40 * unit}
        y={wallTop}
        width={backRight - backLeft + 80 * unit}
        height={backBottom - wallTop}
        fill="url(#kd-loess-back)"
        filter={PAINT}
      />
      {[0.25, 0.5, 0.75].map((share) => (
        <path
          key={share}
          d={`M${backLeft} ${wallTop + (backBottom - wallTop) * share}C${(backLeft + backRight) / 2} ${wallTop + (backBottom - wallTop) * share - 8 * unit} ${(backLeft + backRight) / 2} ${wallTop + (backBottom - wallTop) * share + 8 * unit} ${backRight} ${wallTop + (backBottom - wallTop) * share}`}
          stroke="#b8945a"
          strokeWidth={3 * unit}
          fill="none"
          opacity={0.6}
        />
      ))}
      {openings.map((opening, index) => (
        <g key={index}>
          <path
            d={`M${opening.x - opening.width / 2} ${backBottom}V${opening.top + opening.width * 0.4}C${opening.x - opening.width / 2} ${opening.top - opening.width * 0.1} ${opening.x + opening.width / 2} ${opening.top - opening.width * 0.1} ${opening.x + opening.width / 2} ${opening.top + opening.width * 0.4}V${backBottom}Z`}
            fill="url(#kd-opening)"
            stroke="#5a4028"
            strokeWidth={3}
          />
          <path
            d={`M${opening.x - opening.width * 0.18} ${backBottom}L${opening.x - opening.width * 0.08} ${opening.top + opening.width * 0.55}H${opening.x + opening.width * 0.08}L${opening.x + opening.width * 0.18} ${backBottom}Z`}
            fill="#8a6c42"
            opacity={0.7}
          />
        </g>
      ))}
      <g opacity={0.9}>
        {backRoots.map((root) => (
          <path
            key={root.key}
            d={root.d}
            stroke={root.color}
            strokeWidth={root.width * 0.7}
            fill="none"
            strokeLinecap="round"
          />
        ))}
      </g>
      <path d={leftWall} fill="url(#kd-loess-left)" filter={PAINT} />
      <path d={rightWall} fill="url(#kd-loess-right)" filter={PAINT} />
      {[0.18, 0.36, 0.55, 0.74].map((share) => (
        <g key={share} stroke="#8a6a3a" strokeWidth={3 * unit} fill="none" opacity={0.5}>
          <path
            d={`M-20 ${height * share}L${backLeft} ${backTop + (backBottom - backTop) * share}`}
          />
          <path
            d={`M${width + 20} ${height * share}L${backRight} ${backTop + (backBottom - backTop) * share}`}
          />
        </g>
      ))}
      <path
        d={`M${width * 0.12} ${height}L${backLeft} ${backBottom}H${backRight}L${width * 0.88} ${height}Z`}
        fill="#b89458"
        filter={PAINT}
      />
      {openings.map((opening, index) => (
        <path
          key={index}
          d={`M${width / 2 - 60 * unit} ${height}L${opening.x - opening.width * 0.18} ${backBottom}H${opening.x + opening.width * 0.18}L${width / 2 + 60 * unit} ${height}Z`}
          fill="#d0b07a"
          opacity={0.45}
        />
      ))}
      <g>
        {frontRoots.map((root, index) => (
          <path
            key={`front-${index}`}
            d={root.d}
            stroke={root.color}
            strokeWidth={root.width * 1.6}
            fill="none"
            strokeLinecap="round"
          />
        ))}
      </g>
      <g filter={PAINT_SOFT}>
        {Array.from({ length: 14 }, (_, index) => {
          const side = index % 2 === 0 ? -1 : 1
          const x = width / 2 + side * (width * (0.1 + crowns() * 0.45))
          const y = -20 * unit + crowns() * 90 * unit
          return (
            <path
              key={index}
              d={blobPath(
                x,
                y,
                (120 + crowns() * 90) * unit,
                (60 + crowns() * 40) * unit,
                index + 31,
                0.3,
              )}
              fill={['#4a6e3a', '#5a7e42', '#3e5e30', '#6a8a4a'][index % 4]}
            />
          )
        })}
      </g>
      <rect width={width} height={ground} fill="url(#kd-light)" />
      <path
        d={`M${width * 0.12} ${height}L${backLeft} ${backBottom}M${width * 0.88} ${height}L${backRight} ${backBottom}`}
        stroke={INK}
        strokeWidth={2}
        opacity={0.25}
      />
    </g>
  )
}
