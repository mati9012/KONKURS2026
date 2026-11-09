'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { PAPER_GRAIN, PARCHMENT_FILL, PARCHMENT_SHADOW } from '@/components/ui/parchment'
import { Icon } from '@/levels/zwierzyniec/art/Icon'
import type { IconName } from '@/levels/zwierzyniec/art/Icon'

type StagePanelProps = {
  title: string
  icon: IconName
  counter: string
  hint: string
  children?: ReactNode
}

export function StagePanel({ title, icon, counter, hint, children }: StagePanelProps) {
  return (
    <motion.div
      className="pointer-events-auto mx-auto mt-12 w-[calc(100%-1.5rem)] max-w-2xl rounded-2xl px-4 py-3 sm:mt-14"
      style={{
        backgroundImage: `${PAPER_GRAIN}, ${PARCHMENT_FILL}`,
        boxShadow: `${PARCHMENT_SHADOW}, 0 12px 30px rgba(40, 25, 20, 0.3)`,
      }}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-xs font-semibold tracking-[0.25em] text-[#8a5a2b] uppercase">
          {title}
        </p>
        <p className="flex items-center gap-1.5 font-display text-sm font-semibold text-[#6b4a2e]">
          <Icon name={icon} className="size-6" />
          {counter}
        </p>
      </div>
      <p aria-live="polite" className="mt-1 text-sm font-semibold text-[#3d4f3a] sm:text-base">
        <span className="font-display font-bold text-[#1f5c50]">Szaro: </span>
        {hint}
      </p>
      {children}
    </motion.div>
  )
}
