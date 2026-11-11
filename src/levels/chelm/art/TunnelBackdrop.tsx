import { blobPath } from '@/components/watercolor/paint'
import { PAINT, PAINT_SOFT } from '@/components/watercolor/WatercolorDefs'
import type { SceneLayout } from '@/levels/chelm/scene-layout'
import { createRandom } from '@/lib/noise'

const INK = '#2a2620'

function archPath(cx: number, bottom: number, halfWidth: number, height: number) {
  const spring = bottom - height + halfWidth
  return `M${cx - halfWidth} ${bottom}V${spring}C${cx - halfWidth} ${spring - halfWidth * 1.3} ${cx + halfWidth} ${spring - halfWidth * 1.3} ${cx + halfWidth} ${spring}V${bottom}Z`
}

export function TunnelBackdrop({ layout, depth }: { layout: SceneLayout; depth: number }) {
  const { world, unit, portrait } = layout
  const { width, height } = world
  const random = createRandom(40 + depth * 7)
  const vanishX = width * (0.5 + (random() - 0.5) * 0.2)
  const floorY = height * 0.9
  const horizon = height * (portrait ? 0.5 : 0.56)
  const arches = Array.from({ length: 5 }, (_, index) => {
    const share = 1 - index / 5
    return {
      cx: width / 2 + (vanishX - width / 2) * (1 - share),
      bottom: horizon + (floorY - horizon) * share,
      halfWidth: (portrait ? 0.44 : 0.36) * width * share + 30 * unit,
      height: (portrait ? 0.62 : 0.74) * height * share + 60 * unit,
    }
  })
  const niches = [0.14, 0.86].map((share, index) => ({
    cx: width * share,
    bottom: floorY - (portrait ? 40 : 20) * unit,
    halfWidth: 70 * unit,
    height: (220 + index * 30) * unit,
  }))
  const chips = Array.from({ length: 70 }, (_, index) => ({
    key: index,
    x: random() * width,
    y: random() * floorY,
    rx: (10 + random() * 40) * unit,
    ry: (6 + random() * 20) * unit,
    tone: random() > 0.5 ? '#f6f3ea' : '#c8c2b0',
  }))
  const wall = ['#f2eee2', '#e8e2d2', '#ded6c2'][depth % 3]

  return (
    <g>
      <rect width={width} height={height} fill={wall} />
      <g filter={PAINT_SOFT} opacity={0.75}>
        {chips.map((chip) => (
          <path
            key={chip.key}
            d={blobPath(chip.x, chip.y, chip.rx, chip.ry, chip.key + depth * 100, 0.35, 8)}
            fill={chip.tone}
          />
        ))}
      </g>
      {arches.map((arch, index) => (
        <path
          key={index}
          d={archPath(arch.cx, arch.bottom, arch.halfWidth, arch.height)}
          fill={index === arches.length - 1 ? '#5a5242' : index % 2 === 0 ? '#ebe6d8' : '#ddd6c4'}
          stroke={INK}
          strokeOpacity={0.35}
          strokeWidth={3}
          filter={PAINT}
        />
      ))}
      {niches.map((niche, index) => (
        <path
          key={index}
          d={archPath(niche.cx, niche.bottom, niche.halfWidth, niche.height)}
          fill="#5a5040"
          stroke={INK}
          strokeOpacity={0.4}
          strokeWidth={3}
          filter={PAINT}
        />
      ))}
      <path
        d={`M0 ${height}L0 ${floorY}L${vanishX - 40 * unit} ${horizon}H${vanishX + 40 * unit}L${width} ${floorY}V${height}Z`}
        fill="#b6ad94"
        opacity={0.55}
        filter={PAINT_SOFT}
      />
      <path
        d={`M${width * 0.36} ${height}L${vanishX - 10 * unit} ${horizon}M${width * 0.64} ${height}L${vanishX + 10 * unit} ${horizon}`}
        stroke="#6a5a44"
        strokeWidth={5 * unit}
        opacity={0.6}
      />
      {Array.from({ length: 8 }, (_, index) => {
        const share = (index + 1) / 9
        const y = horizon + (height - horizon) * share * share
        const half = (width * 0.14 + 10 * unit) * share * share + 10 * unit
        return (
          <path
            key={index}
            d={`M${vanishX + (width / 2 - vanishX) * share * share - half} ${y}H${vanishX + (width / 2 - vanishX) * share * share + half}`}
            stroke="#7a6248"
            strokeWidth={(3 + share * 6) * unit}
            opacity={0.55}
          />
        )
      })}
    </g>
  )
}
