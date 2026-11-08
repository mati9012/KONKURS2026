'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import { PAPER_GRAIN, PARCHMENT_FILL, PARCHMENT_SHADOW } from '@/components/ui/parchment'
import { PlaceStamp } from '@/components/ui/PlaceStamp'
import { PLACES } from '@/content/places'
import { useGameStore } from '@/store/game-store'
import { useJourneyStore } from '@/store/journey-store'

function PassportBook({ onClose }: { onClose: () => void }) {
  const stamps = useGameStore((state) => state.stamps)
  const count = PLACES.filter((place) => stamps[place.id]).length

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div
      className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-[#2a1d3d]/55 p-3 backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.section
        role="dialog"
        aria-label="Paszport Lubelski"
        className="relative max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-2xl px-5 pt-6 pb-5 sm:px-8"
        style={{
          backgroundImage: `${PAPER_GRAIN}, ${PARCHMENT_FILL}`,
          boxShadow: `${PARCHMENT_SHADOW}, 0 24px 60px rgba(40, 25, 70, 0.45)`,
        }}
        initial={{ y: 30, rotate: -2, scale: 0.96 }}
        animate={{ y: 0, rotate: 0, scale: 1 }}
        exit={{ y: 30, scale: 0.96 }}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-xs font-semibold tracking-[0.3em] text-[#8a5a2b] uppercase">
              Wyprawa przez Lubelskie
            </p>
            <h2 className="font-display text-3xl font-bold text-[#4a2f1a] sm:text-4xl">
              Paszport Lubelski
            </h2>
            <p className="mt-1 text-sm font-semibold text-[#6b4a2e]">
              Zebrane pieczęcie: {count} / {PLACES.length}
            </p>
          </div>
          <button
            type="button"
            className="rounded-full bg-[#1f5c50] px-4 py-1.5 text-sm font-bold text-[#f6e7c8] shadow hover:bg-[#2a7363]"
            onClick={onClose}
          >
            Zamknij
          </button>
        </header>
        <ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4">
          {PLACES.map((place, index) => (
            <li key={place.id} className="flex justify-center">
              <PlaceStamp
                name={place.name}
                earned={Boolean(stamps[place.id])}
                className={`w-full max-w-28 ${index % 2 ? 'rotate-3' : '-rotate-2'}`}
              />
            </li>
          ))}
        </ul>
      </motion.section>
    </motion.div>
  )
}

export function Passport() {
  const open = useJourneyStore((state) => state.passportOpen)
  const showPassport = useJourneyStore((state) => state.showPassport)

  return (
    <AnimatePresence>
      {open && <PassportBook onClose={() => showPassport(false)} />}
    </AnimatePresence>
  )
}
