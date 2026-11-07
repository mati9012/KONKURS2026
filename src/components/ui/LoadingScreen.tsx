'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import {
  PAPER_GRAIN,
  PARCHMENT_FILL,
  PARCHMENT_SHADOW,
  TORN_EDGES,
} from '@/components/ui/parchment'
import { ScrollRod } from '@/components/ui/ScrollRod'
import { useSceneReady } from '@/components/ui/useSceneReady'
import { createRandom } from '@/lib/noise'
import { textureUrl } from '@/lib/three/texture-url'

const OPEN_EASE = [0.65, 0, 0.25, 1] as const
const EXIT_EASE = [0.5, 0, 0.9, 0.4] as const
const OPEN_MS = 2200

function statusFor(progress: number) {
  if (progress < 0.35) return 'Rozwijamy mapę województwa'
  if (progress < 0.75) return 'Sadzimy lasy i stawiamy zamki'
  return 'Rozsuwamy chmury'
}

type Puff = {
  x: number
  y: number
  size: number
  tile: number
  flip: boolean
}

const TILE_POSITIONS = ['0% 0%', '100% 0%', '0% 100%', '100% 100%']

const LAYER_STYLE = {
  back: {
    width: 'w-[66vw]',
    fill: 'rgba(150, 156, 214, 0.9)',
    seedOffset: 0,
  },
  front: {
    width: 'w-[56vw]',
    fill: 'rgba(236, 214, 230, 0.95)',
    seedOffset: 50,
  },
}

function puffsFor(seed: number): Puff[] {
  const random = createRandom(seed)
  const puffs: Puff[] = []
  for (let y = -14; y < 110; y += 14) {
    const count = 2 + Math.floor(random() * 2)
    for (let i = 0; i < count; i++) {
      const inner = i === count - 1
      puffs.push({
        x: inner ? 62 + random() * 20 : random() * 45 - 10,
        y: y + random() * 8,
        size: inner ? 38 + random() * 16 : 48 + random() * 16,
        tile: Math.floor(random() * TILE_POSITIONS.length),
        flip: random() < 0.5,
      })
    }
  }
  return puffs
}

type CurtainProps = {
  side: 'left' | 'right'
  layer: 'back' | 'front'
  open: boolean
  reduceMotion: boolean
}

function Curtain({ side, layer, open, reduceMotion }: CurtainProps) {
  const style = LAYER_STYLE[layer]
  const puffs = useMemo(
    () => puffsFor((side === 'left' ? 1385 : 1569) + style.seedOffset),
    [side, style.seedOffset],
  )
  const away = side === 'left' ? '-120vw' : '120vw'
  const duration = reduceMotion ? 0.6 : layer === 'back' ? 1.9 : 1.6
  const delay = layer === 'back' ? 0.15 : 0
  const travel = reduceMotion ? { opacity: 0 } : { x: away, opacity: [1, 1, 0] }
  const outer = side === 'left' ? 'to right' : 'to left'

  return (
    <motion.div
      className={`absolute inset-y-0 ${side === 'left' ? 'left-0' : 'right-0'} ${style.width} min-w-[300px] ${open ? 'will-change-transform' : ''}`}
      initial={false}
      animate={open ? travel : { x: '0vw', opacity: 1 }}
      transition={{
        duration,
        delay,
        ease: EXIT_EASE,
        opacity: { duration, delay, times: [0, 0.7, 1], ease: 'linear' },
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${outer}, ${style.fill} 0%, ${style.fill} 45%, transparent 78%)`,
        }}
      />
      <div className="absolute inset-0">
        {puffs.map((puff, index) => (
          <div
            key={index}
            className="absolute aspect-square bg-no-repeat"
            style={{
              [side]: `${puff.x}%`,
              top: `${puff.y}%`,
              width: `${puff.size}vmax`,
              translate: side === 'left' ? '-50% -50%' : '50% -50%',
              backgroundImage: `url(${textureUrl(`loading-clouds-${layer}.webp`)})`,
              backgroundSize: '200% 200%',
              backgroundPosition: TILE_POSITIONS[puff.tile],
              scale: puff.flip ? '-1 1' : '1 1',
            }}
          />
        ))}
      </div>
    </motion.div>
  )
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
      <Curtain side="left" layer="back" open={ready} reduceMotion={reduceMotion} />
      <Curtain side="right" layer="back" open={ready} reduceMotion={reduceMotion} />
      <Curtain side="left" layer="front" open={ready} reduceMotion={reduceMotion} />
      <Curtain side="right" layer="front" open={ready} reduceMotion={reduceMotion} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <AnimatePresence>{!ready && <Parchment progress={progress} />}</AnimatePresence>
      </div>
    </div>
  )
}
