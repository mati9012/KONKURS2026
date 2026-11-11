import { motion } from 'motion/react'

const INK = '#2a1c14'
const GOLD = '#d9a83e'
const ARM = 104
const SPRING = { type: 'spring', stiffness: 60, damping: 9 } as const

function Pan() {
  return (
    <g>
      <path d="M0 0L-34 70M0 0L34 70" stroke={INK} strokeWidth={2} />
      <path d="M-40 70H40C30 92 -30 92 -40 70Z" fill={GOLD} stroke={INK} strokeWidth={3} />
    </g>
  )
}

export function JusticeScales({ tilt }: { tilt: number }) {
  const drop = Math.sin((tilt * Math.PI) / 180) * ARM
  const reach = Math.cos((tilt * Math.PI) / 180) * ARM
  return (
    <g>
      <path d="M-40 150H40L24 130H-24Z" fill={GOLD} stroke={INK} strokeWidth={3} />
      <rect x={-6} y={-10} width={12} height={142} fill={GOLD} stroke={INK} strokeWidth={3} />
      <motion.g initial={false} animate={{ rotate: tilt }} transition={SPRING}>
        <rect
          x={-110}
          y={-20}
          width={220}
          height={9}
          rx={4}
          fill={GOLD}
          stroke={INK}
          strokeWidth={3}
        />
      </motion.g>
      <circle cx={0} cy={-16} r={12} fill={GOLD} stroke={INK} strokeWidth={3} />
      <motion.g initial={false} animate={{ x: -reach, y: -16 - drop }} transition={SPRING}>
        <Pan />
      </motion.g>
      <motion.g initial={false} animate={{ x: reach, y: -16 + drop }} transition={SPRING}>
        <Pan />
      </motion.g>
    </g>
  )
}
