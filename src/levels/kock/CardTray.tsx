'use client'

import { AnimatePresence, motion } from 'motion/react'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'

export type TrayCard = { id: string; label: string; caption?: string; icon: ReactNode }

type CardTrayProps = {
  label: string
  cards: readonly TrayCard[]
  selected: string | null
  shaking: string | null
  dragged: string | null
  onSelect: (id: string) => void
  onDragStart: (id: string, event: ReactPointerEvent<HTMLElement>) => void
}

export function CardTray({
  label,
  cards,
  selected,
  shaking,
  dragged,
  onSelect,
  onDragStart,
}: CardTrayProps) {
  return (
    <motion.div
      role="group"
      aria-label={label}
      className="pointer-events-auto absolute inset-x-0 bottom-0 flex flex-wrap justify-center gap-2 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
    >
      <AnimatePresence>
        {cards.map((card) => (
          <motion.button
            key={card.id}
            type="button"
            layout
            aria-label={card.label}
            aria-pressed={selected === card.id}
            data-card={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={
              shaking === card.id
                ? { opacity: 1, y: 0, x: [0, -10, 10, -6, 6, 0] }
                : {
                    opacity: dragged === card.id ? 0.35 : 1,
                    y: selected === card.id ? -8 : 0,
                    x: 0,
                  }
            }
            exit={{ opacity: 0, scale: 0.6 }}
            className={`flex w-[5.4rem] cursor-grab touch-none flex-col items-center gap-0.5 rounded-xl border-2 px-1 pt-1 pb-1 font-display text-[0.68rem] leading-tight font-bold shadow-md select-none sm:w-28 sm:text-sm ${selected === card.id ? 'border-[#1f5c50] bg-[#e3efe0] text-[#1f3f36]' : 'border-[#b8894f] bg-[#fbf0d6] text-[#4a2f1a] hover:bg-[#fff6e2]'}`}
            onPointerDown={(event) => onDragStart(card.id, event)}
            onClick={(event) => {
              if (event.detail === 0) onSelect(card.id)
            }}
          >
            {card.icon}
            <span aria-hidden="true">{card.caption ?? card.label}</span>
          </motion.button>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
