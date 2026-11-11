import { PAINT, PAINT_SOFT } from '@/components/watercolor/WatercolorDefs'
import type { SceneLayout } from '@/levels/lublin/scene-layout'

const INK = '#2a1c14'

export function CourtroomBackdrop({ layout }: { layout: SceneLayout }) {
  const { world, unit, portrait } = layout
  const { width, height } = world
  const windows = (portrait ? [0.2, 0.8] : [0.12, 0.3, 0.7, 0.88]).map((share) => width * share)
  const windowWidth = 110 * unit
  const windowTop = height * 0.2
  const windowBottom = height * 0.56

  return (
    <g>
      <rect width={width} height={height} fill="#3a2c3a" />
      <rect
        y={height * 0.1}
        width={width}
        height={height * 0.6}
        fill="#5a3e4a"
        filter={PAINT_SOFT}
      />
      <g filter={PAINT}>
        {windows.map((x) => (
          <g key={x}>
            <path
              d={`M${x - windowWidth / 2} ${windowBottom}V${windowTop + windowWidth / 2}A${windowWidth / 2} ${windowWidth / 2} 0 0 1 ${x + windowWidth / 2} ${windowTop + windowWidth / 2}V${windowBottom}Z`}
              fill="#26304e"
              stroke={INK}
              strokeWidth={4}
            />
            <path
              d={`M${x} ${windowTop}V${windowBottom}M${x - windowWidth / 2} ${(windowTop + windowBottom) / 2}H${x + windowWidth / 2}`}
              stroke="#8a7a5a"
              strokeWidth={4}
            />
            <circle
              cx={x + windowWidth * 0.2}
              cy={windowTop + windowWidth * 0.5}
              r={10 * unit}
              fill="#f4ecc8"
            />
          </g>
        ))}
        {[0.04, 0.96, 0.4, 0.6].map((share) => (
          <rect
            key={share}
            x={width * share - 16 * unit}
            y={height * 0.12}
            width={32 * unit}
            height={height * 0.6}
            fill="#7a5a5e"
            stroke={INK}
            strokeOpacity={0.5}
            strokeWidth={3}
          />
        ))}
        <path
          d={`M${width * 0.36} ${height * 0.2}L${width / 2} ${height * 0.12}L${width * 0.64} ${height * 0.2}Z`}
          fill="#8a6a5a"
          stroke={INK}
          strokeWidth={3}
        />
      </g>
      <rect y={height * 0.7} width={width} height={height * 0.3} fill="#4a3226" />
      {Array.from({ length: 12 }, (_, index) => (
        <path
          key={index}
          d={`M${(index / 12) * width} ${height * 0.7}L${(index / 12) * width - width * 0.08} ${height}`}
          stroke="#3a2418"
          strokeWidth={3}
          opacity={0.6}
        />
      ))}
    </g>
  )
}
