'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { DragPosition } from '@/levels/kock/useCardDrag'

type DragGhostProps = {
  position: DragPosition
  over: boolean
  children: ReactNode
}

export function DragGhost({ position, over, children }: DragGhostProps) {
  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-40 will-change-transform"
      style={{ x: position.x, y: position.y }}
    >
      <div className="-translate-x-1/2 -translate-y-3/4">
        <motion.div
          initial={{ scale: 0.6 }}
          animate={{ scale: over ? 1.15 : 1, rotate: over ? 0 : -6 }}
          className="rounded-2xl border-2 border-[#b8894f] bg-[#fbf0d6]/90 p-1.5 shadow-[0_14px_30px_rgba(40,25,20,0.35)]"
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  )
}
