'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { StagePanel } from '@/components/ui/StagePanel'
import { WatercolorDefs } from '@/components/watercolor/WatercolorDefs'
import { CHASE_HINTS, CHASE_ROUNDS, CHASE_STOP_NAMES } from '@/content/lublin'
import type { ChaseStopId } from '@/content/lublin'
import { OldTownPanorama } from '@/levels/lublin/art/OldTownPanorama'
import { oldTownGeometry, stopX } from '@/levels/lublin/old-town'
import type { SceneLayout } from '@/levels/lublin/scene-layout'
import { DevilSprite } from '@/levels/zwierzyniec/art/DevilSprite'
import { GoatSprite } from '@/levels/zwierzyniec/art/GoatSprite'

const SHAKE_MS = 450
const FINISH_MS = 3000
const RUN = { duration: 1.4, ease: 'easeInOut' } as const

type ChaseStageProps = {
  layout: SceneLayout
  round: number
  playing: boolean
  onRound: (round: number) => void
}

export function ChaseStage({ layout, round, playing, onRound }: ChaseStageProps) {
  const { world, unit, portrait } = layout
  const plan = CHASE_ROUNDS[Math.min(round, CHASE_ROUNDS.length - 1)]
  const geometry = useMemo(() => oldTownGeometry(layout), [layout])
  const panorama = useMemo(
    () => (
      <svg viewBox={`0 0 ${geometry.width} ${world.height}`} className="absolute inset-0 size-full">
        <WatercolorDefs />
        <OldTownPanorama layout={layout} geometry={geometry} />
      </svg>
    ),
    [layout, geometry, world.height],
  )
  const [reached, setReached] = useState(0)
  const [shaking, setShaking] = useState<ChaseStopId | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const done = reached >= plan.stops.length
  const next = done ? null : plan.stops[reached]
  const index = round * plan.stops.length + reached
  const goatX = stopX(geometry, index - 1) - (index === 0 ? 0 : 200 * geometry.scale)
  const devilX = stopX(geometry, index) + 180 * geometry.scale
  const cameraX = goatX + world.width * (portrait ? 0.15 : 0.2)
  const actorScale = unit * (portrait ? 1.5 : 1.3)
  const actorBox = 220 * actorScale
  const widthShare = (geometry.width / world.width) * 100

  useEffect(() => {
    if (!shaking) return
    const timer = setTimeout(() => setShaking(null), SHAKE_MS)
    return () => clearTimeout(timer)
  }, [shaking])

  useEffect(() => {
    if (!done) return
    const timer = setTimeout(() => onRound(round), FINISH_MS)
    return () => clearTimeout(timer)
  }, [done, round, onRound])

  function choose(stop: ChaseStopId) {
    if (!playing || !next) return
    if (stop !== next.id) {
      setShaking(stop)
      setMessage(CHASE_HINTS.wrong)
      return
    }
    setReached(reached + 1)
    setMessage(next.fact)
  }

  return (
    <div className="absolute inset-0 overflow-clip select-none" data-chase data-reached={index}>
      <motion.div
        className="absolute inset-y-0 left-0 transform-gpu"
        style={{ width: `${widthShare}%` }}
        initial={false}
        animate={{ x: `${((world.width / 2 - cameraX) / geometry.width) * 100}%` }}
        transition={RUN}
      >
        {panorama}
        {[
          {
            key: 'devil',
            x: devilX,
            y: geometry.ground - 70 * unit,
            art: <DevilSprite cracking={false} />,
          },
          { key: 'goat', x: goatX, y: geometry.ground + 30 * unit, art: <GoatSprite /> },
        ].map((actor) => (
          <motion.div
            key={actor.key}
            className="absolute inset-y-0 left-0 will-change-transform"
            style={{ width: `${(actorBox / geometry.width) * 100}%` }}
            initial={false}
            animate={{ x: `${(actor.x / actorBox - 0.5) * 100}%` }}
            transition={RUN}
          >
            <svg viewBox={`${-actorBox / 2} 0 ${actorBox} ${world.height}`} className="size-full">
              <g transform={`translate(0 ${actor.y}) scale(${actorScale})`}>{actor.art}</g>
            </svg>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {playing && next && (
          <motion.div
            key={`ways-${next.id}`}
            role="group"
            aria-label="Drogowskazy"
            className="absolute inset-x-0 bottom-3 flex flex-wrap justify-center gap-2 px-3 sm:bottom-6 sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {next.options.map((option) => (
              <motion.button
                key={option}
                type="button"
                data-way={option}
                className="rounded-l-md rounded-r-2xl border-2 border-[#5a3a20] bg-[#e9c88e] py-2 pr-5 pl-3 font-display text-base font-bold text-[#3a2414] shadow-lg hover:bg-[#f3d9a6] sm:text-lg"
                animate={shaking === option ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
                onClick={() => choose(option)}
              >
                <span aria-hidden="true" className="mr-1.5">
                  ➜
                </span>
                {CHASE_STOP_NAMES[option]}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {playing && (
          <motion.section
            key="chase-panel"
            aria-label="Stare Miasto"
            className="pointer-events-none absolute inset-x-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StagePanel
              title={plan.title}
              icon={<span aria-hidden="true">🏰</span>}
              counter={`Skrzyżowania: ${reached} / ${plan.stops.length}`}
              hint={message ?? CHASE_HINTS.start}
            >
              {next && (
                <p className="mt-2 text-sm font-bold text-[#5a4630] sm:text-base">
                  Wskazówka: {next.clue}
                </p>
              )}
            </StagePanel>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
