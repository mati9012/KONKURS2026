'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import {
  PAPER_GRAIN,
  PARCHMENT_FILL,
  PARCHMENT_SHADOW,
  TORN_EDGES,
} from '@/components/ui/parchment'
import { CloudCurtain } from '@/components/ui/CloudCurtain'
import { ScrollRod } from '@/components/ui/ScrollRod'
import { useSceneReady } from '@/components/ui/useSceneReady'

const OPEN_EASE = [0.65, 0, 0.25, 1] as const
const OPEN_MS = 2200

function statusFor(progress: number) {
  if (progress < 0.35) return 'Rozwijamy mapę województwa'
  if (progress < 0.75) return 'Sadzimy lasy i stawiamy zamki'
  return 'Rozsuwamy chmury'
}

function Parchment({ progress }: { progress: number }) {
  const percent = Math.round(progress * 100)

  return (
    <motion.div
      className="w-[min(86vw,420px)]"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24, scaleY: 0.15 }}
      transition={{ duration: 0.5, ease: OPEN_EASE }}
    >
      <ScrollRod />
      <div
        className="relative -my-1 px-8 pt-8 pb-7 text-center shadow-[0_24px_60px_rgba(40,25,70,0.4)]"
        style={{
          clipPath: TORN_EDGES,
          backgroundImage: `${PAPER_GRAIN}, ${PARCHMENT_FILL}`,
          boxShadow: PARCHMENT_SHADOW,
        }}
      >
        <p className="font-display text-xs font-semibold tracking-[0.32em] text-[#8a5a2b] uppercase">
          Wyprawa przez Lubelskie
        </p>
        <p className="mt-2 font-display text-5xl leading-none font-bold text-[#4a2f1a] drop-shadow-[0_1px_0_rgba(255,240,210,0.8)] sm:text-6xl">
          Czarcia Łapa
        </p>
        <div className="mx-auto mt-5 flex w-3/4 items-center gap-3 text-[#b8894f]">
          <span className="h-px flex-1 bg-current" />
          <span className="size-2 rotate-45 bg-current" />
          <span className="h-px flex-1 bg-current" />
        </div>
        <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-[#d8bd8c] shadow-[inset_0_1px_3px_rgba(80,45,15,0.45)]">
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,#c8964a,#9a5a26)]"
            initial={{ width: '0%' }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <p className="mt-3 font-display text-sm font-semibold text-[#6b4a2e]">
          {statusFor(progress)} · {percent}%
        </p>
      </div>
      <ScrollRod />
    </motion.div>
  )
}

export function LoadingScreen() {
  const { progress, ready } = useSceneReady()
  const reduceMotion = useReducedMotion() ?? false
  const [opened, setOpened] = useState(false)

  useEffect(() => {
    if (!ready) return
    const timer = setTimeout(() => setOpened(true), OPEN_MS)
    return () => clearTimeout(timer)
  }, [ready])

  if (opened) return null

  return (
    <div
      role="status"
      aria-label="Ładowanie gry"
      aria-busy={!ready}
      className={`fixed inset-0 z-50 overflow-hidden ${ready ? 'pointer-events-none' : ''}`}
    >
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(255,214,170,0.85),transparent_45%),linear-gradient(180deg,#5d76c6_0%,#98a5de_45%,#e9c4c8_80%,#ffc79e_100%)]"
        initial={false}
        animate={{ opacity: ready ? 0 : 1 }}
        transition={{ duration: 1.1, delay: 0.35, ease: 'easeOut' }}
      />
      <CloudCurtain open={ready} reduceMotion={reduceMotion} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <AnimatePresence>{!ready && <Parchment progress={progress} />}</AnimatePresence>
      </div>
    </div>
  )
}
