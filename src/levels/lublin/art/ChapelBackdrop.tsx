import { blobPath } from '@/components/watercolor/paint'
import { PAINT, PAINT_SOFT } from '@/components/watercolor/WatercolorDefs'
import type { SceneLayout } from '@/levels/lublin/scene-layout'
import { createRandom } from '@/lib/noise'

const INK = '#2a1c14'

export function ChapelBackdrop({ layout, seed }: { layout: SceneLayout; seed: number }) {
  const { world, unit } = layout
  const { width, height } = world
  const random = createRandom(seed + 70)
  const stains = Array.from({ length: 40 }, (_, index) => ({
    key: index,
    x: random() * width,
    y: random() * height,
    rx: (30 + random() * 90) * unit,
    ry: (20 + random() * 50) * unit,
    tone: random() > 0.5 ? '#c9a070' : '#a87c52',
  }))
  const pillar = 46 * unit
  const ribs = [0.08, 0.3, 0.7, 0.92].map((share) => width * share)

  return (
    <g>
      <rect width={width} height={height} fill="#b98d5e" />
      <g filter={PAINT_SOFT} opacity={0.6}>
        {stains.map((stain) => (
          <path
            key={stain.key}
            d={blobPath(stain.x, stain.y, stain.rx, stain.ry, stain.key + seed * 50, 0.3, 9)}
            fill={stain.tone}
          />
        ))}
      </g>
      <g filter={PAINT} stroke={INK} strokeOpacity={0.55} fill="none">
        {ribs.map((x) => (
          <path
            key={x}
            d={`M${x} ${height}V${height * 0.35}Q${x} ${height * 0.05} ${width / 2} ${height * 0.02}`}
            strokeWidth={14 * unit}
            stroke="#8a6440"
          />
        ))}
        <path
          d={`M0 ${height * 0.2}Q${width / 2} ${-height * 0.1} ${width} ${height * 0.2}`}
          strokeWidth={16 * unit}
          stroke="#8a6440"
        />
      </g>
      <rect
        x={width / 2 - pillar / 2}
        y={height * 0.88}
        width={pillar}
        height={height * 0.12}
        fill="#8a6440"
        stroke={INK}
        strokeOpacity={0.5}
        strokeWidth={3}
      />
      <rect y={height * 0.9} width={width} height={height * 0.1} fill="#6e4e32" opacity={0.7} />
    </g>
  )
}
