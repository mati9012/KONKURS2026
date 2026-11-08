'use client'

import { AnimatePresence, motion } from 'motion/react'
import { PAPER_GRAIN, PARCHMENT_FILL, PARCHMENT_SHADOW } from '@/components/ui/parchment'
import { BUILDING_NAMES } from '@/content/zamosc'
import type { BuildingId } from '@/content/zamosc'

type BuildPanelProps = {
  hint: string
  progress: number
  total: number
  cards: readonly BuildingId[]
  selected: BuildingId | null
  shaking: BuildingId | null
  onSelect: (id: BuildingId) => void
}

export function BuildPanel({
  hint,
  progress,
  total,
  cards,
  selected,
  shaking,
  onSelect,
}: BuildPanelProps) {
  return (
    <motion.section
      aria-label="Budowa miasta"
      className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="pointer-events-auto mx-auto mt-12 w-full max-w-2xl rounded-2xl px-4 py-3 sm:mt-14"
        style={{
          backgroundImage: `${PAPER_GRAIN}, ${PARCHMENT_FILL}`,
          boxShadow: `${PARCHMENT_SHADOW}, 0 12px 30px rgba(40, 25, 70, 0.3)`,
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-xs font-semibold tracking-[0.25em] text-[#8a5a2b] uppercase">
            Miasto idealne
          </p>
          <p className="font-display text-sm font-semibold text-[#6b4a2e]">
            Zbudowano: {progress} / {total}
          </p>
        </div>
        <p aria-live="polite" className="mt-1 text-sm font-semibold text-[#3d4f3a] sm:text-base">
          <span className="font-display font-bold text-[#1f5c50]">Szaro: </span>
          {hint}
        </p>
      </div>
      <div className="pointer-events-auto flex flex-wrap justify-center gap-2">
        <AnimatePresence>
          {cards.map((id) => (
            <motion.button
              key={id}
              type="button"
              layout
              aria-pressed={selected === id}
              initial={{ opacity: 0, y: 20 }}
              animate={
                shaking === id
                  ? { opacity: 1, y: 0, x: [0, -10, 10, -6, 6, 0] }
                  : { opacity: 1, y: 0, x: 0 }
              }
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.35 }}
              className={`rounded-xl border-2 px-3 py-2 font-display text-sm font-bold shadow-md select-none sm:text-base ${selected === id ? 'border-[#1f5c50] bg-[#1f5c50] text-[#f6e7c8]' : 'border-[#b8894f] bg-[#fbf0d6] text-[#4a2f1a] hover:bg-[#fff6e2]'}`}
              onClick={() => onSelect(id)}
            >
              {BUILDING_NAMES[id]}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}
