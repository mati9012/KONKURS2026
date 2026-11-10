'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'

type DragGhostProps = {
  x: number
  y: number
  over: boolean
  children: ReactNode
}

export function DragGhost({ x, y, over, children }: DragGhostProps) {
  return (
    <div
      className="pointer-events-none fixed z-40 -translate-x-1/2 -translate-y-3/4"
      style={{ left: x, top: y }}
    >
      <motion.div
        initial={{ scale: 0.6 }}
        animate={{ scale: over ? 1.15 : 1, rotate: over ? 0 : -6 }}
        className="rounded-2xl border-2 border-[#b8894f] bg-[#fbf0d6]/90 p-1.5 shadow-[0_14px_30px_rgba(40,25,20,0.35)]"
      >
        {children}
      </motion.div>
    </div>
  )
}
