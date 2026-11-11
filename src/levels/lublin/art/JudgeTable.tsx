import { PAINT } from '@/components/watercolor/WatercolorDefs'
import type { SceneLayout } from '@/levels/lublin/scene-layout'

const INK = '#2a1c14'

export function tableGeometry({ world, unit, portrait }: SceneLayout) {
  const left = world.width * (portrait ? 0.06 : 0.2)
  return {
    top: world.height * (portrait ? 0.58 : 0.6),
    left,
    width: world.width - left * 2,
    height: 90 * unit,
  }
}

export function JudgeTable({ layout }: { layout: SceneLayout }) {
  const { world, unit } = layout
  const { top, left, width, height } = tableGeometry(layout)
  return (
    <g filter={PAINT}>
      <rect
        x={left}
        y={top}
        width={width}
        height={height}
        fill="#7a4a2a"
        stroke={INK}
        strokeWidth={4}
      />
      <rect
        x={left - 14 * unit}
        y={top - 12 * unit}
        width={width + 28 * unit}
        height={16 * unit}
        fill="#9a6238"
        stroke={INK}
        strokeWidth={4}
      />
      <rect
        x={left + 20 * unit}
        y={top + height}
        width={width - 40 * unit}
        height={world.height * 0.12}
        fill="#5a3420"
        stroke={INK}
        strokeWidth={4}
      />
    </g>
  )
}
