import { motion } from 'motion/react'
import { useMemo } from 'react'
import type { IngredientId } from '@/content/bilgoraj'
import { createRandom } from '@/lib/noise'

const INK = '#3a2614'

const SPECKS: Partial<Record<IngredientId, { color: string; size: number; count: number }>> = {
  potatoes: { color: '#e8cf8a', size: 9, count: 14 },
  quark: { color: '#fffdf4', size: 6, count: 18 },
  kasza: { color: '#7a4a24', size: 2.6, count: 60 },
  eggs: { color: '#f4c63a', size: 5, count: 10 },
  cream: { color: '#fffaf0', size: 4, count: 16 },
  mint: { color: '#5a9a4a', size: 3.4, count: 14 },
}

export type Crust = 'bald' | 'yeast'

type PierogTinProps = {
  width: number
  height: number
  added: readonly IngredientId[]
  crust: Crust | null
  baked: boolean
}

export function PierogTin({ width, height, added, crust, baked }: PierogTinProps) {
  const half = width / 2
  const depth = height
  const specks = useMemo(() => {
    const random = createRandom(42)
    return (Object.keys(SPECKS) as IngredientId[]).flatMap((id) => {
      const spec = SPECKS[id]
      if (!spec) return []
      return Array.from({ length: spec.count }, (_, index) => ({
        key: `${id}-${index}`,
        id,
        x: (random() * 2 - 1) * half * 0.86,
        y: (random() * 2 - 1) * depth * 0.32,
        r: spec.size * (0.7 + random() * 0.6),
        color: spec.color,
      }))
    })
  }, [half, depth])
  const filled = added.length > 0
  const topColor = baked
    ? crust === 'yeast'
      ? '#c98a3a'
      : '#a8682e'
    : crust === 'yeast'
      ? '#f2dca8'
      : '#d8c49a'

  return (
    <g>
      <ellipse
        cx={0}
        cy={depth * 0.62}
        rx={half * 1.1}
        ry={depth * 0.16}
        fill={INK}
        opacity={0.25}
      />
      <path
        d={`M${-half} ${-depth * 0.4}L${half} ${-depth * 0.4}L${half * 0.94} ${depth * 0.5}L${-half * 0.94} ${depth * 0.5}Z`}
        fill="#8a8a94"
        stroke={INK}
        strokeWidth={2}
      />
      <rect
        x={-half * 0.94}
        y={-depth * 0.4}
        width={half * 1.88}
        height={depth * 0.8}
        rx={6}
        fill="#5a5a62"
      />
      {filled && (
        <motion.rect
          x={-half * 0.92}
          width={half * 1.84}
          rx={6}
          fill={topColor}
          initial={false}
          animate={{ y: -depth * 0.38, height: depth * 0.76 }}
        />
      )}
      {(crust === null || crust === 'bald') &&
        specks
          .filter((speck) => added.includes(speck.id))
          .map((speck) => (
            <motion.circle
              key={speck.key}
              cx={speck.x}
              cy={speck.y}
              r={speck.r}
              fill={baked ? '#7a4a24' : speck.color}
              opacity={baked ? 0.45 : 1}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            />
          ))}
      {crust === 'yeast' && (
        <g>
          {[-0.5, 0, 0.5].map((share) => (
            <path
              key={share}
              d={`M${share * half - 18} ${-depth * 0.1}L${share * half + 18} ${depth * 0.1}`}
              stroke={baked ? '#8a5a24' : '#d8b878'}
              strokeWidth={3}
              strokeLinecap="round"
            />
          ))}
        </g>
      )}
      {baked && (
        <g className="rz-flicker" opacity={0.7}>
          {[-0.4, 0, 0.4].map((share) => (
            <path
              key={share}
              d={`M${share * half} ${-depth * 0.5}c-8 -14 8 -22 0 -36c-8 -14 8 -22 0 -36`}
              fill="none"
              stroke="#fff8ea"
              strokeWidth={4}
              strokeLinecap="round"
            />
          ))}
        </g>
      )}
      <rect
        x={-half}
        y={-depth * 0.42}
        width={width}
        height={depth * 0.06}
        rx={3}
        fill="#b8b8c2"
        stroke={INK}
        strokeWidth={1.6}
      />
    </g>
  )
}
