'use client'

import { AnimatePresence, motion } from 'motion/react'
import { StagePanel } from '@/components/ui/StagePanel'
import { BUILDING_NAMES } from '@/content/zamosc'
import type { BuildingId } from '@/content/zamosc'
import { BuildingIcon } from '@/levels/zamosc/art/BuildingIcon'

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
      className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <StagePanel
        title="Miasto idealne"
        icon={<BuildingIcon id="townhall" className="size-7" />}
        counter={`Zbudowano: ${progress} / ${total}`}
        hint={hint}
      />
      <div className="pointer-events-auto flex flex-wrap justify-center gap-2 px-3">
        <AnimatePresence>
          {cards.map((id) => (
            <motion.button
              key={id}
              type="button"
              layout
              aria-pressed={selected === id}
              aria-label={BUILDING_NAMES[id]}
              initial={{ opacity: 0, y: 20 }}
              animate={
                shaking === id
                  ? { opacity: 1, y: 0, x: [0, -10, 10, -6, 6, 0] }
                  : { opacity: 1, y: selected === id ? -8 : 0, x: 0 }
              }
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.35 }}
              className={`flex w-[5.6rem] flex-col items-center gap-0.5 rounded-xl border-2 px-1.5 pt-1.5 pb-1 font-display text-[0.7rem] leading-tight font-bold shadow-md select-none sm:w-28 sm:text-sm ${selected === id ? 'border-[#1f5c50] bg-[#e3efe0] text-[#1f3f36] shadow-[0_0_0_3px_rgba(242,184,75,0.8)]' : 'border-[#b8894f] bg-[#fbf0d6] text-[#4a2f1a] hover:bg-[#fff6e2]'}`}
              onClick={() => onSelect(id)}
            >
              <BuildingIcon id={id} className="size-10 sm:size-12" />
              <span aria-hidden="true">{BUILDING_NAMES[id]}</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}
