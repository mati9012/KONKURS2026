import { useMemo } from 'react'
import { createRandom } from '@/lib/noise'
import { PAINT, PAINT_WASH } from '@/components/watercolor/WatercolorDefs'
import type { RoomLayout } from '@/levels/bilgoraj/room-layout'

const LOGS = ['#8a5e3a', '#93653f', '#7f5634', '#996b43']

export function LogWall({ layout, warm }: { layout: RoomLayout; warm: number }) {
  const { world, unit, floor } = layout
  const { width, height } = world
  const logs = useMemo(() => {
    const random = createRandom(7)
    const size = 46 * unit
    const rows = []
    for (let y = -size / 2; y < floor; y += size) {
      rows.push({ y, size, color: LOGS[Math.floor(random() * LOGS.length)], knot: random() })
    }
    return rows
  }, [floor, unit])

  return (
    <g>
      <rect width={width} height={height} fill="#6b4a30" />
      <g filter={PAINT}>
        {logs.map((log) => (
          <g key={log.y}>
            <rect
              x={-20}
              y={log.y}
              width={width + 40}
              height={log.size * 0.94}
              rx={log.size * 0.45}
              fill={log.color}
            />
            <path
              d={`M-20 ${log.y + log.size * 0.25}H${width + 20}`}
              stroke="#b08058"
              strokeWidth={3 * unit}
              opacity={0.5}
            />
            <ellipse
              cx={width * (0.1 + log.knot * 0.8)}
              cy={log.y + log.size * 0.5}
              rx={7 * unit}
              ry={4 * unit}
              fill="#5e3e24"
            />
          </g>
        ))}
      </g>
      <rect y={floor} width={width} height={height - floor} fill="#a77a4c" filter={PAINT} />
      {[0, 1, 2, 3, 4, 5, 6].map((index) => (
        <path
          key={index}
          d={`M0 ${floor + (index + 1) * 26 * unit}H${width}`}
          stroke="#8a6038"
          strokeWidth={2 * unit}
          opacity={0.6}
        />
      ))}
      <rect y={floor - 6 * unit} width={width} height={12 * unit} fill="#5e3e24" />
      <rect width={width} height={height} fill="#fff" filter={PAINT_WASH} opacity={0.18} />
      <rect
        width={width}
        height={height}
        fill="#ffb060"
        opacity={warm}
        style={{ mixBlendMode: 'soft-light' }}
      />
    </g>
  )
}
