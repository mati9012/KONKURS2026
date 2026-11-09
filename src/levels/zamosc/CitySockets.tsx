'use client'

import { motion } from 'motion/react'
import { SOCKET_NAMES } from '@/content/zamosc'
import type { BuildingId } from '@/content/zamosc'
import { socketShape } from '@/levels/zamosc/art/city-pieces'
import { project, SPOTS } from '@/levels/zamosc/city-layout'
import type { CityLayout } from '@/levels/zamosc/city-layout'

const SOCKET_ORDER: readonly BuildingId[] = [
  'fortress',
  'houses',
  'grodzka',
  'market',
  'townhall',
  'palace',
  'collegiate',
  'academy',
]

type CitySocketsProps = {
  layout: CityLayout
  sockets: readonly BuildingId[]
  focus: BuildingId | null
  hovered: BuildingId | null
  onPick: (id: BuildingId) => void
}

export function CitySockets({ layout, sockets, focus, hovered, onPick }: CitySocketsProps) {
  const { width, height } = layout.world
  const glow = focus ? project(layout, SPOTS[focus]) : null
  const hit = layout.scale * 0.06

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="pointer-events-none absolute inset-0 size-full"
    >
      {glow && focus && (
        <motion.ellipse
          key={focus}
          cx={glow.x}
          cy={glow.y}
          rx={layout.scale * (focus === 'fortress' ? 1.2 : 0.3)}
          ry={layout.scale * layout.tilt * (focus === 'fortress' ? 0.75 : 0.22)}
          fill="#ffe7a3"
          style={{ mixBlendMode: 'soft-light' }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 0.9, 0.55], scale: 1 }}
          transition={{ duration: 1.2 }}
        />
      )}
      {SOCKET_ORDER.filter((id) => sockets.includes(id)).map((id) => {
        const { path, ring } = socketShape(layout, id)
        return (
          <g
            key={id}
            role="button"
            tabIndex={0}
            data-socket={id}
            aria-label={`Miejsce na planie: ${SOCKET_NAMES[id]}`}
            className="pointer-events-auto cursor-pointer outline-none"
            onClick={() => onPick(id)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return
              event.preventDefault()
              onPick(id)
            }}
          >
            <path
              d={path}
              fill="transparent"
              stroke="transparent"
              strokeWidth={ring ? hit : 0}
              pointerEvents="all"
            />
            <path
              className={hovered === id ? undefined : 'zw-pulse'}
              d={path}
              fill={ring ? 'none' : '#ffe7a3'}
              fillOpacity={hovered === id ? 0.7 : 0.35}
              stroke={hovered === id ? '#1f5c50' : '#f2b84b'}
              strokeWidth={(ring ? 5 : 3) * (hovered === id ? 1.6 : 1)}
              strokeDasharray="10 7"
              strokeLinejoin="round"
              pointerEvents="none"
            />
          </g>
        )
      })}
    </svg>
  )
}
